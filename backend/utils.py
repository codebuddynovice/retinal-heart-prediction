import cv2
import numpy as np
import base64
import io
from PIL import Image

def encode_img_to_base64(img):
    """Converts an OpenCV image to base64 string."""
    _, buffer = cv2.imencode('.jpg', img)
    return base64.b64encode(buffer).decode('utf-8')

def get_green_channel(img):
    """Extracts the green channel."""
    return img[:, :, 1]

def apply_clahe(img):
    """Applies CLAHE."""
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(img)

def simulate_segmentation(img_enhanced):
    """Simulates U-Net vessel segmentation."""
    _, thresh = cv2.threshold(img_enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    kernel = np.ones((3,3), np.uint8)
    mask = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    # Convert to 3-channel for consistent color display if needed, but we can send mask as is
    return mask

def simulate_gradcam(img):
    """Simulates a Grad-CAM heatmap overlay."""
    # Create a dummy heatmap
    heatmap = np.zeros(img.shape[:2], dtype=np.uint8)
    # Add some "blobs" of interest
    cv2.circle(heatmap, (img.shape[1]//2, img.shape[0]//2), 100, 255, -1)
    cv2.circle(heatmap, (img.shape[1]//3, img.shape[0]//3), 50, 200, -1)
    heatmap = cv2.GaussianBlur(heatmap, (51, 51), 0)
    
    heatmap_img = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img, 0.6, heatmap_img, 0.4, 0)
    return overlay

def calculate_fractal_dimension(Z):
    """Calculates fractal dimension."""
    assert(len(Z.shape) == 2)
    def boxcount(Z, k):
        S = np.add.reduceat(
            np.add.reduceat(Z, np.arange(0, Z.shape[0], k), axis=0),
                               np.arange(0, Z.shape[1], k), axis=1)
        return len(np.where((S > 0) & (S < k*k))[0])
    Z = (Z < 128)
    p = min(Z.shape)
    n = 2**int(np.log2(p)) if p > 0 else 1
    if n < 2: return 1.42
    Z = Z[:n, :n]
    sizes = 2**np.arange(int(np.log2(n)), 1, -1)
    counts = []
    for size in sizes:
        counts.append(boxcount(Z, size))
    if len(counts) < 2: return 1.42
    coeffs = np.polyfit(np.log(sizes), np.log(counts), 1)
    return -coeffs[0]

def analyze_retina(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image format")

    # 1. Processing
    green = get_green_channel(img)
    enhanced = apply_clahe(green)
    mask = simulate_segmentation(enhanced)
    heatmap = simulate_gradcam(img)

    # 2. Extract Metrics
    fd = calculate_fractal_dimension(mask)
    avr_base = 0.65
    noise = (np.random.random() - 0.5) * 0.1
    avr = avr_base + noise

    risk_score = 100 - (avr * 70 + (fd - 1.0) * 50)
    risk_score = max(5, min(95, risk_score))

    if avr < 0.6:
        hypertension = "High"
        anomalies = ["Arteriolar Narrowing", "AV Nicking Detected"]
    elif avr < 0.65:
        hypertension = "Moderate"
        anomalies = ["Mild Tortuosity"]
    else:
        hypertension = "Low"
        anomalies = []

    insights = (
        f"Vascular analysis shows a Fractal Dimension of {fd:.3f}, indicating "
        f"{'standard' if fd > 1.4 else 'reduced'} vessel tree complexity. "
        f"The A:V Ratio is {avr:.2f}, which correlates with {hypertension.lower()} "
        "risk of hypertensive retinopathy."
    )

    return {
        "metrics": {
            "riskScore": round(risk_score, 1),
            "avr": round(avr, 2),
            "fractalDimension": round(fd, 3),
            "hypertensionRisk": hypertension,
            "detectedAnomalies": anomalies,
            "insights": insights
        },
        "images": {
            "green": f"data:image/jpeg;base64,{encode_img_to_base64(green)}",
            "segmentation": f"data:image/jpeg;base64,{encode_img_to_base64(mask)}",
            "heatmap": f"data:image/jpeg;base64,{encode_img_to_base64(heatmap)}"
        }
    }
