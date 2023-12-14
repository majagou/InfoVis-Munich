import geopandas as gpd

# Example: Reading a GeoJSON file, reprojecting, and saving it.

# Assume the file is named 'example.geojson' and located in the current directory.
# Replace 'example.geojson' with the path to your actual file.

# Read the GeoJSON file
gdf = gpd.read_file (r'C:\Users\gouma\IV Project\Team-28\Stadtvieltel.geojson')


# Check if the CRS is correctly set to EPSG:25832
if gdf.crs != 'epsg:25832':
    # If not, set it explicitly
    gdf = gdf.set_crs('epsg:25832', allow_override=True)

# Transform the coordinate system to WGS 84 (EPSG:4326)
gdf_wgs84 = gdf.to_crs(epsg=4326)

# Save the reprojected GeoJSON
output_file_path = r'C:\Users\gouma\IV Project\Team-28\formatted-Stadtvieltel.geojson'
gdf_wgs84.to_file(output_file_path, driver='GeoJSON')

output_file_path

