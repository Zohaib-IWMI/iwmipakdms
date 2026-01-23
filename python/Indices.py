import ee
import argparse
from shapely import wkt
import pandas as pd
import matplotlib.pyplot as plt
from shapely.geometry import shape
import json
from spi_calc import computeSPI
from collections import defaultdict
import concurrent.futures
import requests
import re
import os
import datetime
from dotenv import load_dotenv
import sys
from ee_assets import *
import logging

# Load the .env file
load_dotenv()

sys.setrecursionlimit(100000)

def getIndice(analysis_startmonth, analysis_endmonth, analysis_startyear, analysis_endyear, wkt_string, aggr, indice, calctype, precipitation, month_user, graphoption, min_visValue, max_visValue):
    service_account = os.getenv('SERVICE_ACCOUNT')
    private_key_file = os.getenv('PRIVATE_KEY_FILE')

    # Authenticate with the service account and private key
    credentials = ee.ServiceAccountCredentials(service_account, private_key_file)

    logging.getLogger('ee').setLevel(logging.ERROR)

    ee.Initialize(credentials)

    shapely_geometry = shape(wkt_string)

    geojson_geom = shapely_geometry.__geo_interface__

    geometry = ee.Geometry(geojson_geom)
    analysis_startmonth = int(analysis_startmonth)
    analysis_endmonth = int(analysis_endmonth)
    analysis_startyear = int(analysis_startyear)
    analysis_endyear = int(analysis_endyear)
    image_dataset = ee.ImageCollection([])

    analysis_startdate = ee.Date.fromYMD(analysis_startyear, analysis_startmonth, 1)
    analysis_enddate = ee.Date.fromYMD(analysis_endyear, analysis_endmonth, 1)

    def _add_one_month(year, month):
        if month == 12:
            return year + 1, 1
        return year, month + 1

    def _get_mod16_et_pet_collection():
        """Return ET/PET ImageCollection for the requested period.

        MODIS/061/MOD16A2GF is available through 2024-12-26.
        For dates after that, use MODIS/061/MOD16A2.

        Note: Earth Engine filterDate uses an exclusive end date.
        We use 2024-12-27 as the exclusive boundary so 2024-12-26 is included.
        """
        end_ex_year, end_ex_month = _add_one_month(analysis_endyear, analysis_endmonth)
        analysis_start_py = datetime.date(analysis_startyear, analysis_startmonth, 1)
        analysis_end_exclusive_py = datetime.date(end_ex_year, end_ex_month, 1)

        gf_end_exclusive_py = datetime.date(2024, 12, 27)
        gf_end_exclusive = ee.Date('2024-12-27')
        ee_end_exclusive = analysis_enddate.advance(1, 'month')

        if analysis_end_exclusive_py <= gf_end_exclusive_py:
            return ee.ImageCollection('MODIS/061/MOD16A2GF') \
                .filterBounds(geometry) \
                .filterDate(analysis_startdate, ee_end_exclusive)

        if analysis_start_py >= gf_end_exclusive_py:
            return ee.ImageCollection('MODIS/061/MOD16A2') \
                .filterBounds(geometry) \
                .filterDate(analysis_startdate, ee_end_exclusive)

        gf_part = ee.ImageCollection('MODIS/061/MOD16A2GF') \
            .filterBounds(geometry) \
            .filterDate(analysis_startdate, gf_end_exclusive)

        mod16_part = ee.ImageCollection('MODIS/061/MOD16A2') \
            .filterBounds(geometry) \
            .filterDate(gf_end_exclusive, ee_end_exclusive)

        return gf_part.merge(mod16_part)

    
    def monthlyMean(dataset):
        # Extract the min and max date from the dataset
        date_range = dataset.reduceColumns(ee.Reducer.minMax(), ['system:time_start'])

        # Get the start and end dates
        start_date = ee.Date(date_range.get('min'))
        end_date = ee.Date(date_range.get('max'))

        # Extract the year and month information from start and end dates
        start_year = start_date.get('year').getInfo()
        end_year = end_date.get('year').getInfo()
        start_month = start_date.get('month').getInfo()
        end_month = end_date.get('month').getInfo()

        # Function to calculate the monthly image for a specific year and month
        def create_monthly_image(year, month):
            # Create start and end dates for the specific month of the specific year
            start_date = ee.Date.fromYMD(year, month, 1)
            end_date = start_date.advance(1, 'month')

            # Filter the dataset by this date range
            month_collection = dataset.filterDate(start_date, end_date)

            # Calculate the monthly mean for that month
            monthly_mean = month_collection.mean()

            # Set metadata with year and month
            monthly_mean = monthly_mean.set({'year': year, 'month': month})
            return monthly_mean

        # Function to calculate available months for a given year
        def get_available_months(year):
            year = ee.Number(year)
            return ee.List.sequence(
                ee.Algorithms.If(year.eq(start_year), start_month, 1),  # If it's the start year, start from `start_month`
                ee.Algorithms.If(year.eq(end_year), end_month, 12)      # If it's the end year, end at `end_month`
            )

        # List of years to iterate over
        years = ee.List.sequence(start_year, end_year)

        # Map over each year to create monthly images based on available months for that year
        def year_month_combination(year):
            year = ee.Number(year)
            # Retrieve available months for this year
            months = get_available_months(year)

            # Map over months and calculate the monthly mean image for each month
            return months.map(lambda month: create_monthly_image(year, ee.Number(month)))

        # Flatten the result into a single ImageCollection
        year_month_images = years.map(year_month_combination).flatten()
        monthly_mean_collection = ee.ImageCollection(year_month_images)

        return monthly_mean_collection

    def add_smci_fldas_band(img):
        month = ee.Number(img.get('month')).toInt()
        Mins = ee.Image(fldas_min.get(month)).clip(geometry)
        Maxs = ee.Image(fldas_max.get(month)).clip(geometry)
        SMCI = img.select('SoilMoi00_10cm_tavg').subtract(Mins).divide(
            Maxs.subtract(Mins)).rename('SMCI_FLDAS')
        return img.addBands(SMCI)
        
    def add_smci_smap_band(img):
        month = ee.Number(img.get('month')).toInt()
        Mins = ee.Image(smap_min.get(month)).clip(geometry)
        Maxs = ee.Image(smap_max.get(month)).clip(geometry)
        SMCI = img.select('sm_surface').subtract(Mins).divide(
            Maxs.subtract(Mins)).rename('SMCI_SMAP')
        return img.addBands(SMCI)

    def add_tci_band(img):
        month = ee.Number(img.get('month')).toInt()
        Mint = ee.Image(lst_min.get(month)).clip(geometry)
        Maxt = ee.Image(lst_max.get(month)).clip(geometry)
        TCI = (Maxt.subtract(img.select('LST_Day_1km'))).divide((Maxt.subtract(Mint))).rename('TCI')
        return img.addBands(TCI)

    def add_vci_band(img):
        month = ee.Number(img.get('month')).toInt()
        MinNDVI = ee.Image(ndvi_min.get(month)).clip(geometry)
        MaxNDVI = ee.Image(ndvi_max.get(month)).clip(geometry)
        VCI = (img.select('NDVI')).subtract(MinNDVI).divide(
            (MaxNDVI.subtract(MinNDVI))).rename('VCI')
        return img.addBands(VCI)

    def add_vhi_band(img):
        VHI = img.select('VCI').add(img.select('TCI')).multiply(0.5).rename('VHI')
        return img.addBands(VHI)

    def add_mai_band(img):
        MAI = img.select('ET').divide(
            img.select('PET')).rename('MAI')
        return img.addBands(MAI)

    def add_cwd_band(img):
        CWD = img.normalizedDifference(['PET', 'ET']).rename('CWD')
        return img.addBands(CWD)

    def add_ndvi_anamoly_band(img):
        img = img.clip(geometry)
        month = ee.Number(img.get('month')).toInt()
        Mean = ee.Image(ndvi_mean.get(month)).clip(geometry)
        Std = ee.Image(ndvi_std.get(month)).clip(geometry)
        NDVI_Anamoly = img.subtract(Mean).divide(
            Std).rename('NDVI_Anamoly')
        return img.addBands(NDVI_Anamoly)

    def add_ndwi_band(img):
        NDWI = img.normalizedDifference(
            ['sur_refl_b04', 'sur_refl_b02']).rename('NDWI')
        return img.addBands(NDWI)

    def add_pci_band(img):
        month = ee.Number(img.get('month')).toInt()
        Minp = ee.Image(prec_min.get(month)).clip(geometry)
        Maxp = ee.Image(prec_max.get(month)).clip(geometry)
        PCI = img.select('total_precipitation_sum').subtract(
            Minp).divide(Maxp.subtract(Minp)).rename('PCI')
        return img.addBands(PCI)

    def add_dryday_band(img):
        return img.addBands(ee.Image.constant(0).uint8().rename('DrySpell'))

    # def add_spi_era5l_band(img):
        # mean_precip = ee.Image('projects/ee-iwmipk/assets/mean_prec_ERA5L').clip(geometry).rename('precip')
        # std_precip = ee.Image('projects/ee-iwmipk/assets/std_prec_ERA5L').clip(geometry).rename('precip')
        # def calculate_spi(img, months):
            # month = ee.Number(img.get('month')).toInt()
            # combined_months = ee.Number.parse(ee.String(months).cat(month.format()))
            # end_date = ee.Date(img.get('system:time_start'))
            # start_date = end_date.advance(-months, 'month')
            # summed_precip = image_dataset.filterDate(start_date, end_date).sum().clip(geometry).rename('precip')
            # mean_precip = ee.Image(spi_mean.get(combined_months)).clip(geometry).rename('precip')
            # std_precip = ee.Image(spi_std.get(combined_months)).clip(geometry).rename('precip')
            # SPI = ((summed_precip.subtract(mean_precip)).divide(std_precip)).rename('SPI_ERA5L')
            # return img.addBands(SPI)
        # img = calculate_spi(img, int(month_user))
        # return img
    def add_spi_era5l_band(img):
        SPI = img.rename('SPI_ERA5L')
        return img.addBands(SPI)
    def add_spi_chirps_band(img):
        mean_precip = ee.Image('projects/ee-iwmipk/assets/mean_prec_CHIRPS').clip(geometry).rename('precip')
        std_precip = ee.Image('projects/ee-iwmipk/assets/std_prec_CHIRPS').clip(geometry).rename('precip')
        def calculate_spi(img, months):
            end_date = ee.Date(img.get('system:time_start'))
            start_date = end_date.advance(-months, 'month')
            summed_precip = image_dataset.filterDate(start_date, end_date).sum().clip(geometry).rename('precip')
            SPI = ((summed_precip.subtract(mean_precip)).divide(std_precip)).rename('SPI_CHIRPS')
            return img.addBands(SPI)
        img = calculate_spi(img, int(month_user))
        return img
    def add_sma_band(img):
        img = img.clip(geometry)
        month = ee.Number(img.get('month')).toInt()
        Mean = ee.Image(sma_mean.get(month)).clip(geometry)
        Std = ee.Image(sma_std.get(month)).clip(geometry)
        SMA = img.subtract(Mean).divide(
            Std).rename('SMA_WAPOR')
        return img.addBands(SMA)
    def add_rdi_band(img):
        img = img.clip(geometry)
        month = ee.Number(img.get('month')).toInt()
        Mean = ee.Image(rdi_mean.get(month)).clip(geometry)
        Std = ee.Image(rdi_std.get(month)).clip(geometry)
        RDI = img.subtract(Mean).divide(
            Std).rename('RDI_WAPOR')
        return img.addBands(RDI)
    def add_esi_band(img):
        img = img.clip(geometry)
        month = ee.Number(img.get('month')).toInt()
        Mean = ee.Image(esi_mean.get(month)).clip(geometry)
        Std = ee.Image(esi_std.get(month)).clip(geometry)
        RDI = img.subtract(Mean).divide(
            Std).rename('ESI_WAPOR')
        return img.addBands(RDI)
    def add_npp_anamoly_band(img):
        img = img.clip(geometry)
        month = ee.Number(img.get('month')).toInt()
        Mean = ee.Image(npp_mean.get(month)).clip(geometry)
        Std = ee.Image(npp_std.get(month)).clip(geometry)
        NPP = img.subtract(Mean).divide(
            Std).rename('NPP_Anamoly_WAPOR')
        return img.addBands(NPP)
    
    match indice:
        case 'SMCI_FLDAS':
            fldas = ee.ImageCollection(
                    'NASA/FLDAS/NOAH01/C/GL/M/V001').filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            fldas = monthlyMean(fldas)
            soil = fldas.select('SoilMoi00_10cm_tavg')
            soil = soil.map(add_smci_fldas_band)
            img_collection = soil.select(indice)
            indiceVis = {
                'min': 0.1,
                'max': 0.4,
                'palette': [
                    'FF0000',  # 5: Red
                    'FFA500',  # 4: Orange
                    'FFFF00',  # 3: Yellow
                    '00FFFF',  # 2: Cyan
                    '0000FF'   # 1: Blue
                ]
            }
        case 'SMCI_SMAP':
            fldas = ee.ImageCollection(
                    'NASA/SMAP/SPL4SMGP/008').filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            fldas = monthlyMean(fldas)
            soil = fldas.select('sm_surface')
            soil = soil.map(add_smci_smap_band)
            img_collection = soil.select(indice)
            indiceVis = {
                'min': 0.1,
                'max': 0.4,
                'palette': [
                    'FF0000',  # 5: Red
                    'FFA500',  # 4: Orange
                    'FFFF00',  # 3: Yellow
                    '00FFFF',  # 2: Cyan
                    '0000FF'   # 1: Blue
                ]
            }
        case 'TCI':
            lst = ee.ImageCollection(
                    'MODIS/061/MOD11A2').filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            lst = monthlyMean(lst)
            lst = lst.select('LST_Day_1km')
            lst = lst.map(add_tci_band)
            img_collection = lst.select(indice)
            indiceVis = {
                'min': 0.1,
                'max': 0.4,
                'palette': [
                    'FF0000',    # Extreme: Red
                    'FFA500',    # Severe: Orange
                    'FFFF00',    # Moderate: Yellow
                    '008000',    # Mild: Green
                    '006400'     # No drought: Dark Green
                ]
            }
        case 'VCI':
            ndvi = ee.ImageCollection(
                    'MODIS/061/MOD13A1').filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            ndvi = monthlyMean(ndvi)
            ndvi = ndvi.select('NDVI')
            ndvi = ndvi.map(add_vci_band)
            img_collection = ndvi.select(indice)
            indiceVis = {
                'min': 0.1,
                'max': 0.4,
                'palette': [
                    'FF0000',    # Extreme: Red
                    'FFA500',    # Severe: Orange
                    'FFFF00',    # Moderate: Yellow
                    '008000',    # Mild: Green
                    '006400'     # No drought: Dark Green
                ]
            }
        case 'VHI':
            ndvi = ee.ImageCollection(
                    'MODIS/061/MOD13A1').filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            ndvi = monthlyMean(ndvi)
            ndvi = ndvi.select('NDVI')
            ndvi = ndvi.map(add_vci_band)
            vci_collection = ndvi.select('VCI')
            lst = ee.ImageCollection(
                    'MODIS/061/MOD11A2').filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            lst = monthlyMean(lst)
            lst = lst.select('LST_Day_1km')
            lst = lst.map(add_tci_band)
            tci_collection = lst.select('TCI')
            mer = vci_collection.combine(tci_collection)
            mer = mer.map(add_vhi_band)
            img_collection = mer.select(indice)
            indiceVis = {
                'min': 0.1,
                'max': 0.4,
                'palette': [
                    'FF0000',    # Extreme: Red
                    'FFA500',    # Severe: Orange
                    'FFFF00',    # Moderate: Yellow
                    '008000',    # Mild: Green
                    '006400'     # No drought: Dark Green
                ]
            }
        case 'NDVI_Anamoly':
            ndvi = ee.ImageCollection(
                    'MODIS/061/MOD13A1').filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            ndvi = monthlyMean(ndvi)
            ndvi = ndvi.select('NDVI')
            ndvi = ndvi.map(add_ndvi_anamoly_band)
            img_collection = ndvi.select(indice)
            indiceVis = {
                'min': -0.5,
                'max': 0,
                'palette': [
                    'FF0000',    # Extreme: Red
                    'FFA500',    # Severe: Orange
                    'FFFF00',    # Moderate: Yellow
                    '008000',    # Mild: Green
                    '006400'     # No drought: Dark Green
                ]
            }
        case 'MAI':
            ET_PET = _get_mod16_et_pet_collection()
            ET_PET = monthlyMean(ET_PET)
            ET_PET = ET_PET.select(['ET', 'PET'])
            mai = ET_PET.map(add_mai_band)
            img_collection = mai.select(indice)
            indiceVis = {
                'min': 0.2,
                'max': 0.8,
                'palette': [
                    'FF0000',  # 5: Red
                    'FFA500',  # 4: Orange
                    'FFFF00',  # 3: Yellow
                    '00FFFF',  # 2: Cyan
                    '0000FF'   # 1: Blue
                ]
            }
        case 'CWD':
            ET_PET = _get_mod16_et_pet_collection()
            ET_PET = monthlyMean(ET_PET)
            ET_PET = ET_PET.select(['PET', 'ET'])
            cwd = ET_PET.map(add_cwd_band)
            img_collection = cwd.select(indice)
            indiceVis = {
                'min': 0.35,
                'max': 0.80,
                'palette':[
                    '0000FF',  # 1: Blue
                    '00FFFF',  # 2: Cyan
                    'FFFF00',  # 3: Yellow
                    'FFA500',  # 4: Orange
                    'FF0000',  # 5: Red   
                ]
            }
        case 'PCI':
            precip = ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR").filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            precip = monthlyMean(precip)
            precip = precip.select('total_precipitation_sum')
            precip = precip.map(add_pci_band)
            img_collection = precip.select(indice)
            indiceVis = {
                'min': 0.1,
                'max': 0.4,
                'palette': [
                    'FF0000',  # 5: Red
                    'FFA500',  # 4: Orange
                    'FFFF00',  # 3: Yellow
                    '00FFFF',  # 2: Cyan
                    '0000FF'   # 1: Blue
                ]
            }
        case 'DrySpell':
            precip = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR").filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            datain_t = precip.select("total_precipitation_sum").map(
                add_dryday_band).sort('system:time_start')

            # create first image for iteration
            first = ee.List([ee.Image(datain_t.first())])

            def drySpells(img, list):
                # get previous image
                prev = ee.Image(ee.List(list).get(-1))
                # find areas gt precipitation threshold (gt==0, lt==1)
                dry = img.select('total_precipitation_sum').lt(
                    float(precipitation) / 1000)
                # add previous day DrySpell to today's DrySpell
                accum = prev.select('DrySpell').add(dry).rename('DrySpell')
                # create a result image for iteration
                # precip < thresh will equall the accumulation of DrySpells
                # otherwise it will equal zero
                out = img.select('total_precipitation_sum').addBands(
                    img.select('DrySpell').where(dry.eq(1), accum)).uint8()
                return ee.List(list).add(out)

            img_collection = ee.ImageCollection.fromImages(
                datain_t.iterate(drySpells, first)).select('DrySpell').max()
            maximum_dict = img_collection.reduceRegion(
                reducer=ee.Reducer.max(),
                geometry=geometry,
                bestEffort=True
            )
            maximum_value = ee.Number(maximum_dict.get('DrySpell')).toInt()
            indiceVis = {
                'min': 0,
                'max': maximum_value.getInfo(),
                'palette': [
                    '0000FF',  # 1: Blue
                    '00FFFF',  # 2: Cyan
                    'FFFF00',  # 3: Yellow
                    'FFA500',  # 4: Orange
                    'FF0000',  # 5: Red   
                ]
            }
        case 'SPI_ERA5L':
            precip = ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR").filterBounds(geometry)
            precip = precip.select('total_precipitation_sum')
            image_dataset = precip
            precip = precip.filterDate('1980',analysis_enddate.advance(1, 'month'))
            spi = computeSPI(precip,int(month_user),'month')
            spi = spi.map(add_spi_era5l_band)
            spi = spi.filterDate(analysis_startdate, analysis_enddate.advance(1, 'month'))
            spi = monthlyMean(spi)
            img_collection = spi.select(indice)
            indiceVis = {
                # Use full range for SPI legend and visualization so categories
                # can cover extreme dry to wet values. Palette maps from
                # extreme (red) -> no drought (blue).
                'min': -3.0,
                'max': 3.0,
                'palette': [
                    'FF0000',  # Extreme: Red
                    'FFA500',  # Severe: Orange
                    'FFFF00',  # Moderate: Yellow
                    '00FFFF',  # Mild: Cyan
                    '0000FF'   # No drought: Blue
                ]
            }
        case 'SPI_CHIRPS':
            # Function to get monthly precipitation sums based on the image collection's date range
            def get_monthly_precipitation(image_collection):
                # Determine the start and end dates of the image collection
                start = ee.Date(image_collection.first().get('system:time_start'))
                end = ee.Date(image_collection.sort('system:time_start', False).first().get('system:time_start'))
    
                # Generate a list of month offsets from the start date to the end date
                date_list = ee.List.sequence(0, end.difference(start, 'month').subtract(1))
    
                # Function to calculate monthly precipitation sum
                def monthly_precip(month_offset):
                    # Define the month start and end based on offset
                    month_start = start.advance(month_offset, 'month')
                    month_end = month_start.advance(1, 'month')
        
                    # Filter images for the specific month and calculate the sum
                    monthly_sum = image_collection.filterDate(month_start, month_end).sum()
        
                    # Set properties to identify the year and month
                    return monthly_sum.set('system:time_start', month_start.millis()) \
                          .set('month', month_start.get('month')) \
                          .set('year', month_start.get('year'))
    
                # Apply the monthly precipitation calculation to each month in the range
                monthly_collection = ee.ImageCollection(date_list.map(monthly_precip))
    
                return monthly_collection

            precip = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY').filterBounds(geometry)
            precip = precip.select('precipitation')
            precip = get_monthly_precipitation(precip)
            image_dataset = precip
            precip = precip.filterDate(analysis_startdate,analysis_enddate.advance(1, 'month'))
            spi = precip.map(add_spi_chirps_band)
            spi = monthlyMean(spi)
            img_collection = spi.select(indice)
            indiceVis = {
                'min': -2.0,
                'max': -0.5,
                'palette': [
                    'FF0000',  # 5: Red
                    'FFA500',  # 4: Orange
                    'FFFF00',  # 3: Yellow
                    '00FFFF',  # 2: Cyan
                    '0000FF'   # 1: Blue
                ]
            }
        case 'SMA_WAPOR':
            image_list = []
            for year in range(analysis_startyear, analysis_endyear+1):  # From 2009 to 2024
                for month in range(1, 13):  # From January to December
                    for dekad in range(1, 4):  # Dekadal intervals (1, 2, 3)
                        # Construct the dekadal part (1 = dekad1, 2 = dekad2, 3 = dekad3)
                        dekad_formatted = f"D{dekad}"
                        
                        # Format the month with zero-padding
                        month_formatted = f"{month:02d}"
                        # Construct the file path
                        image_path = (f"gs://fao-gismgr-wapor-3-data/DATA/WAPOR-3/"
                                      f"MAPSET/L1-RSM-D/WAPOR-3.L1-RSM-D.{year}-{month_formatted}-{dekad_formatted}.tif")
                        
                        # Load the image and set properties
                        image = ee.Image.loadGeoTIFF(image_path).set({
                            'system:time_start': ee.Date.fromYMD(year, month, 1)
                                                  .advance((dekad - 1) * 10, 'day').millis(),
                            'year': year,
                            'month': month,
                            'dekad': dekad
                        })
                        
                        # Add the image to the list
                        image_list.append(image)

            # Create an ImageCollection from the list of images
            image_collection = ee.ImageCollection(image_list)
            rrzsm_collection = image_collection.filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            rrzsm_collection = monthlyMean(rrzsm_collection)
            sma = rrzsm_collection.map(add_sma_band)
            img_collection = sma.select(indice)
            indiceVis = {
                'min': min_visValue,
                'max': max_visValue,
                'palette': [
                    'FF0000','FFA500','Ffff00','00FFFF','0000FF'
                ]
            }
        case 'RDI_WAPOR':
            # Combined RDI ImageCollection creation
            rdi_image_list = []

            for year in range(analysis_startyear, analysis_endyear + 1):  # From 2018 to 2024
                for month in range(1, 13):  # From January to December
                    # Format the month with zero-padding
                    month_formatted = f"{month:02d}"
                    
                    # Precipitation file path
                    prec_image_path = (f"gs://fao-gismgr-wapor-3-data/DATA/WAPOR-3/"
                                       f"MAPSET/L1-PCP-M/WAPOR-3.L1-PCP-M.{year}-{month_formatted}.tif")
                    # Reference evapotranspiration file path
                    ret_image_path = (f"gs://fao-gismgr-wapor-3-data/DATA/WAPOR-3/"
                                      f"MAPSET/L1-RET-M/WAPOR-3.L1-RET-M.{year}-{month_formatted}.tif")
                    
                    # Load the precipitation image
                    prec_image = ee.Image.loadGeoTIFF(prec_image_path).set({
                        'system:time_start': ee.Date.fromYMD(year, month, 1).millis(),
                        'year': year,
                        'month': month
                    })
                    
                    # Load the reference evapotranspiration image
                    ret_image = ee.Image.loadGeoTIFF(ret_image_path).set({
                        'system:time_start': ee.Date.fromYMD(year, month, 1).millis(),
                        'year': year,
                        'month': month
                    })
                    
                    # Calculate RDI (precipitation/reference evapotranspiration)
                    rdi_image = prec_image.divide(ret_image).set({
                        'system:time_start': ee.Date.fromYMD(year, month, 1).millis(),
                        'year': year,
                        'month': month
                    })
                    
                    # Add the RDI image to the list
                    rdi_image_list.append(rdi_image)

            # Create an ImageCollection for RDI
            rdi_collection = ee.ImageCollection(rdi_image_list)  
            rdi_collection = rdi_collection.filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            rdi_collection = monthlyMean(rdi_collection)
            rdi = rdi_collection.map(add_rdi_band)
            img_collection = rdi.select(indice)
            indiceVis = {
                # Align RDI legend with SPI classification ranges
                'min': -3.0,
                'max': 3.0,
                'palette': [
                    'FF0000',    # Extreme: Red
                    'FFA500',    # Severe: Orange
                    'FFFF00',    # Moderate: Yellow
                    '00FFFF',    # Mild: Cyan
                    '0000FF'     # No drought: Blue
                ]
            }
        case 'ESI_WAPOR':
            # Combined RDI ImageCollection creation
            esi_image_list = []

            for year in range(analysis_startyear, analysis_endyear + 1):  # From 2018 to 2024
                for month in range(1, 13):  # From January to December
                    # Format the month with zero-padding
                    month_formatted = f"{month:02d}"
                    
                    # Precipitation file path
                    aet_image_path = (f"gs://fao-gismgr-wapor-3-data/DATA/WAPOR-3/"
                                      f"MAPSET/L1-AETI-M/WAPOR-3.L1-AETI-M.{year}-{month_formatted}.tif")
                    # Reference evapotranspiration file path
                    ret_image_path = (f"gs://fao-gismgr-wapor-3-data/DATA/WAPOR-3/"
                                      f"MAPSET/L1-RET-M/WAPOR-3.L1-RET-M.{year}-{month_formatted}.tif")
                    
                    # Load the precipitation image
                    aet_image = ee.Image.loadGeoTIFF(aet_image_path).set({
                        'system:time_start': ee.Date.fromYMD(year, month, 1).millis(),
                        'year': year,
                        'month': month
                    })
                    
                    # Load the reference evapotranspiration image
                    ret_image = ee.Image.loadGeoTIFF(ret_image_path).set({
                        'system:time_start': ee.Date.fromYMD(year, month, 1).millis(),
                        'year': year,
                        'month': month
                    })
                    
                    # Calculate RDI (precipitation/reference evapotranspiration)
                    esi_image = aet_image.divide(ret_image).set({
                        'system:time_start': ee.Date.fromYMD(year, month, 1).millis(),
                        'year': year,
                        'month': month
                    })
                    
                    # Add the RDI image to the list
                    esi_image_list.append(esi_image)

            # Create an ImageCollection for ESI
            esi_collection = ee.ImageCollection(esi_image_list) 
            esi_collection = esi_collection.filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            esi_collection = monthlyMean(esi_collection)
            esi = esi_collection.map(add_esi_band)
            img_collection = esi.select(indice)
            indiceVis = {
                'min': min_visValue,
                'max': max_visValue,
                'palette': [
                    'FF0000',    # Extreme: Red
                    'FFA500',    # Severe: Orange
                    'FFFF00',    # Moderate: Yellow
                    '00FFFF',    # Mild: Cyan
                    '0000FF'     # No drought: Blue
                ]
            }
        case 'NPP_Anamoly_WAPOR':
            image_list = []
            for year in range(analysis_startyear, analysis_endyear+1):  # From 2009 to 2024
                for month in range(1, 13):  # From January to December
                    # Format the month with zero-padding
                    month_formatted = f"{month:02d}"
                    # Construct the file path
                    image_path = (f"gs://fao-gismgr-wapor-3-data/DATA/WAPOR-3/"
                                  f"MAPSET/L2-NPP-M/WAPOR-3.L2-NPP-M.{year}-{month_formatted}.tif")
                    
                    # Load the image and set properties
                    image = ee.Image.loadGeoTIFF(image_path).set({
                        'system:time_start': ee.Date.fromYMD(year, month, 1).millis(),
                        'year': year,
                        'month': month
                    })
                    
                    # Add the image to the list
                    image_list.append(image)

            # Create an ImageCollection from the list of images
            image_collection = ee.ImageCollection(image_list)

            npp_collection = image_collection.filterDate(analysis_startdate,analysis_enddate.advance(1, 'month')).filterBounds(geometry)
            npp_collection = monthlyMean(npp_collection)
            npp = npp_collection.map(add_npp_anamoly_band)
            img_collection = npp.select(indice)
            indiceVis = {
                'min': min_visValue,
                'max': max_visValue,
                'palette': [
                    'FF0000',    # Extreme: Red
                    'FFA500',    # Severe: Orange
                    'FFFF00',    # Moderate: Yellow
                    '008000',    # Mild: Green
                    '006400'     # No drought: Dark Green
                ]
            }

    def get_default(image, indice):
        mean_value = image.reduceRegion(
            reducer=ee.Reducer.mean(), geometry=geometry).get(indice)
        max_value = image.reduceRegion(
            reducer=ee.Reducer.max(), geometry=geometry).get(indice)
        min_value = image.reduceRegion(
            reducer=ee.Reducer.min(), geometry=geometry).get(indice)
        if graphoption == 'bae':
            year_str = ee.Number(image.get('year')).format('%d')
            month_str = ee.Number(image.get('month')).format('%02d')
            year_month_str = year_str.cat('-').cat(month_str)
            return ee.Feature(None, {'mean': mean_value,'max': max_value,'min': min_value, 'year-month': year_month_str})
        else:
            return ee.Feature(None, {'mean': mean_value,'max': max_value,'min': min_value, 'year': image.get('year')})
    def get_mean(image, indice):
        mean_value = image.reduceRegion(
            reducer=ee.Reducer.mean().unweighted(), geometry=geometry, scale=11132).get(indice)
        if graphoption == 'bae':
            year_str = ee.Number(image.get('year')).format('%d')
            month_str = ee.Number(image.get('month')).format('%02d')
            year_month_str = year_str.cat('-').cat(month_str)
            return ee.Feature(None, {'mean': mean_value, 'year-month': year_month_str})
        else:
            return ee.Feature(None, {'mean': mean_value, 'year': image.get('year')})

    def get_max(image, indice):
        max_value = image.reduceRegion(
            reducer=ee.Reducer.minMax(), geometry=geometry, scale=5000).get(indice+'_max')
        if graphoption == 'bae':
            year_str = ee.Number(image.get('year')).format('%d')
            month_str = ee.Number(image.get('month')).format('%02d')
            year_month_str = year_str.cat('-').cat(month_str)
    
            return ee.Feature(None, {'max': max_value, 'year-month': year_month_str})
        else:
            return ee.Feature(None, {'max': max_value, 'year': image.get('year')})

    def get_min(image, indice):
        min_value = image.reduceRegion(
            reducer=ee.Reducer.minMax(), geometry=geometry, scale=5000).get(indice+'_min')
        if graphoption == 'bae':
            year_str = ee.Number(image.get('year')).format('%d')
            month_str = ee.Number(image.get('month')).format('%02d')
            year_month_str = year_str.cat('-').cat(month_str)
            return ee.Feature(None, {'min': min_value, 'year-month': year_month_str})
        else:
            return ee.Feature(None, {'min': min_value, 'year': image.get('year')})


    def get_median(image, indice):
        median_value = image.reduceRegion(
            reducer=ee.Reducer.median(), geometry=geometry, scale=5000).get(indice)
        if graphoption == 'bae':
            year_str = ee.Number(image.get('year')).format('%d')
            month_str = ee.Number(image.get('month')).format('%02d')
            year_month_str = year_str.cat('-').cat(month_str)
            return ee.Feature(None, {'median': median_value, 'year-month': year_month_str})
        else:
            return ee.Feature(None, {'median': median_value, 'year': image.get('year')})

    def reducerCase(image_collection, indice):
        img_out = image_collection
        data_list = []
        match aggr:
            case "default":
                if(indice=='SPI_ERA5L'):
                    img_out = image_collection.sort('system:time_start', False).first().clip(geometry)
                else:   
                    img_out = image_collection.mean().clip(geometry)
                if calctype == 'table':
                    default_series = image_collection.map(
                        lambda x: get_default(x, indice))
                    if graphoption == 'bae':
                        data_list = default_series.reduceColumns(
                        reducer=ee.Reducer.toList(4), selectors=['mean','max','min','year-month']).values().get(0)
                    else:
                        data_list = default_series.reduceColumns(
                            reducer=ee.Reducer.toList(4), selectors=['mean','max','min','year']).values().get(0)
            case "mean":
                if(indice=='SPI_ERA5L'):
                    img_out = image_collection.sort('system:time_start', False).first().clip(geometry)
                else:   
                    img_out = image_collection.mean().clip(geometry)
                if calctype == 'table':
                    mean_series = image_collection.map(
                        lambda x: get_mean(x, indice))
                    if graphoption == 'bae':
                        data_list = mean_series.reduceColumns(
                        reducer=ee.Reducer.toList(2), selectors=['mean', 'year-month']).values().get(0)
                    else:
                        data_list = mean_series.reduceColumns(
                            reducer=ee.Reducer.toList(2), selectors=['mean', 'year']).values().get(0)
            case 'max':
                if(indice=='SPI_ERA5L'):
                    img_out = image_collection.sort('system:time_start', False).first().clip(geometry)
                else:   
                    img_out = image_collection.max().clip(geometry)
                if calctype == 'table':
                    max_series = image_collection.map(
                        lambda x: get_max(x, indice))
                    if graphoption == 'bae':
                        data_list = mean_series.reduceColumns(
                        reducer=ee.Reducer.toList(2), selectors=['max', 'year-month']).values().get(0)
                    else:
                        data_list = max_series.reduceColumns(
                            reducer=ee.Reducer.toList(2), selectors=['max', 'year']).values().get(0)
            case "min":
                if(indice=='SPI_ERA5L'):
                    img_out = image_collection.sort('system:time_start', False).first().clip(geometry)
                else:   
                    img_out = image_collection.min().clip(geometry)
                if calctype == 'table':
                    min_series = image_collection.map(
                        lambda x: get_min(x, indice))
                    if graphoption == 'bae':
                        data_list = mean_series.reduceColumns(
                        reducer=ee.Reducer.toList(2), selectors=['min', 'year-month']).values().get(0)
                    else:
                        data_list = min_series.reduceColumns(
                            reducer=ee.Reducer.toList(2), selectors=['min', 'year']).values().get(0)
            case "median":
                if(indice=='SPI_ERA5L'):
                    img_out = image_collection.sort('system:time_start', False).first().clip(geometry)
                else:   
                    img_out = image_collection.median().clip(geometry)
                if calctype == 'table':
                    median_series = image_collection.map(
                        lambda x: get_median(x, indice))
                    if graphoption == 'bae':
                        data_list = mean_series.reduceColumns(
                        reducer=ee.Reducer.toList(2), selectors=['median', 'year-month']).values().get(0)
                    else:
                        data_list = median_series.reduceColumns(
                            reducer=ee.Reducer.toList(2), selectors=['median', 'year']).values().get(0)
        return img_out.clip(geometry), data_list

    if(indice in ['TCI','VHI']):
        scale = 1000
    elif(indice in ['VCI','NDVI_Anamoly','MAI','NDWI','CWD']):
        scale = 500
    elif(indice in ['SMCI_FLDAS','PCI','DrySpell','SPI_ERA5L','SMCI_SMAP']):
        scale = 11132
    elif(indice in ['SPI_CHIRPS','WAPOR_Prec','CDI','RDI_WAPOR']):
        scale = 5000
    elif(indice in ['AETI','NPP','RRZSM','SMA_WAPOR', 'ESI_WAPOR', 'NPP_Anamoly_WAPOR']):
        scale = 100
    elif(indice in ['RET']):
        scale = 30000

    worldcover = ee.ImageCollection("ESA/WorldCover/v200").first()
    classes_to_mask = [50, 60, 70, 80, 90]
    mask = worldcover.remap(classes_to_mask, [-9999] * len(classes_to_mask), 1)
    def mask_image(image):
        binary_mask = mask.neq(-9999)
        return image.updateMask(mask)
    if(indice == 'NDVI_Anamoly'):
        img_collection = img_collection.map(mask_image)
    #if(indice not in ['DrySpell','PCI','SPI_ERA5L', 'SPI_CHIRPS']):
    #    img_collection = img_collection.map(mask_image)
    # if(indice!='DrySpell'):
    #     img_collection = img_collection.map(mask_image)
    # else:
    #     img_collection = img_collection.updateMask(mask)
    img_out, data_list = reducerCase(img_collection, indice)
    img_out = img_out.reproject(crs='EPSG:3857',scale=scale)
    img_url = img_out.getMapId(indiceVis)['tile_fetcher'].url_format
    dict = img_out.getMapId(indiceVis)
    dict.update(indiceVis)
    if calctype == "map":
        # Build stepped legend metadata for specific drought indices (Option A)
        drought_indices_for_step_legend = [
            'SPI_ERA5L', 'SPI_CHIRPS', 'MAI', 'PCI', 'SMCI_FLDAS', 'SMCI_SMAP', 'CWD', 'TCI', 'VCI', 'VHI', 'NDVI_Anamoly', 'RDI_WAPOR'
        ]
        # Indices where palette goes from high severity to low severity (e.g., Red->Blue),
        # so legend labels should be reversed to match the palette order.
        reversed_label_indices = [
            'SPI_ERA5L', 'SPI_CHIRPS', 'MAI', 'PCI', 'SMCI_FLDAS', 'SMCI_SMAP', 'TCI', 'VCI', 'VHI', 'NDVI_Anamoly', 'RDI_WAPOR'
        ]
        legend = None
        try:
            if indice in drought_indices_for_step_legend:
                # Special-case SPI and RDI: use explicit drought-class breaks and
                # include ranges in labels (display text like "Mild(-0.5 to -1)").
                if indice in ['SPI_ERA5L', 'RDI_WAPOR']:
                    # Palette ordering is Extreme -> No drought, so labels
                    # are provided in that same order (Extreme first). The
                    # frontend will detect 'Extreme' first label and reverse
                    # labels/colors for display so they appear No drought -> Extreme.
                    breaks = [-3.0, -2.0, -1.5, -1.0, -0.5, 3.0]
                    labels = [
                        'Extreme (-2 to -3)',
                        'Severe (-1.5 to -2)',
                        'Moderate (-1 to -1.5)',
                        'Mild (-0.5 to -1)',
                        'No drought (3 to -0.5)'
                    ]
                    legend = {
                        'isDiscrete': True,
                        'labels': labels,
                        'colors': dict.get('palette', []),
                        'breaks': breaks
                    }
                else:
                    min_val = float(dict['min']) if dict.get('min') is not None else None
                    max_val = float(dict['max']) if dict.get('max') is not None else None
                    if min_val is not None and max_val is not None and max_val >= min_val:
                        step = (max_val - min_val) / 5.0 if max_val != min_val else 0
                        breaks = [min_val + step * i for i in range(6)]
                    else:
                        breaks = None
                    labels_normal = ['No drought', 'Mild', 'Moderate', 'Severe', 'Extreme']
                    labels = list(reversed(labels_normal)) if indice in reversed_label_indices else labels_normal
                    legend = {
                        'isDiscrete': True,
                        'labels': labels,
                        'colors': dict.get('palette', []),
                        'breaks': breaks
                    }
        except Exception:
            legend = None

        response = {'mapid': img_url, 'min': dict['min'], 'max': dict['max'], 'palette': dict['palette']}
        if legend is not None:
            response['legend'] = legend
        print(json.dumps(response))
    else:
        data = ee.List(data_list).getInfo()
        print(json.dumps({'mapid': data, 'min': dict['min'],
                          'max': dict['max']}))