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
    
    # Filter the ESRI LULC ImageCollection for the 2023 date range and mosaic it
    esri_lulc_ts = ee.ImageCollection("projects/sat-io/open-datasets/landcover/ESRI_Global-LULC_10m_TS") \
        .filterDate('2023-01-01', '2023-12-31') \
        .filterBounds(geometry) \
        .mosaic() \
        .clip(geometry)
        
    lulc_visualization = {
        'min': 0,
        'max': 10,
        'palette': [
            "419BDF", "397D49", "88B053", "7A87C6", "E49635", "DFC35A",
            "C4281B", "A59B8F", "B39FE1", "DCD937"
        ]
    }
    lulc_map_dict = esri_lulc_ts.getMapId(lulc_visualization)
    lulc_map_dict.update(lulc_visualization)
    print(json.dumps({'mapid': lulc_map_dict['mapid'], 'min': lulc_map_dict['min'],
                          'max': lulc_map_dict['max'], 'palette': lulc_map_dict['palette']}))

    
except (Exception, psycopg2.Error) as error:
    print("Error: ", error)

finally:
    if connection:
        cursor.close()
        connection.close()
