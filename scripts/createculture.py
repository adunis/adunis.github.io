import random
import json

# Define the possible crystal colors
crystals = ["red", "orange", "green", "emerald", "cerulean", "purple", "gold", "black", "blue", "white"]

# Open the file containing the items
with open('culture.txt', 'r') as f:
    items = f.readlines()

# Create an empty list to store the JSON objects
json_objects = []

# Loop through each item in the file
for item in items:
    # Split the title from the description using the "-" symbol
    print(item)
    title, description = item.strip().split(" - ", 1)
    title = title.split(" (", 1)[0]

    # Randomly select a crystal for the item
    crystal = random.choice(crystals)

    # Create the JSON object
    json_obj = {
        "name": title,
        "crystals": {
            "requires": [],
            "provides": [crystal]
        },
        "type": "background",
        "description": f"<p>{description}</p>",
        "stats": [
            {"stat_name": "", "stat_value": ""},
            {"stat_name": "", "stat_value": ""}
        ],
        "geo_location": {"latitude": 0, "longitude": 0},
        "header_image": "Appetite for Fame and Glory.png"
    }

    # Append the JSON object to the list
    json_objects.append(json_obj)

# Write the JSON objects to a file
with open('items.json', 'w') as f:
    json.dump(json_objects, f, indent=4)