import os
import re

dir_path = r"d:\MedIQ\Frontend\src"
# Matches 'dark:' and anything non-whitespace/quote following it
dark_pattern = re.compile(r'\bdark:[^\s"\'\`]+')

def process_files():
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith(('.jsx', '.js', '.tsx', '.ts')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Removing dark classes
                new_content = dark_pattern.sub('', content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == "__main__":
    process_files()
