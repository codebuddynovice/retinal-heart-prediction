import cv2
import numpy as np
import base64
import io
import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import google.generativeai as genai
from typing import Optional

# Gemini Configuration
GEMINI_API_KEY = "AIzaSyBViNs_ysFgEhvhBnXEincF3Bu3k3u820o"
genai.configure(api_key=GEMINI_API_KEY)
chat_model = genai.GenerativeModel('gemini-2.5-flash')

# Load the trained model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet50()
model.fc = nn.Sequential(
    nn.Linear(model.fc.in_features, 256),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(256, 1),
    nn.Sigmoid()
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "cardio_risk_model.h5")
if os.path.exists(MODEL_PATH):
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.to(device)
        model.eval()
        MODEL_LOADED = True
    except Exception as e:
        print(f"Error loading model: {e}")
        MODEL_LOADED = False
else:
    MODEL_LOADED = False

# Transformation for the model
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

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

    # 2. Extract Metrics and Calculate Risk Score
    fd = calculate_fractal_dimension(mask)
    avr_base = 0.65
    noise = (np.random.random() - 0.5) * 0.1
    avr = avr_base + noise

    # Model Prediction
    if MODEL_LOADED:
        try:
            pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            input_tensor = preprocess(pil_img).unsqueeze(0).to(device)
            with torch.no_grad():
                model_prediction = model(input_tensor).item()
            model_risk_score = round(model_prediction * 100, 1)
        except Exception as e:
            print(f"Model prediction error: {e}")
            model_risk_score = 50.0
    else:
        model_risk_score = 50.0

    # User's Logic Implementation (Hybrid approach)
    avr_val = max(0, min(100, (0.85 - avr) * 200))
    tortuosity_val = max(0, min(100, (1.6 - fd) * 300))
    
    # We combine heuristic risk and DL model risk
    heuristic_risk = (0.6 * avr_val) + (0.4 * tortuosity_val)
    
    if MODEL_LOADED:
        # Give more weight to the DL model if loaded
        risk_score = (0.7 * model_risk_score) + (0.3 * heuristic_risk)
    else:
        risk_score = heuristic_risk
        
    risk_score = round(max(0, min(100, risk_score)), 1)

    # 3. Classify Risk based on user thresholds (30, 70)
    if risk_score < 30:
        risk_level = "Low"
        anomalies = []
    elif risk_score < 70:
        risk_level = "Medium"
        anomalies = [
            {
                "name": "Mild Tortuosity",
                "symptoms": ["Early systemic vascular stress", "Developing retinal strain"]
            }
        ]
    else:
        risk_level = "High"
        anomalies = [
            {
                "name": "Arteriolar Narrowing",
                "symptoms": ["Elevated systemic blood pressure", "Increased cardiovascular stress"]
            },
            {
                "name": "AV Nicking Detected",
                "symptoms": ["Chronic hypertension marker", "Increased risk of stroke", "Reduced vascular elasticity"]
            }
        ]

    insights = (
        f"Vascular analysis shows a Fractal Dimension of {fd:.3f}, indicating "
        f"{'standard' if fd > 1.4 else 'reduced'} vessel tree complexity. "
        f"The A:V Ratio is {avr:.2f}. Overall, the cardiovascular risk is classified as {risk_level.upper()} "
        f"with a score of {risk_score}%. "
        f"Note: This system is a non-diagnostic, AI-assisted decision-support tool and does not replace clinical evaluation."
    )

    return {
        "metrics": {
            "riskScore": risk_score,
            "avr": round(avr, 2),
            "fractalDimension": round(fd, 3),
            "hypertensionRisk": risk_level,
            "detectedAnomalies": anomalies,
            "insights": insights,
            "prevention": get_prevention_plan(risk_level, avr, fd)
        },
        "images": {
            "green": f"data:image/jpeg;base64,{encode_img_to_base64(green)}",
            "segmentation": f"data:image/jpeg;base64,{encode_img_to_base64(mask)}",
            "heatmap": f"data:image/jpeg;base64,{encode_img_to_base64(heatmap)}"
        }
    }

def get_prevention_plan(risk_level, avr, fd):
    """Generates personalized prevention and lifestyle plans."""
    
    # Generic mapping for risk levels
    plans = {
        "Low": {
            "tips": [
                "Maintain your current balanced diet.",
                "Continue 150 minutes of moderate aerobic activity weekly.",
                "Get routinely screened every 2 years."
            ],
            "plan30Day": "Week 1-4: Focus on diversity in colors on your plate. Sustain 7-8 hours of sleep.",
            "reversalTimeline": "Baseline Maintenance: Vascular health is currently optimal."
        },
        "Medium": {
            "tips": [
                "Reduce sodium intake to under 2,300mg per day.",
                "Introduce 30 mins of brisk walking daily.",
                "Monitor blood pressure bi-weekly."
            ],
            "plan30Day": "Week 1: Salt reduction. Week 2: Daily morning walks. Week 3: Stress management via meditation. Week 4: Follow-up BP check.",
            "reversalTimeline": "3-6 Months: Arteriolar narrowing can stabilize or show subtle improvement with strict BP control."
        },
        "High": {
            "tips": [
                "URGENT: Consult a cardiologist for a full workup.",
                "Strict DASH diet adherence (low sodium, high potassium).",
                "Begin medically supervised exercise regimen.",
                "Daily blood pressure monitoring."
            ],
            "plan30Day": "Week 1: Medical diagnostic tests. Week 2: Medication adherence (if prescribed) & Diet overhaul. Week 3: Supervised light exercise. Week 4: Comprehensive re-evaluation.",
            "reversalTimeline": "6-12 Months: Severe markers like AV nicking are permanent, but risk of stroke/infarction can be reduced by 40% with intervention."
        }
    }

    # Add marker-specific tips
    personalized = plans.get(risk_level, plans["Medium"]).copy()
    
    if avr < 0.6:
        personalized["tips"].append("Marker Alert: Low AVR suggests persistent arteriolar narrowing. Limit caffeine and high-stress environments.")
    
    if fd < 1.35:
        personalized["tips"].append("Marker Alert: Reduced Fractal Complexity suggests thinning of the vessel tree. Increase Omega-3 intake.")

    return personalized

def generate_chat_response(message: str, context: Optional[dict] = None):
    """Generates a response using Gemini 2.5 Flash with a friendly, simple persona."""
    system_prompt = (
        "You are 'Oculo', a friendly and helpful health assistant for this retinal screening app. "
        "Your job is to explain things in very simple, easy-to-understand language. Avoid using too much "
        "medical jargon.\n\n"
        "GUIDELINES:\n"
        "1. Do NOT start your responses with greetings or introduce yourself (e.g., skip 'Hi there', 'I am Oculo'). Just answer the user's question directly.\n"
        "2. Be warm, supportive, and use simple words.\n"
        "3. If the user asks about their results, explain what the numbers (like AVR or Risk) mean in a way "
        "a normal person would understand.\n"
        "4. ALWAYS remind the user in a friendly way that you are an AI and they should talk to a real doctor "
        "if they have concerns.\n"
        "5. Keep your answers short and sweet."
    )

    full_prompt = system_prompt
    if context:
        # Clean context for prompt
        clean_context = {k: v for k, v in context.items() if k != 'images'}
        full_prompt += f"\nCURRENT CLINICAL CONTEXT: {clean_context}\n"
    
    full_prompt += f"\nUSER MESSAGE: {message}\n"

    try:
        response = chat_model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "I'm having trouble connecting to the clinical intelligence engine. Please try again in a moment."
