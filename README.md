# RetinaHeart AI: Retinal Heart Prediction

"Retinal Heart Prediction" is a cutting-edge AI medical diagnostic tool that turns a simple eye exam into a full-body health checkup. This project implements a pipeline to analyze retinal fundus images and predict cardiovascular risk factors.

## Features
- **Image Pre-processing**: Green channel extraction and CLAHE (Contrast Limited Adaptive Histogram Equalization) for vessel enhancement.
- **Vascular Analysis**: Placeholder for U-Net segmentation to extract Artery-to-Vein Ratio (AVR) and Fractal Dimension.
- **Risk Assessment**: Predictive modeling for cardiac event risk.
- **Explainability**: Integrated dashboard for clinical review.

## Tech Stack
- **Frontend**: React (Vite), Lucide Icons, Vanilla CSS (Glassmorphism).
- **Backend**: Python (FastAPI), OpenCV, NumPy.
- **AI Models**: Designed for U-Net (Segmentation) and EfficientNet (Prediction).

## Project Structure
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
├── data/               # Placeholder for DRIVE/UK Biobank datasets
└── models/             # Placeholder for .pth or .h5 model files
```

## Getting Started
Follow the workflow in `.agent/workflows/run-project.md` to start the development servers.

## Future Roadmap (Feb 2026 - May 2026)
- [ ] Implement actual U-Net model using PyTorch.
- [ ] Integrate Grad-CAM for model explainability (Heatmaps).
- [ ] Connect to official DRIVE dataset for training/validation.
- [ ] Exportable PDF Clinical Reports.
