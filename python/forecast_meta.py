import argparse
import json
import os
import sys
import tempfile
from typing import Any, Dict, Optional, Tuple

import numpy as np
import requests
import xarray as xr


def _guess_time_name(ds: xr.Dataset) -> Optional[str]:
    for name in ["time", "forecast_time", "valid_time"]:
        if name in ds.dims or name in ds.coords:
            return name
    for name, coord in ds.coords.items():
        try:
            if np.issubdtype(coord.dtype, np.datetime64):
                return name
        except Exception:
            pass
    return None


def _as_label(v: Any) -> str:
    # datetime64 -> ISO-ish
    try:
        if isinstance(v, np.datetime64):
            s = str(v)
            return s.replace("T", " ")
    except Exception:
        pass

    # cftime objects / pandas timestamps / python datetimes
    for attr in ("isoformat",):
        try:
            fn = getattr(v, attr, None)
            if callable(fn):
                return str(fn())
        except Exception:
            pass

    try:
        return str(v)
    except Exception:
        return ""


def _emit_result(payload: Dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(payload))
    sys.stdout.flush()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--assetUrl", required=True)
    ap.add_argument("--maxTimes", type=int, default=int(os.getenv("FORECAST_META_MAX_TIMES", "300")))
    args = ap.parse_args()

    with tempfile.TemporaryDirectory() as td:
        nc_path = os.path.join(td, "input.nc")

        r = requests.get(args.assetUrl, stream=True, timeout=600)
        r.raise_for_status()
        with open(nc_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

        # Prefer decoded times when possible.
        ds = None
        used_decode = True
        try:
            ds = xr.open_dataset(nc_path, decode_times=True)
        except Exception:
            used_decode = False
            ds = xr.open_dataset(nc_path, decode_times=False)

        time_name = _guess_time_name(ds)
        if not time_name:
            _emit_result({"success": True, "timeName": None, "timeCount": 1, "timeLabels": [{"label": "T1", "value": 0}], "decodeTimes": used_decode})
            return

        # Determine time count
        tcount = 1
        if time_name in ds.dims:
            try:
                tcount = int(ds.sizes.get(time_name, 1) or 1)
            except Exception:
                tcount = 1
        elif time_name in ds.coords:
            try:
                tcount = int(np.asarray(ds[time_name].values).size or 1)
            except Exception:
                tcount = 1

        tcount = max(1, tcount)

        labels = []
        try:
            vals = None
            if time_name in ds.coords:
                vals = np.asarray(ds[time_name].values)
            if vals is None or vals.size == 0:
                raise ValueError("No time coordinate values")

            # Limit label list to avoid huge payloads
            limit = max(1, int(args.maxTimes) or 300)
            take = min(int(vals.size), limit)
            for i in range(take):
                labels.append({"label": _as_label(vals[i]) or f"T{i+1}", "value": i})

            if int(vals.size) > take:
                labels.append({"label": f"… ({int(vals.size) - take} more)", "value": take})
        except Exception:
            labels = [{"label": f"T{i+1}", "value": i} for i in range(min(tcount, max(1, int(args.maxTimes) or 300)))]

        _emit_result({"success": True, "timeName": time_name, "timeCount": int(tcount), "timeLabels": labels, "decodeTimes": used_decode})


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        sys.stdout.write(json.dumps({"success": False, "message": str(e)}))
        sys.stdout.flush()
        raise
