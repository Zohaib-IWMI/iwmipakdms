FROM python:3.10

RUN apt-get update \
		&& apt-get install -y --no-install-recommends \
			nodejs npm \
			gdal-bin libgdal-dev \
			libgeos-dev \
		&& rm -rf /var/lib/apt/lists/*
WORKDIR /python
COPY package.json .
RUN npm install
RUN pip3 install \
		shapely psycopg2 pandas matplotlib earthengine-api python-dotenv geopandas diskcache \
		numpy requests netCDF4 xarray rasterio rioxarray
COPY . .
CMD npm start

EXPOSE 8082
