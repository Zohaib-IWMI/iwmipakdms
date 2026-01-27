from netCDF4 import Dataset

path = r"C:\xampp8\htdocs\ncreader\nc_files\GEFS.SPI.24M.nc"

ds = Dataset(path)
print("NetCDF File Format:", ds.file_format)
print("Dimensions:", list(ds.dimensions.keys()))
print("Variables:", list(ds.variables.keys()))
ds.close()
