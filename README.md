# 🛡️ AI Sentinel: Multimodal Deepfake Detection System

A complete end-to-end Deepfake Video Detection ecosystem consisting of:
1. **Multimodal Deep Learning AI Core**: MobileNetV2 feature extraction + 2D FFT Frequency Analysis + Temporal Face Sequences + Graph Attention Network (GAT).
2. **FastAPI Inference Backend**: High-performance asynchronous Python API with video frame extraction, face crop, frequency domain fusion, and GPU/CPU inference.
3. **Flutter Cross-Platform Mobile Application**: Real-time camera recording with Cyber Sentinel HUD targeting, animated laser scan line, and rich multi-sensor telemetry.
4. **Ngrok Secure Cloud Tunneling**: Seamless remote connectivity between the physical mobile device and the local AI inference workstation.

---

## 📌 Table of Contents
- [Architecture & How It Works](#-architecture--how-it-works)
- [Model Training Progression & Optimization](#-model-training-progression--optimization)
- [Project Directory Structure](#-project-directory-structure)
- [Current Live Status](#-current-live-status)
- [How to Run the System (Now & In the Future)](#-how-to-run-the-system)
- [Mobile App Installation & Connection](#-mobile-app-installation--connection)

---

## 🧠 Architecture & How It Works

Traditional deepfake detectors rely only on standard spatial image frames (CNNs), which can be fooled by high-resolution GANs or diffusion models. This project uses a **tri-modal feature fusion model**:

```
                       ┌──────────────────────────────┐
                       │    Raw Video (MP4/AVI/MOV)   │
                       └──────────────┬───────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
   │ 1. Frequency    │       │ 2. Spatial Face │       │ 3. Temporal     │
   │    Analysis     │       │    Frames       │       │    Sequences    │
   │ (3x224x224x3)   │       │ (10x224x224x3)  │       │ (3x5x224x224x3) │
   │ 2D FFT, noise,  │       │ Haar cascade    │       │ Inter-frame     │
   │ optical flow &  │       │ face detection  │       │ motion and      │
   │ bandpass filters│       │ & crop          │       │ temporal change │
   └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
            │                         │                         │
            ▼                         ▼                         ▼
   ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
   │ MobileNetV2     │       │ MobileNetV2     │       │ MobileNetV2 +   │
   │ TimeDistributed │       │ TimeDistributed │       │ Temporal Attn   │
   └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Graph Attention (GAT)   │
                        │ Multi-head node relations │
                        │  (Spatial + Freq + Time)  │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │ Dense Classifier Layers   │
                        │ Sigmoid Output [0.0 - 1.0]│
                        └─────────────┬─────────────┘
                                      │
                         >= 0.55 ──► FAKE
                          < 0.55 ──► REAL
```

---

## 📈 Model Training Progression & Optimization

For in-depth analysis, loss curves, confusion matrices, and metrics, see [models/MODEL_TRAINING_PROGRESSION.md](file:///d:/deepfake/models/MODEL_TRAINING_PROGRESSION.md).

| Stage | Folder | Architecture | Optimization Highlights | Accuracy | Val AUC |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **01** | `01_stage_baseline_cnn_acc58` | Single-frame Spatial CNN | Spatial pixel feature benchmark | **58.0%** | ~0.58 |
| **02** | `02_stage_frequency_fft_acc59` | 2D FFT + Laplacian + Flow | Frequency-domain synthetic artifact detection | **59.0%** | ~0.60 |
| **03** | `03_stage_temporal_sequence_acc68` | CNN + Temporal Sequences | Multi-frame motion continuity & temporal pooling | **68.0%** | ~0.70 |
| **04** | `04_stage_gnn_hybrid_acc64` | Graph Attention Network (GAT) | Relational edge weights across modalities | **64.0%** | **0.787** |
| **05** | `05_stage_multimodal_fusion_acc73` | Tri-Modal Fusion + GAT | End-to-end integration of all 3 streams | **73.0%** | **0.848** |
| **06** | `00_BEST_MODEL_PRODUCTION` | Deep Fine-Tuned GAT | Unfrozen 40 layers, $1\times 10^{-5}$ LR, threshold 0.55 | **Production** | **>0.85** |

---

## 📂 Project Directory Structure

```
d:\deepfake\
├── DeepfakeDetector_v2.apk        # Ready-to-install Android APK (Newly Compiled)
├── build_and_install.bat          # One-click compile APK & install to phone
├── install_app.bat                # One-click direct APK install via ADB
├── start_all.bat                  # One-click launcher for Backend + Ngrok
├── start_backend.bat              # Starts FastAPI Uvicorn server on port 8000
├── start_tunnel.bat               # Starts Ngrok tunnel to static domain
├── HOW_TO_RUN.md                  # Comprehensive Roadmap & User Operations Guide
│
├── models\
│   ├── 00_BEST_MODEL_PRODUCTION\  # Active Production Model (71.7 MB)
│   │   ├── best_model.keras
│   │   ├── model_card.json
│   │   └── README.md
│   ├── 01_stage_baseline_cnn_acc58\
│   ├── 02_stage_frequency_fft_acc59\
│   ├── 03_stage_temporal_sequence_acc68\
│   ├── 04_stage_gnn_hybrid_acc64\
│   ├── 05_stage_multimodal_fusion_acc73\
│   ├── 06_stage_finetuned_attention_best\
│   ├── saved_weights\             # Compatibility layer for scripts
│   └── MODEL_TRAINING_PROGRESSION.md
│
├── experiments\                   # Experimental training scripts
│   ├── baseline.py
│   ├── frequency.py
│   └── temporal_cnn_gru.py
│
├── src\
│   ├── data_loader.py
│   ├── models\
│   │   ├── combine_fusion.py
│   │   ├── gnn_face_fusion.py
│   │   └── pure_gnn.py
│   └── preprocessing\
│       ├── data_creation_new.py
│       ├── fft_creation_high.py
│       └── processing_video.py
│
├── system\
│   ├── backend\
│   │   ├── main.py                # Enhanced FastAPI server
│   │   ├── model.py               # Model architecture loader
│   │   ├── preprocessing.py       # Enhanced preprocessing pipeline
│   │   └── venv\                  # Python virtual environment
│   └── frontend\
│       ├── lib\main.dart          # Cyber Sentinel Flutter UI
│       └── build\app\outputs\flutter-apk\
│           └── app-debug.apk
└── README.md
```

---

## 🟢 Current Live Status

Both backend services are **actively running**:
- **Local Backend**: `http://localhost:8000` (FastAPI / Uvicorn)
- **Health Check**: `http://localhost:8000/health` ➔ `{"status": "healthy", "model_loaded": true}`
- **Remote Ngrok URL**: `https://heftiness-starship-debrief.ngrok-free.dev`
- **Predict Endpoint**: `https://heftiness-starship-debrief.ngrok-free.dev/predict-video`

---

## 🚀 How to Run the System (Now & In the Future)

### Option 1: The Quick One-Click Method (Recommended)
Simply double-click:
```
D:\deepfake\start_all.bat
```
This automatically opens two terminal windows:
1. **Window 1 (Backend)**: Starts the FastAPI server, initializes the graph attention model, and runs warmup inference.
2. **Window 2 (Ngrok Tunnel)**: Establishes the secure public tunnel so the mobile app on your phone can talk to the backend.

### Option 2: Running Manually via Command Line

**Terminal 1 (Backend Server):**
```powershell
cd D:\deepfake\system\backend
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 (Ngrok Public Tunnel):**
```powershell
ngrok http 8000 --url=heftiness-starship-debrief.ngrok-free.dev
```

---

## 📱 Mobile App Installation & Features (v2.1)

- **One-Click Build & Install**: Double-click [`build_and_install.bat`](file:///d:/deepfake/build_and_install.bat) to compile and install to your phone automatically.
- **One-Click Direct Install**: Double-click [`install_app.bat`](file:///d:/deepfake/install_app.bat) to install the pre-compiled APK directly.
- **Pre-Compiled APK**: Stored at the project root as [`DeepfakeDetector_v2.apk`](file:///d:/deepfake/DeepfakeDetector_v2.apk).
- **Comprehensive Guide**: See [`HOW_TO_RUN.md`](file:///d:/deepfake/HOW_TO_RUN.md) for full system architecture and instructions.

### Key Capabilities in v2.1:
1. **Dual Video Source**: Upload existing videos from phone gallery or record live with biometric HUD targeting (up to 30s).
2. **Face Presence Gatekeeper**: Automatically validates face presence; displays clear warning alert if no face is detected in the video.
3. **Unbiased 0.50 Threshold**: Strict standard decision boundary ($\ge 0.50 \implies \text{Fake}$, $< 0.50 \implies \text{Real}$).
4. **Active Learning Feedback Loop**: Users can verify or dispute classifications, archiving real-world edge cases to continually retrain and improve the model over time.