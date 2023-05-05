import os
import os.path as path

# Specify the path to the folder containing the images
folder_path = '.'

# Get a list of all the files in the folder
files = os.listdir(folder_path)

# Keep only image files
image_files = [f for f in files if f.endswith('.jpg') or f.endswith('.png')]

# Sort the files alphabetically to ensure consistent numbering
image_files.sort()

# Set the starting index for the numbering
index = 1

# Iterate over the image files and rename them with consecutive IDs
for f in image_files:
    # Construct the new filename with the consecutive ID
    new_filename = f'{index:03d}.png'  # Use 3-digit numbering with leading zeros

    # Build the full paths to the old and new filenames
    old_path = path.join(folder_path, f)
    new_path = path.join(folder_path, new_filename)

    # Rename the file
    os.rename(old_path, new_path)

    # Print the new filename to the console
    print(new_filename)

    # Increment the index for the next file
    index += 1

# Print the list of available images in the specified format
available_images = [f'{i:03d}.png' for i in range(1, len(image_files) + 1)]
print(f'const images = {available_images}; // List of available images')