#!/usr/bin/env python3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import uvicorn
import os

# Initialize FastAPI app
app = FastAPI(title="Water Quality Prediction API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre-trained models and encoder
try:
    model_dir = os.path.dirname(os.path.abspath(__file__))
    disease_model = joblib.load(os.path.join(model_dir, "disease_model.pkl"))
    safety_model = joblib.load(os.path.join(model_dir, "safety_model.pkl"))
    label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.pkl"))
    feature_names = joblib.load(os.path.join(model_dir, "feature_names.pkl"))
    print("✅ Models loaded successfully!")
except FileNotFoundError as e:
    print(f"❌ Error loading models: {e}")
    disease_model = None
    safety_model = None
    label_encoder = None
    feature_names = None

# Expected features for the model
MODEL_FEATURES = [
    'aluminium','ammonia','arsenic','barium','cadmium','chloramine',
    'chromium','copper','flouride','bacteria','viruses','lead',
    'nitrates','nitrites','mercury','perchlorate','radium','selenium',
    'silver','uranium'
]

class WaterQualityFeatures(BaseModel):
    features: dict

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    models_loaded = all([disease_model, safety_model, label_encoder, feature_names])
    return {
        "status": "healthy" if models_loaded else "models_not_loaded",
        "models_loaded": models_loaded,
        "expected_features": MODEL_FEATURES
    }

@app.post("/predict")
async def predict_water_quality(data: WaterQualityFeatures):
    """Predict water quality and disease risk"""
    
    if not all([disease_model, safety_model, label_encoder, feature_names]):
        raise HTTPException(status_code=500, detail="Models not loaded")
    
    try:
        # Extract features
        features = data.features
        
        # Create feature vector in the correct order
        feature_vector = []
        for feature in MODEL_FEATURES:
            value = features.get(feature, 0)
            # Convert to float, default to 0 if invalid
            try:
                feature_vector.append(float(value) if value else 0.0)
            except (ValueError, TypeError):
                feature_vector.append(0.0)
        
        # Convert to numpy array and reshape for prediction
        X = np.array(feature_vector).reshape(1, -1)
        
        # Make predictions
        safety_pred = safety_model.predict(X)[0]
        safety_prob = safety_model.predict_proba(X)[0]
        
        disease_pred = disease_model.predict(X)[0]
        disease_prob = disease_model.predict_proba(X)[0]
        
        # Decode disease prediction
        predicted_disease = label_encoder.inverse_transform([disease_pred])[0]
        
        # Determine status
        status = "Safe" if safety_pred == 1 else "Unsafe"
        
        # Create alert message
        if status == "Unsafe":
            alert = f"⚠️ WATER CONTAMINATION ALERT: High risk of {predicted_disease}. Immediate action required!"
        else:
            alert = "✅ Water quality is within safe parameters."
        
        return {
            "status": status,
            "predicted_disease": predicted_disease,
            "safety_confidence": float(max(safety_prob)),
            "disease_confidence": float(max(disease_prob)),
            "alert": alert,
            "features_processed": len(feature_vector),
            "recommendations": get_recommendations(status, predicted_disease, features)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

def get_recommendations(status, disease, features):
    """Generate recommendations based on prediction"""
    recommendations = []
    
    if status == "Unsafe":
        recommendations.append("🚨 Do not consume this water source")
        recommendations.append("🔬 Conduct immediate water quality testing")
        recommendations.append("🏥 Provide alternative safe water sources to community")
        
        # Specific recommendations based on contaminant levels
        if features.get('arsenic', 0) > 0.01:
            recommendations.append("⚗️ Arsenic levels exceed safe limits - requires specialized filtration")
        if features.get('lead', 0) > 0.015:
            recommendations.append("🔧 Lead contamination detected - check plumbing systems")
        if features.get('bacteria', 0) > 100:
            recommendations.append("🦠 High bacterial count - disinfection required")
        if features.get('nitrates', 0) > 50:
            recommendations.append("🌾 High nitrates detected - check for agricultural runoff")
            
    else:
        recommendations.append("✅ Water quality is safe for consumption")
        recommendations.append("📅 Continue regular monitoring")
        recommendations.append("🛡️ Maintain current water treatment protocols")
    
    return recommendations

if __name__ == "__main__":
    # Change to the directory containing the models
    model_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(model_dir)
    print(f"Working directory: {os.getcwd()}")
    
    # Run the API server
    uvicorn.run(app, host="0.0.0.0", port=8000)