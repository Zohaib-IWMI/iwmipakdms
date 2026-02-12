import argparse
import json
import os
import sys
import tempfile
import time
from typing import Any, Dict, Optional, Tuple

import numpy as np
import requests
import xarray as xr


def _emit_progress(percent: int, message: str) -> None:
    percent = max(0, min(100, int(percent)))
    sys.stdout.write(f"PROGRESS:{percent}:{message}\n")
    sys.stdout.flush()


def _emit_result(payload: Dict[str, Any]) -> None:
    sys.stdout.write("RESULT:" + json.dumps(payload) + "\n")
    sys.stdout.flush()


def _guess_lat_lon_names(ds: xr.Dataset) -> Tuple[Optional[str], Optional[str]]:
    candidates_lat = ["lat", "latitude", "y"]
    candidates_lon = ["lon", "longitude", "x"]

    def pick(cands):
        for name in cands:
            if name in ds.coords:
                return name
            if name in ds.variables:
                return name
        return None

    return pick(candidates_lat), pick(candidates_lon)


def _guess_time_name(ds: xr.Dataset) -> Optional[str]:
    for name in ["time", "forecast_time", "valid_time"]:
        if name in ds.dims:
            return name
        if name in ds.coords:
            return name
    # fallback: any dim with datetime-like values
    for name, coord in ds.coords.items():
        try:
            if np.issubdtype(coord.dtype, np.datetime64):
                return name
        except Exception:
            pass
    return None


def _pick_data_var(ds: xr.Dataset, lat_name: Optional[str], lon_name: Optional[str]) -> str:
    # Prefer variables that contain lat/lon dims.
    for name, var in ds.data_vars.items():
        if lat_name and lon_name and lat_name in var.dims and lon_name in var.dims:
            if var.dtype.kind not in ("U", "S"):
                return name
    # Otherwise: first numeric 2D+ variable
    for name, var in ds.data_vars.items():
        if len(var.dims) >= 2 and var.dtype.kind not in ("U", "S"):
            return name
    raise ValueError("No suitable data variable found in NetCDF")


def _bounds_edges_from_centers(values: np.ndarray) -> Tuple[float, float, float]:
    values = np.asarray(values).astype(float)
    if values.size < 2:
        step = 0.0
    else:
        diffs = np.diff(values)
        diffs = diffs[np.isfinite(diffs) & (diffs != 0)]
        step = float(np.median(np.abs(diffs))) if diffs.size else 0.0
    vmin = float(np.nanmin(values))
    vmax = float(np.nanmax(values))
    half = step / 2.0 if step else 0.0
    return vmin - half, vmax + half, step


