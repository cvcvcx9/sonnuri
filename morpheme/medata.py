import os
import json
import pandas as pd

# Path to the main directory containing the folders with JSON files
main_directory = r"C:\Users\SSAFY\Desktop\형태소Json"

# Set to collect unique words
unique_words = set()

# Traverse through each folder and JSON file
for folder in os.listdir(main_directory):
    folder_path = os.path.join(main_directory, folder)
    if os.path.isdir(folder_path):
        for file in os.listdir(folder_path):
            # Skip the specific JSON file you mentioned
            if file == "NIA_SL_SEN0001_REAL01_F_morpheme.json":
                continue

            if file.endswith(".json"):
                file_path = os.path.join(folder_path, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as json_file:
                        json_data = json.load(json_file)
                        for item in json_data.get("data", []):
                            for attribute in item.get("attributes", []):
                                name = attribute.get("name")
                                if name:
                                    # Collect unique word
                                    unique_words.add(name)
                except Exception as e:
                    pass  # Ignore errors

# Convert unique words to DataFrame and save as CSV
df = pd.DataFrame({"Word": sorted(unique_words)})
output_path = os.path.join(os.getcwd(), "unique_words.csv")
df.to_csv(output_path, index=False, encoding="utf-8-sig")
print(f"Data collection complete. Saved to {output_path}")
