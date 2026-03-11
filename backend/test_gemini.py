import google.generativeai as genai
import os

GEMINI_API_KEY = "AIzaSyBViNs_ysFgEhvhBnXEincF3Bu3k3u820o"
genai.configure(api_key=GEMINI_API_KEY)

try:
    print("Listing available models...")
    models = genai.list_models()
    for m in models:
        print(f"Model ID: {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
