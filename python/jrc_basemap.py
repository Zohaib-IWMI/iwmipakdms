import argparse
from shapely.geometry import shape
import psycopg2
import ee
import os
from dotenv import load_dotenv
import json
parser = argparse.ArgumentParser(
    description='Process JRC Layer')
parser.add_argument('--unit', type=str, required=True,
                    help='Boundary')

args = parser.parse_args()
unit = args.unit

# Load the .env file
load_dotenv()

try:
    connection = psycopg2.connect(user="iwmi",
                                    password="72342",
                                    host="spatialdb",
                                    port="5432",
                                    database="pakdms")
    cursor = connection.cursor()

    postgreSQL_select_Query = "select ST_AsGeoJSON(geom) as geometry from national"

    cursor.execute(postgreSQL_select_Query)
    unitrecords = cursor.fetchall()

    for row in unitrecords:
        wkt_string = json.loads(row[0])
    # Load values from environment variables
    service_account = os.getenv('SERVICE_ACCOUNT')
    private_key_file = os.getenv('PRIVATE_KEY_FILE')

    # Authenticate with the service account and private key
    credentials = ee.ServiceAccountCredentials(service_account, private_key_file)

    ee.Initialize(credentials)
    shapely_geometry = shape(wkt_string)
    geojson_geom = shapely_geometry.__geo_interface__
    geometry = ee.Geometry(geojson_geom)
    JRC_water = ee.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').clip(geometry)

    visualization = {
      'min': 0.0,
      'max': 100.0,
      'palette': ['ffffff', 'ffbbbb', '0000ff']
    }
    dict = JRC_water.getMapId(visualization)
    dict.update(visualization)
    print(json.dumps({'mapid': dict['mapid'], 'min': dict['min'],
                          'max': dict['max'], 'palette': dict['palette']}))

    
except (Exception, psycopg2.Error) as error:
    print("Error: ", error)

finally:
    if connection:
        cursor.close()
        connection.close()
