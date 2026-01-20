import ee
import os
from dotenv import load_dotenv

# Load the .env file
load_dotenv()
service_account = os.getenv('SERVICE_ACCOUNT')
private_key_file = os.getenv('PRIVATE_KEY_FILE')

# Authenticate with the service account and private key
credentials = ee.ServiceAccountCredentials(service_account, private_key_file)

ee.Initialize(credentials)

fldas_min = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/min_fldas_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/min_fldas_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/min_fldas_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/min_fldas_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/min_fldas_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/min_fldas_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/min_fldas_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/min_fldas_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/min_fldas_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/min_fldas_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/min_fldas_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/min_fldas_12')
})

fldas_max = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/max_fldas_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/max_fldas_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/max_fldas_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/max_fldas_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/max_fldas_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/max_fldas_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/max_fldas_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/max_fldas_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/max_fldas_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/max_fldas_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/max_fldas_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/max_fldas_12')
})

smap_min = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/min_smap_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/min_smap_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/min_smap_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/min_smap_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/min_smap_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/min_smap_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/min_smap_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/min_smap_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/min_smap_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/min_smap_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/min_smap_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/min_smap_12')
})

smap_max = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/max_smap_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/max_smap_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/max_smap_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/max_smap_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/max_smap_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/max_smap_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/max_smap_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/max_smap_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/max_smap_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/max_smap_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/max_smap_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/max_smap_12')
})

lst_min = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/min_lst_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/min_lst_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/min_lst_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/min_lst_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/min_lst_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/min_lst_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/min_lst_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/min_lst_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/min_lst_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/min_lst_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/min_lst_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/min_lst_12')
})

lst_max = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/max_lst_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/max_lst_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/max_lst_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/max_lst_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/max_lst_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/max_lst_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/max_lst_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/max_lst_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/max_lst_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/max_lst_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/max_lst_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/max_lst_12')
})

ndvi_min = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/min_ndvi_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/min_ndvi_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/min_ndvi_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/min_ndvi_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/min_ndvi_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/min_ndvi_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/min_ndvi_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/min_ndvi_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/min_ndvi_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/min_ndvi_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/min_ndvi_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/min_ndvi_12')
})

ndvi_max = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/max_ndvi_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/max_ndvi_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/max_ndvi_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/max_ndvi_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/max_ndvi_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/max_ndvi_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/max_ndvi_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/max_ndvi_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/max_ndvi_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/max_ndvi_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/max_ndvi_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/max_ndvi_12')
})

ndvi_mean = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/mean_ndvi_12')
})

ndvi_std = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/std_ndvi_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/std_ndvi_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/std_ndvi_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/std_ndvi_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/std_ndvi_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/std_ndvi_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/std_ndvi_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/std_ndvi_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/std_ndvi_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/std_ndvi_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/std_ndvi_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/std_ndvi_12')
})

prec_min = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/min_prec_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/min_prec_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/min_prec_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/min_prec_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/min_prec_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/min_prec_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/min_prec_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/min_prec_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/min_prec_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/min_prec_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/min_prec_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/min_prec_12')
})

prec_max = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/max_prec_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/max_prec_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/max_prec_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/max_prec_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/max_prec_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/max_prec_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/max_prec_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/max_prec_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/max_prec_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/max_prec_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/max_prec_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/max_prec_12')
})
sma_mean = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/mean_sma_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/mean_sma_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/mean_sma_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/mean_sma_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/mean_sma_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/mean_sma_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/mean_sma_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/mean_sma_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/mean_sma_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/mean_sma_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/mean_sma_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/mean_sma_12')
})

sma_std = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/std_sma_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/std_sma_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/std_sma_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/std_sma_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/std_sma_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/std_sma_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/std_sma_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/std_sma_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/std_sma_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/std_sma_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/std_sma_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/std_sma_12')
})

rdi_mean = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/mean_rdi_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/mean_rdi_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/mean_rdi_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/mean_rdi_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/mean_rdi_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/mean_rdi_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/mean_rdi_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/mean_rdi_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/mean_rdi_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/mean_rdi_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/mean_rdi_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/mean_rdi_12')
})

rdi_std = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/std_rdi_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/std_rdi_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/std_rdi_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/std_rdi_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/std_rdi_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/std_rdi_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/std_rdi_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/std_rdi_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/std_rdi_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/std_rdi_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/std_rdi_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/std_rdi_12')
})