def _normalize_grid(data2d: np.ndarray, lats: np.ndarray, lons: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    # Ensure lats are descending (north->south) and lons ascending (west->east)
    lats = np.asarray(lats).astype(float)
    lons = np.asarray(lons).astype(float)
    data2d = np.asarray(data2d)

    if lats.size >= 2 and lats[0] < lats[-1]:
        lats = lats[::-1]
        data2d = data2d[::-1, :]

    if lons.size >= 2 and lons[0] > lons[-1]:
        lons = lons[::-1]
        data2d = data2d[:, ::-1]

    return data2d, lats, lons


def _write_geotiff(temp_tif: str, data2d: np.ndarray, lats: np.ndarray, lons: np.ndarray, nodata: float) -> Dict[str, Any]:
    import rasterio
    from rasterio.transform import from_origin

    west, east, xstep = _bounds_edges_from_centers(lons)
    south, north, ystep = _bounds_edges_from_centers(lats)

    # lats provided are descending, so north is max edge.
    transform = from_origin(west, north, xstep or 0.01, ystep or 0.01)

    profile = {
        "driver": "GTiff",
        "height": int(data2d.shape[0]),
        "width": int(data2d.shape[1]),
        "count": 1,
        "dtype": str(data2d.dtype),
        "crs": "EPSG:4326",
        "transform": transform,
        "tiled": True,
        "blockxsize": 256,
        "blockysize": 256,
        "compress": "DEFLATE",
        "predictor": 2,
        "zlevel": 6,
        "nodata": nodata,
    }

    with rasterio.open(temp_tif, "w", **profile) as dst:
        dst.write(data2d, 1)
        bounds = dst.bounds

    return {
        "bounds4326": {
            "west": float(bounds.left),
            "south": float(bounds.bottom),
            "east": float(bounds.right),
            "north": float(bounds.top),
        },
        "xstep": float(xstep or 0.0),
        "ystep": float(ystep or 0.0),
    }


def _clip_geotiff(src_tif: str, dst_tif: str, clip_geojson: Dict[str, Any], nodata: float) -> Dict[str, Any]:
    import rasterio
    from rasterio.mask import mask

    # Accept FeatureCollection / Feature / geometry
    geoms = []
    if not clip_geojson:
        geoms = []
    elif isinstance(clip_geojson, dict) and isinstance(clip_geojson.get("features"), list):
        for f in clip_geojson.get("features"):
            g = (f or {}).get("geometry")
            if g:
                geoms.append(g)
    elif isinstance(clip_geojson, dict) and clip_geojson.get("type") == "Feature":
        g = clip_geojson.get("geometry")
        if g:
            geoms.append(g)
    elif isinstance(clip_geojson, dict) and clip_geojson.get("type") and clip_geojson.get("coordinates"):
        geoms.append(clip_geojson)

    with rasterio.open(src_tif) as src:
        if geoms:
            # District/tehsil boundaries can be extremely detailed (many vertices), which makes
            # rasterize/mask slow. Simplify geometries to ~pixel tolerance to speed up clipping
            # without changing the visual result at raster resolution.
            try:
                from shapely.geometry import mapping, shape
                from shapely.ops import unary_union

                px = float(abs(getattr(src.transform, "a", 0.0)) or 0.0)
                py = float(abs(getattr(src.transform, "e", 0.0)) or 0.0)
                pixel = max(px, py) or 0.01
                factor = float(os.getenv("FORECAST_CLIP_SIMPLIFY_FACTOR", "1.0") or "1.0")
                tol = max(0.0, pixel * max(0.0, factor))

                shp_list = []
                for g in geoms:
                    if not g:
                        continue
                    try:
                        shp_list.append(shape(g))
                    except Exception:
                        continue

                if shp_list:
                    merged = unary_union(shp_list)
                    if not merged.is_empty:
                        if not merged.is_valid:
                            merged = merged.buffer(0)
                        if tol > 0:
                            merged = merged.simplify(tol, preserve_topology=True)
                        geoms = [mapping(merged)]
            except Exception:
                # If shapely isn't available or simplification fails, fall back to original geometry.
                pass

            out_image, out_transform = mask(src, geoms, crop=True, nodata=nodata, filled=True)
            out_meta = src.meta.copy()
            out_meta.update({
                "height": out_image.shape[1],
                "width": out_image.shape[2],
                "transform": out_transform,
                "nodata": nodata,
                "compress": "DEFLATE",
                "predictor": 2,
                "zlevel": 6,
                "tiled": True,
                "blockxsize": 256,
                "blockysize": 256,
            })
        else:
            out_image = src.read()
            out_transform = src.transform
            out_meta = src.meta.copy()

    with rasterio.open(dst_tif, "w", **out_meta) as dest:
        dest.write(out_image)
        bounds = dest.bounds

    band = out_image[0] if out_image.ndim == 3 else out_image
    band = np.asarray(band)
    valid_mask = np.isfinite(band) & (band != nodata)
    total_inside = int(band.size)
    total_valid = int(np.count_nonzero(valid_mask))

    return {
        "bounds4326": {
            "west": float(bounds.left),
            "south": float(bounds.bottom),
            "east": float(bounds.right),
            "north": float(bounds.top),
        },
        "_band_stats": {
            "totalInside": total_inside,
            "totalValid": total_valid,
        },
    }


def _walk_coords(coords, bump):
    if not isinstance(coords, list):
        return
    if coords and isinstance(coords[0], (int, float)):
        bump(coords)
        return
    for c in coords:
        _walk_coords(c, bump)


def _geojson_bounds(geojson: Dict[str, Any]) -> Optional[Tuple[float, float, float, float]]:
    min_lon = float("inf")
    min_lat = float("inf")
    max_lon = float("-inf")
    max_lat = float("-inf")

    def bump(coord):
        nonlocal min_lon, min_lat, max_lon, max_lat
        if not coord or len(coord) < 2:
            return
        lon = float(coord[0])
        lat = float(coord[1])
        if not np.isfinite(lon) or not np.isfinite(lat):
            return
        min_lon = min(min_lon, lon)
        max_lon = max(max_lon, lon)
        min_lat = min(min_lat, lat)
        max_lat = max(max_lat, lat)

    def as_features(g):
        if not g:
            return []
        if isinstance(g, dict) and isinstance(g.get("features"), list):
            return g["features"]
        if isinstance(g, dict) and g.get("type") == "Feature":
            return [g]
        if isinstance(g, dict) and isinstance(g.get("type"), str) and g.get("coordinates") is not None:
            return [{"type": "Feature", "properties": {}, "geometry": g}]
        return []

    for f in as_features(geojson):
        geom = (f or {}).get("geometry")
        if not geom:
            continue
        _walk_coords(geom.get("coordinates"), bump)

    if not np.isfinite(min_lon) or not np.isfinite(min_lat):
        return None
    return (min_lon, min_lat, max_lon, max_lat)


def _subset_to_bounds(
    data2d: np.ndarray,
    lats: np.ndarray,
    lons: np.ndarray,
    bounds: Tuple[float, float, float, float],
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    west, south, east, north = bounds
    if lats.size < 2 or lons.size < 2:
        return data2d, lats, lons

    # Estimate step sizes for a tiny padding (2 cells) so the clip boundary doesn't sit exactly on the edge.
    dy = np.diff(lats)
    dy = dy[np.isfinite(dy) & (dy != 0)]
    ystep = float(np.median(np.abs(dy))) if dy.size else 0.0

    dx = np.diff(lons)
    dx = dx[np.isfinite(dx) & (dx != 0)]
    xstep = float(np.median(np.abs(dx))) if dx.size else 0.0

    pad_y = (ystep * 2.0) if ystep else 0.0
    pad_x = (xstep * 2.0) if xstep else 0.0

    # lats are descending (north->south). Select indices that intersect the bbox.
    lat_mask = (lats <= (north + pad_y)) & (lats >= (south - pad_y))
    lon_mask = (lons >= (west - pad_x)) & (lons <= (east + pad_x))

    lat_idx = np.where(lat_mask)[0]
    lon_idx = np.where(lon_mask)[0]
    if lat_idx.size == 0 or lon_idx.size == 0:
        return data2d, lats, lons

    i0 = int(lat_idx.min())
    i1 = int(lat_idx.max()) + 1
    j0 = int(lon_idx.min())
    j1 = int(lon_idx.max()) + 1

    return data2d[i0:i1, j0:j1], lats[i0:i1], lons[j0:j1]


def _coverage_stats(index_key: str, band: np.ndarray, nodata: float) -> Dict[str, Any]:
    k = (index_key or "SPI").upper()
    band = np.asarray(band).astype(float)
    valid = np.isfinite(band) & (band != nodata)

    total_inside = int(band.size)
    total_valid = int(np.count_nonzero(valid))
    if total_valid == 0:
        return {
            "totalInside": total_inside,
            "totalValid": total_valid,
            "items": [],
        }

    vals = band[valid]
    items = []

    if k == "SPI":
        counts = {
            "Normal": int(np.count_nonzero(vals >= -0.5)),
            "Mild": int(np.count_nonzero((vals >= -1.0) & (vals < -0.5))),
            "Moderate": int(np.count_nonzero((vals >= -1.5) & (vals < -1.0))),
            "Severe": int(np.count_nonzero((vals >= -2.0) & (vals < -1.5))),
            "Extreme": int(np.count_nonzero(vals < -2.0)),
        }
        order = ["Normal", "Mild", "Moderate", "Severe", "Extreme"]
    elif k == "NSPI":
        counts = {
            "Normal": int(np.count_nonzero(vals < 0.5)),
            "Mild": int(np.count_nonzero((vals >= 0.5) & (vals < 0.6))),
            "Moderate": int(np.count_nonzero((vals >= 0.6) & (vals < 0.7))),
            "High": int(np.count_nonzero((vals >= 0.7) & (vals < 0.8))),
            "Severe": int(np.count_nonzero(vals >= 0.8)),
        }
        order = ["Normal", "Mild", "Moderate", "High", "Severe"]
    else:
        # Match JS Math.round for non-negative categories.
        rounded = np.floor(vals + 0.5).astype(int)
        counts = {
            "Normal": int(np.count_nonzero(rounded <= 0)),
            "Watch": int(np.count_nonzero(rounded == 1)),
            "Alert": int(np.count_nonzero(rounded == 2)),
            "Warning": int(np.count_nonzero(rounded == 3)),
            "Emergency": int(np.count_nonzero(rounded >= 4)),
        }
        order = ["Normal", "Watch", "Alert", "Warning", "Emergency"]

    for label in order:
        cnt = int(counts.get(label, 0))
        pct = (cnt / total_valid) * 100.0 if total_valid else 0.0
        items.append({"label": label, "count": cnt, "pct": float(pct)})

    return {
        "totalInside": total_inside,
        "totalValid": total_valid,
        "items": items,
    }


def _publish_to_geoserver(
    geoserver_url: str,
    workspace: str,
    store_name: str,
    coverage_name: str,
    geotiff_path: str,
    user: str,
    password: str,
) -> None:
    # Upload GeoTIFF as a new coverage store and auto-configure the layer.
    rest_base = geoserver_url.rstrip("/")
    if not rest_base.endswith("/geoserver"):
        # allow passing http://geoserver:8080/geoserver or http://.../geoserver
        pass

    endpoint = (
        f"{rest_base}/rest/workspaces/{workspace}/coveragestores/{store_name}/file.geotiff"
        f"?configure=first&coverageName={coverage_name}"
    )

    with open(geotiff_path, "rb") as f:
        r = requests.put(
            endpoint,
            data=f,
            headers={"Content-Type": "image/tiff"},
            auth=(user, password),
            timeout=600,
        )

    if r.status_code not in (200, 201, 202):
        raise RuntimeError(f"GeoServer publish failed: {r.status_code} {r.text[:500]}")


def _sld_for_index(index_key: str) -> Tuple[str, str]:
    k = (index_key or "SPI").upper()
    if k not in ("SPI", "NSPI", "ALERT"):
        k = "SPI"

    style_name = f"pakdms_forecast_{k.lower()}"

    if k == "SPI":
        entries = [
            ("-9999", "#000000", "No data", "0"),
            # Frontend legend logic is: >= -0.5 Normal, >= -1 Mild, >= -1.5 Moderate, >= -2 Severe, else Extreme.
            # GeoServer interval boundaries are inclusive (<= quantity), so we use a tiny epsilon below each threshold.
            ("-2.000001", "#E74C3C", "Extreme", "1"),
            ("-1.500001", "#F39C12", "Severe", "1"),
            ("-1.000001", "#F4D03F", "Moderate", "1"),
            ("-0.500001", "#00C7D4", "Mild", "1"),
            ("9999", "#1E5BFF", "Normal", "1"),
        ]
        cmap_type = "intervals"
    elif k == "NSPI":
        entries = [
            ("-9999", "#000000", "No data", "0"),
            # Frontend legend logic is: < 0.5 Normal, < 0.6 Mild, < 0.7 Moderate, < 0.8 High, else Severe.
            # Use epsilon to keep 0.5 classified as Mild (not Normal), etc.
            ("0.499999", "#2E7D32", "Normal", "1"),
            ("0.599999", "#66BB6A", "Mild", "1"),
            ("0.699999", "#FBC02D", "Moderate", "1"),
            ("0.799999", "#FB8C00", "High", "1"),
            ("9999", "#C62828", "Severe", "1"),
        ]
        cmap_type = "intervals"
    else:
        entries = [
            ("-9999", "#000000", "No data", "0"),
            # Frontend legend rounds values (Math.round). We approximate with mid-point breaks.
            ("0.499999", "#F9F6EE", "Normal", "1"),
            ("1.499999", "#fff9ae", "Watch", "1"),
            ("2.499999", "#F9A825", "Alert", "1"),
            ("3.499999", "#EF6C00", "Warning", "1"),
            ("9999", "#C62828", "Emergency", "1"),
        ]
        cmap_type = "intervals"

    entries_xml = "\n".join(
        [
            f"              <ColorMapEntry color=\"{color}\" quantity=\"{qty}\" label=\"{label}\" opacity=\"{opacity}\"/>"
            for (qty, color, label, opacity) in entries
        ]
    )

    sld = f"""<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<StyledLayerDescriptor version=\"1.0.0\" xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd\">
  <NamedLayer>
    <Name>{style_name}</Name>
    <UserStyle>
      <Title>PakDMS Forecast {k}</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>1.0</Opacity>
            <ColorMap type=\"{cmap_type}\" extended=\"true\">
{entries_xml}
            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
"""
    return style_name, sld


def _ensure_style(rest_base: str, style_name: str, sld_body: str, user: str, password: str) -> None:
    # Check if style exists
    get_url = f"{rest_base}/rest/styles/{style_name}.sld"
    r = requests.get(get_url, auth=(user, password), timeout=60)
    if r.status_code == 200:
        return
    if r.status_code not in (404,):
        raise RuntimeError(f"GeoServer style check failed: {r.status_code} {r.text[:200]}")

    create_url = f"{rest_base}/rest/styles?name={style_name}"
    r2 = requests.post(
        create_url,
        data=sld_body.encode("utf-8"),
        headers={"Content-Type": "application/vnd.ogc.sld+xml"},
        auth=(user, password),
        timeout=60,
    )
    if r2.status_code not in (200, 201):
        raise RuntimeError(f"GeoServer style create failed: {r2.status_code} {r2.text[:300]}")


def _set_layer_default_style(rest_base: str, workspace: str, layer_name: str, style_name: str, user: str, password: str) -> None:
    url = f"{rest_base}/rest/layers/{workspace}:{layer_name}.json"
    payload = {"layer": {"defaultStyle": {"name": style_name}}}
    r = requests.put(
        url,
        json=payload,
        headers={"Content-Type": "application/json"},
        auth=(user, password),
        timeout=60,
    )
    if r.status_code not in (200, 201):
        raise RuntimeError(f"GeoServer set style failed: {r.status_code} {r.text[:300]}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--assetUrl", required=True)
    ap.add_argument("--timeIndex", type=int, default=0)
    ap.add_argument("--indexKey", default="SPI")
    ap.add_argument("--clipGeojson", required=False)
    ap.add_argument("--clipUrl", required=False)
    ap.add_argument("--workspace", default=os.getenv("GEOSERVER_WORKSPACE", "PakDMS"))
    ap.add_argument("--storeName", required=True)
    ap.add_argument("--geoserverUrl", default=os.getenv("GEOSERVER_INTERNAL_URL", "http://geoserver:8080/geoserver"))
    ap.add_argument("--geoserverUser", default=os.getenv("GEOSERVER_ADMIN_USER", "admin"))
    ap.add_argument("--geoserverPass", default=os.getenv("GEOSERVER_ADMIN_PASSWORD", "geoserver"))
    args = ap.parse_args()

    clip_geojson = None
    if args.clipGeojson:
        try:
            clip_geojson = json.loads(args.clipGeojson)
        except Exception:
            clip_geojson = None
    elif args.clipUrl:
        _emit_progress(10, "Fetching clip geometry")
        try:
            resp = requests.get(args.clipUrl, timeout=120)
            resp.raise_for_status()
            clip_geojson = resp.json()
        except Exception:
            clip_geojson = None

    _emit_progress(5, "Downloading NetCDF")

    with tempfile.TemporaryDirectory() as td:
        nc_path = os.path.join(td, "input.nc")
        tmp_unclipped = os.path.join(td, "unclipped.tif")
        tmp_clipped = os.path.join(td, "clipped.tif")

        r = requests.get(args.assetUrl, stream=True, timeout=600)
        r.raise_for_status()
        with open(nc_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

        _emit_progress(20, "Reading NetCDF")

        # xarray can open classic NetCDF too.
        ds = xr.open_dataset(nc_path, decode_times=False)

        lat_name, lon_name = _guess_lat_lon_names(ds)
        if not lat_name or not lon_name:
            raise RuntimeError("Unable to find lat/lon variables")

        time_name = _guess_time_name(ds)
        data_var_name = _pick_data_var(ds, lat_name, lon_name)

        da = ds[data_var_name]
        if time_name and time_name in da.dims:
            tsize = int(da.sizes.get(time_name, 1) or 1)
            tsel = max(0, min(int(args.timeIndex), tsize - 1))
            da = da.isel({time_name: tsel})

        # Squeeze any remaining singleton dims
        da = da.squeeze()

        if lat_name not in da.dims or lon_name not in da.dims:
            raise RuntimeError("Selected variable is not a lat/lon grid")

        data2d = np.asarray(da.values)
        lats = np.asarray(ds[lat_name].values)
        lons = np.asarray(ds[lon_name].values)

        # Ensure 2D
        if data2d.ndim != 2:
            # Try to reduce to last 2 dims
            while data2d.ndim > 2:
                data2d = data2d[0]
            if data2d.ndim != 2:
                raise RuntimeError(f"Unsupported variable shape: {da.shape}")

        # Replace insane / fill values with NaN then set nodata
        data2d = data2d.astype("float32", copy=False)
        data2d[~np.isfinite(data2d)] = np.nan
        data2d[np.abs(data2d) > 1e20] = np.nan

        # Choose a nodata that won't collide with valid ranges
        nodata = float(os.getenv("FORECAST_NODATA", "-9999"))
        data2d, lats, lons = _normalize_grid(data2d, lats, lons)

        # Fill NaN with nodata for GeoTIFF writing
        data_filled = np.where(np.isfinite(data2d), data2d, nodata).astype("float32")

        # Speed: if we have a clip geometry, subset to its bbox before writing GeoTIFF.
        # This avoids writing/clipping the full grid when the region is small.
        clip_bounds = _geojson_bounds(clip_geojson) if clip_geojson else None
        if clip_bounds:
            _emit_progress(40, "Subsetting to region")
            data_filled, lats, lons = _subset_to_bounds(data_filled, lats, lons, clip_bounds)

        _emit_progress(50, "Writing GeoTIFF")
        meta0 = _write_geotiff(tmp_unclipped, data_filled, lats, lons, nodata)

        _emit_progress(70, "Clipping")
        meta1 = _clip_geotiff(tmp_unclipped, tmp_clipped, clip_geojson, nodata)
        band_stats = (meta1.get("_band_stats") or {})

        # Compute legend bucket percentages for the Stats panel
        try:
            import rasterio

            with rasterio.open(tmp_clipped) as src:
                band = src.read(1)
            coverage_stats = _coverage_stats(args.indexKey, band, nodata)
        except Exception:
            coverage_stats = {
                "totalInside": band_stats.get("totalInside", 0),
                "totalValid": band_stats.get("totalValid", 0),
                "items": [],
            }

        _emit_progress(90, "Publishing to GeoServer")
        coverage_name = args.storeName
        _publish_to_geoserver(
            args.geoserverUrl,
            args.workspace,
            args.storeName,
            coverage_name,
            tmp_clipped,
            args.geoserverUser,
            args.geoserverPass,
        )

        # Apply styling so WMS renders with the same colors as the legend.
        try:
            rest_base = args.geoserverUrl.rstrip("/")
            style_name, sld_body = _sld_for_index(args.indexKey)
            _ensure_style(rest_base, style_name, sld_body, args.geoserverUser, args.geoserverPass)

            # Wait until GeoServer has registered the new layer (it can be async)
            layer_rest = f"{rest_base}/rest/layers/{args.workspace}:{coverage_name}.json"
            for _ in range(30):
                r = requests.get(layer_rest, auth=(args.geoserverUser, args.geoserverPass), timeout=30)
                if r.status_code == 200:
                    break
                time.sleep(1)
            else:
                raise RuntimeError("GeoServer layer did not become available within timeout")

            # Set default style with a few retry attempts
            for _ in range(6):
                try:
                    _set_layer_default_style(rest_base, args.workspace, coverage_name, style_name, args.geoserverUser, args.geoserverPass)
                    break
                except Exception:
                    time.sleep(1)
            else:
                raise RuntimeError("Failed to assign style after retries")
        except Exception as e:
            # Styling failure should not break the main rendering; default raster style will be used.
            _emit_progress(95, f"Style skipped: {str(e)[:80]}")
            style_name = None

        bounds = meta1.get("bounds4326") or meta0.get("bounds4326")
        _emit_progress(100, "Done")
        _emit_result(
            {
                "workspace": args.workspace,
                "storeName": args.storeName,
                "layerName": coverage_name,
                "dataVar": data_var_name,
                "bounds4326": bounds,
                "styleName": style_name,
                "coverageStats": coverage_stats,
            }
        )


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        sys.stdout.write(f"ERROR:{str(e)}\n")
        sys.stdout.flush()
        raise
