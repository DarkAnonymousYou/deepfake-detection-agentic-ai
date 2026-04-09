import os

# Base project path (D drive)
base_path = r"D:\deepfake"

# Folder structure
folders = [
    "dataset/real",
    "dataset/fake",

    "processed_data/frames/real",
    "processed_data/frames/fake",
    "processed_data/faces/real",
    "processed_data/faces/fake",
    "processed_data/sequences",

    "audio_data/raw_audio",
    "audio_data/spectrograms",

    "models/cnn_model",
    "models/gru_model",
    "models/final_model",

    "src/preprocessing",
    "src/models",
    "src/training",
    "src/utils",

    "notebooks",
    "app/backend",
    "app/api",

    "outputs/graphs",
    "outputs/predictions"
]

# Files to create
files = {
    "README.md": "# Deepfake Detection Project\n\nProject setup initialized.",
    ".gitignore": """dataset/
processed_data/
audio_data/
models/
__pycache__/
*.h5
*.pt
*.pth
""",
    "requirements.txt": "opencv-python\nnumpy\ntensorflow\nmediapipe\nlibrosa\nmatplotlib"
}

# Create folders
for folder in folders:
    path = os.path.join(base_path, folder)
    os.makedirs(path, exist_ok=True)

# Create files
for filename, content in files.items():
    file_path = os.path.join(base_path, filename)
    with open(file_path, "w") as f:
        f.write(content)

print("✅ Project structure created successfully!")