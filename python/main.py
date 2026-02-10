import argparse
import shapely
from shapely.ops import unary_union
import psycopg2
import geopandas as gpd
import os
import json
import diskcache as dc
from Indices import getIndice
import io
import sys

cache = dc.Cache('./diskcache')

parser = argparse.ArgumentParser(
    description='Process start and end dates and GeoJSON file path.')
parser.add_argument('--startmonth', type=str, required=True,
                    help='Selected Date month MMMM')
parser.add_argument('--endmonth', type=str, required=True,
                    help='Selected Date month MMMM')
parser.add_argument('--startyear', type=str, required=True,
                    help='Selected date year in format YYYY')
parser.add_argument('--endyear', type=str, required=True,
                    help='Selected date year in format YYYY')
parser.add_argument('--unit', type=str, required=True,
                    help='Administrative Unit')
parser.add_argument('--name', type=str, required=True, help='Admin unit Name')
parser.add_argument('--aggr', type=str, required=True,
                    help='Aggregation value')
parser.add_argument('--indice', type=str, required=True, help='Indice')
parser.add_argument('--calctype', type=str,
                    required=True, help='Caculation Type')
parser.add_argument('--precipitation', type=str,
                    required=True, help='Precipitation Threshold')
parser.add_argument('--months', type=str,
                    required=False, help='No. of months')
parser.add_argument('--drawnfeature', type=str,
                    required=False, help='If feature is drawn, send geometry as geojson')
parser.add_argument('--filename', type=str,
                    required=False, help='Uploaded shapefile name')
parser.add_argument('--boundaryselect', type=str,
                    required=False, help='Selected boundary type')
parser.add_argument('--graphoption', type=str,
                    required=False, help='Selected graph type')
parser.add_argument('--max', type=str,
                    required=False, help='Selected max value')
parser.add_argument('--min', type=str,
                    required=False, help='Selected min value')

args = parser.parse_args()

startmonth = args.startmonth
endmonth = args.endmonth
startyear = args.startyear
endyear = args.endyear
unit = args.unit
name = args.name
aggr = args.aggr
indice = args.indice
calctype = args.calctype
precipitation = args.precipitation
months = args.months
drawnfeature = args.drawnfeature
boundaryselect = args.boundaryselect
filename = args.filename
graphoption = args.graphoption
max_value = args.max
min_value = args.min

# Normalize missing/empty boundaryselect values (frontend may omit this field)
if boundaryselect is None or str(boundaryselect).strip() == '' or str(boundaryselect).lower() == 'null':
    boundaryselect = "0"

connection = psycopg2.connect(user="iwmi",
                                    password="72342",
                                    host="spatialdb",
                                    port="5432",
                                    database="pakdms")
cursor = connection.cursor()

BASE_DIR = '/uploads/'

try:
    if boundaryselect == "2" and drawnfeature:
        wkt_string = json.loads(drawnfeature)
    elif boundaryselect == "1" and filename:
        gdf = gpd.read_file(os.path.join(BASE_DIR + filename))
        # Perform unary union of the geometries
        combined_geometry = unary_union(gdf.geometry)

        # Get the __geo_interface__ property, which returns a dictionary
        geojson_geometry = combined_geometry.__geo_interface__

        # Remove 'bbox' if it exists
        # if "bbox" in geojson_geometry:
            # del geojson_geometry["bbox"]

        # Convert the dictionary to a properly formatted GeoJSON string
        wkt_string = json.loads(json.dumps(geojson_geometry))
    elif boundaryselect == "0":
        if unit == "undefined":
            postgreSQL_select_Query = "select ST_AsGeoJSON(geom) as geometry from national"
        else:
            postgreSQL_select_Query = f"select ST_AsGeoJSON(geom) as geometry from {unit} where name='{name}'"
        
        cursor.execute(postgreSQL_select_Query)
        unitrecords = cursor.fetchall()

        for row in unitrecords:
            wkt_string = json.loads(row[0])
    
    cache_key = f"{startmonth}_{endmonth}_{startyear}_{wkt_string}_{aggr}_{indice}_{calctype}_{precipitation}_{months}_{graphoption}_{min_value}_{max_value}"
    if cache_key in cache:
        print(cache[cache_key])  # Retrieve and print cached result
    else:
        # Redirect JSON output of getIndice to a variable.
        # IMPORTANT: always restore stdout even if getIndice raises.
        old_stdout = sys.stdout
        temp_stdout = io.StringIO()
        try:
            sys.stdout = temp_stdout
            getIndice(
                startmonth,
                endmonth,
                startyear,
                endyear,
                wkt_string,
                aggr,
                indice,
                calctype,
                precipitation,
                months,
                graphoption,
                min_value,
                max_value,
            )
        finally:
            sys.stdout = old_stdout  # Restore original stdout

        result = temp_stdout.getvalue()
        cache[cache_key] = result  # Cache the result
        print(result)
except (Exception, psycopg2.Error) as error:
    print("Error: ", error)

finally:
    if connection:
        cursor.close()
        connection.close()
