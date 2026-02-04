# Stage 0: Convert NetCDF files to NETCDF3_CLASSIC for client-side parsing
FROM python:3.11-slim as nc-convert

WORKDIR /work
COPY src/ncreader/nc_files ./nc_files

RUN pip install --no-cache-dir netCDF4 numpy

RUN python - <<'PY'
import os
import glob
import numpy as np
from netCDF4 import Dataset

in_dir = '/work/nc_files'
out_dir = '/work/out'
os.makedirs(out_dir, exist_ok=True)

def normalize_attr(val):
	if isinstance(val, (bytes, bytearray)):
		try:
			return val.decode('utf-8')
		except Exception:
			return str(val)
	if isinstance(val, np.generic):
		return val.item()
	if isinstance(val, np.ndarray):
		if val.dtype == object:
			return [normalize_attr(x) for x in val.tolist()]
		return val
	return val

def safe_dtype(dtype):
	dt = np.dtype(dtype)
	if dt == np.dtype('int64'):
		return np.dtype('int32')
	if dt == np.dtype('uint64'):
		return np.dtype('uint32')
	return dt

def convert_file(src_path, dst_path):
	ds_in = Dataset(src_path, 'r')
	try:
		ds_out = Dataset(dst_path, 'w', format='NETCDF3_CLASSIC')
		try:
			# Global attrs
			for a in ds_in.ncattrs():
				try:
					setattr(ds_out, a, normalize_attr(getattr(ds_in, a)))
				except Exception:
					pass

			# Dimensions
			for name, dim in ds_in.dimensions.items():
				ds_out.createDimension(name, None if dim.isunlimited() else len(dim))

			# Variables
			for name, var_in in ds_in.variables.items():
				# Skip NetCDF4 string variables (rare for our use); attributes are handled.
				if getattr(var_in.dtype, 'kind', None) in ('U', 'S') and var_in.dtype.itemsize == 0:
					continue

				dt = safe_dtype(var_in.dtype)
				fill_value = None
				if '_FillValue' in var_in.ncattrs():
					fv = var_in.getncattr('_FillValue')
					try:
						fill_value = np.array(fv).astype(dt).item() if np.isscalar(fv) else fv
					except Exception:
						fill_value = None

				var_out = ds_out.createVariable(
					name,
					dt,
					var_in.dimensions,
					fill_value=fill_value
				)

				# Variable attrs (except _FillValue)
				for a in var_in.ncattrs():
					if a == '_FillValue':
						continue
					try:
						var_out.setncattr(a, normalize_attr(var_in.getncattr(a)))
					except Exception:
						pass

				# Data
				try:
					data = var_in[...]
					if isinstance(data, np.ndarray) and np.dtype(data.dtype) != dt:
						data = data.astype(dt)
					var_out[...] = data
				except Exception:
					pass
		finally:
			ds_out.close()
	finally:
		ds_in.close()


for src in glob.glob(os.path.join(in_dir, '*.nc')):
	if src.endswith('_classic.nc'):
		continue
	base = os.path.basename(src)
	dst = os.path.join(out_dir, base[:-3] + '_classic.nc')
	if os.path.exists(dst):
		continue
	print(f'Converting {base} -> {os.path.basename(dst)}')
	try:
		convert_file(src, dst)
	except Exception as e:
		print('Conversion failed:', base, e)

PY

# Stage 1
FROM node:20-alpine as build-stage

# RUN apt-get update && apt-get upgrade

WORKDIR /frontend
COPY package.json ./
# Resilient install (network hiccups are common in CI/build hosts)
RUN npm config set fund false \
 && npm config set audit false \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set registry https://registry.npmjs.org/

RUN --mount=type=cache,target=/root/.npm npm install --no-audit --no-fund --prefer-offline
COPY . .

# Copy converted *_classic.nc files from conversion stage
COPY --from=nc-convert /work/out/ ./src/ncreader/nc_files/
RUN npm run build

# Stage 2

FROM nginx:1.17.0-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build-stage /frontend/build /usr/share/nginx/html
EXPOSE $REACT_DOCKER_PORT
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN apk add --no-cache curl

# Add a simple entrypoint that waits for dependent services (geoserver) to be resolvable and healthy
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]