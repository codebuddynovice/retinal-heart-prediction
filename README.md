# RetinaHeart AI: Retinal Heart Prediction

"Retinal Heart Prediction" is a cutting-edge AI medical diagnostic tool that turns a simple eye exam into a full-body health checkup. This system is a non-diagnostic, AI-assisted decision-support tool and does not replace clinical evaluation.

## ⚖️ Medical Disclaimer
**This system is a non-diagnostic, AI-assisted decision-support tool and does not replace clinical evaluation.** All results are advisory and must be reviewed by a qualified medical professional.

## Features
- **Image Pre-processing**: Green channel extraction and CLAHE (Contrast Limited Adaptive Histogram Equalization) for vessel enhancement.
- **Vascular Analysis**: Computer vision pipeline to extract Artery-to-Vein Ratio (AVR) and Fractal Dimension.
- **Risk Assessment**: Predictive modeling for cardiac event risk using weighted vascular biomarkers.
    - *Logic*: `Risk = (0.6 * AVR_Risk) + (0.4 * Tortuosity_Risk)`
    - *Justification*: AVR is given higher weight due to its strong clinical association with hypertension and cardiovascular disease, while vessel tortuosity provides supplementary structural information.
    - *Thresholds*: Low (<30%), Medium (30-70%), High (>70%). These thresholds are predefined based on empirical observation and literature references and can be reconfigured for different clinical settings.
- **Explainability**: Integrated dashboard with Grad-CAM heatmaps for clinical review.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Lucide Icons, Vanilla CSS (Glassmorphism).
- **Backend**: Python (FastAPI), OpenCV, NumPy.
- **AI Models**: Designed for U-Net (Segmentation) and EfficientNet (Prediction).

## 📊 System Validation
The system was validated using publicly available retinal images (such as the DRIVE dataset) to verify vessel enhancement and anomaly detection accuracy. Manual verification was performed to ensure the anomaly detection logic aligns with clinical markers for vascular stress.

## ⚠️ Limitations
- **Image Quality**: Accuracy is highly dependent on image resolution and clarity.
- **Hardware**: Works best with specialized fundus-camera images; standard mobile photos may yield lower accuracy.
- **Data Diversity**: Currently not trained on specific population-wide demographic data.
- **Non-Predictive**: The tool identifies current vascular markers and cannot predict exact future medical outcomes.

## 🛡️ Ethics & Privacy
- **Anonymity**: No personal identity or patient metadata is stored.
- **Processing**: Images are processed temporarily in memory and are not saved to a permanent database.
- **Advisory Only**: The system acts strictly as a decision-support aid for clinicians.

## 📂 Project Structure
```
retinal-heart-prediction/
├── backend/            # FastAPI Server & Image Processing
│   ├── main.py
│   ├── utils.py
│   └── requirements.txt
├── frontend/           # React Dashboard
│   ├── src/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── data/               # The system is dataset-independent at runtime and operates solely on real-time user-uploaded retinal images.
```

## Getting Started
Follow the workflow in `.agent/workflows/run-project.md` to start the development servers.