esi_mean = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/mean_esi_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/mean_esi_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/mean_esi_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/mean_esi_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/mean_esi_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/mean_esi_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/mean_esi_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/mean_esi_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/mean_esi_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/mean_esi_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/mean_esi_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/mean_esi_12')
})

esi_std = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/std_esi_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/std_esi_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/std_esi_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/std_esi_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/std_esi_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/std_esi_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/std_esi_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/std_esi_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/std_esi_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/std_esi_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/std_esi_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/std_esi_12')
})

npp_mean = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/mean_npp_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/mean_npp_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/mean_npp_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/mean_npp_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/mean_npp_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/mean_npp_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/mean_npp_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/mean_npp_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/mean_npp_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/mean_npp_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/mean_npp_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/mean_npp_12')
})

npp_std = ee.Dictionary({
    '1': ee.Image('projects/ee-iwmipk/assets/std_npp_1'),
    '2': ee.Image('projects/ee-iwmipk/assets/std_npp_2'),
    '3': ee.Image('projects/ee-iwmipk/assets/std_npp_3'),
    '4': ee.Image('projects/ee-iwmipk/assets/std_npp_4'),
    '5': ee.Image('projects/ee-iwmipk/assets/std_npp_5'),
    '6': ee.Image('projects/ee-iwmipk/assets/std_npp_6'),
    '7': ee.Image('projects/ee-iwmipk/assets/std_npp_7'),
    '8': ee.Image('projects/ee-iwmipk/assets/std_npp_8'),
    '9': ee.Image('projects/ee-iwmipk/assets/std_npp_9'),
    '10': ee.Image('projects/ee-iwmipk/assets/std_npp_10'),
    '11': ee.Image('projects/ee-iwmipk/assets/std_npp_11'),
    '12': ee.Image('projects/ee-iwmipk/assets/std_npp_12')
})

spi_mean = ee.Dictionary({
    '31': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_1'),
    '32': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_2'),
    '33': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_3'),
    '34': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_4'),
    '35': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_5'),
    '36': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_6'),
    '37': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_7'),
    '38': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_8'),
    '39': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_9'),
    '310': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_10'),
    '311': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_11'),
    '312': ee.Image('projects/ee-iwmipk/assets/SPI3_Mean_12'),
    '61': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_1'),
    '62': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_2'),
    '63': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_3'),
    '64': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_4'),
    '65': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_5'),
    '66': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_6'),
    '67': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_7'),
    '58': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_8'),
    '69': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_9'),
    '610': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_10'),
    '611': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_11'),
    '612': ee.Image('projects/ee-iwmipk/assets/SPI6_Mean_12'),
    '121': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_1'),
    '122': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_2'),
    '123': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_3'),
    '124': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_4'),
    '125': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_5'),
    '126': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_6'),
    '127': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_7'),
    '128': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_8'),
    '129': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_9'),
    '1210': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_10'),
    '1211': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_11'),
    '1212': ee.Image('projects/ee-iwmipk/assets/SPI12_Mean_12')
})

spi_std = ee.Dictionary({
    '31': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_1'),
    '32': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_2'),
    '33': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_3'),
    '34': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_4'),
    '35': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_5'),
    '36': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_6'),
    '37': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_7'),
    '38': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_8'),
    '39': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_9'),
    '310': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_10'),
    '311': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_11'),
    '312': ee.Image('projects/ee-iwmipk/assets/SPI3_Std_12'),
    '61': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_1'),
    '62': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_2'),
    '63': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_3'),
    '64': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_4'),
    '65': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_5'),
    '66': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_6'),
    '67': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_7'),
    '58': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_8'),
    '69': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_9'),
    '610': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_10'),
    '611': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_11'),
    '612': ee.Image('projects/ee-iwmipk/assets/SPI6_Std_12'),
    '121': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_1'),
    '122': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_2'),
    '123': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_3'),
    '124': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_4'),
    '125': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_5'),
    '126': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_6'),
    '127': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_7'),
    '128': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_8'),
    '129': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_9'),
    '1210': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_10'),
    '1211': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_11'),
    '1212': ee.Image('projects/ee-iwmipk/assets/SPI12_Std_12')
})