import uvicorn
import pandas as pd
import numpy as np
import logging
import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import RandomOverSampler
from sklearn.model_selection import train_test_split
import joblib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('model_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

logger.info(" Starting Water Quality ML Model Server...")
logger.info(" Loading and preprocessing dataset...")

# ----------------------------
# 1. Load and preprocess dataset
# ----------------------------
# print("model is being run ")
df = pd.read_csv("waterQuality_with_disease.csv")
logger.info(f" Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")

X = df.drop(columns=["disease", "is_safe"])
y = df["disease"].astype(str)
logger.info(f" Features: {list(X.columns)}")
logger.info(f" Disease classes: {y.unique()}")

# Replace invalid values with NaN
df["is_safe"] = pd.to_numeric(df["is_safe"], errors="coerce")

# Fill NaNs (e.g., assume unsafe = 0, or drop them if better)
df["is_safe"] = df["is_safe"].fillna(0).astype(int)

# Now safe column is clean
is_safe = df["is_safe"]


# Convert features to numeric
X = X.apply(pd.to_numeric, errors="coerce")
X = X.fillna(X.median())
logger.info("✅ Features converted to numeric and NaN values filled")

# Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)
logger.info(f"🏷️  Labels encoded: {len(le.classes_)} unique classes")

# Oversample classes (for disease prediction only)
ros = RandomOverSampler(random_state=42)
X_resampled, y_resampled = ros.fit_resample(X, y_encoded)
logger.info(f"⚖️  Dataset balanced: {X.shape[0]} → {X_resampled.shape[0]} samples")

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X_resampled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled
)
logger.info(f"📊 Train/test split: {X_train.shape[0]} train, {X_test.shape[0]} test samples")

# Train disease model
logger.info("🧠 Training disease prediction model...")
disease_model = RandomForestClassifier(n_estimators=50, class_weight="balanced", random_state=42, min_samples_leaf=2, max_features='sqrt', n_jobs=1)
disease_model.fit(X_train, y_train)
logger.info("✅ Disease model training completed")

# Train safety model
logger.info("🛡️  Training safety classification model...")
safety_model = RandomForestClassifier(n_estimators=30, random_state=42, min_samples_leaf=2, max_features='sqrt', n_jobs=1)
safety_model.fit(X, is_safe)
logger.info("✅ Safety model training completed")

# Save models + encoder
logger.info("💾 Saving trained models and encoder...")
joblib.dump(disease_model, "disease_model.pkl")
joblib.dump(safety_model, "safety_model.pkl")
joblib.dump(le, "label_encoder.pkl")
joblib.dump(list(X.columns), "feature_names.pkl")
logger.info("✅ All models and encoder saved successfully")

# ----------------------------
# 2. Build FastAPI App
# ----------------------------
logger.info("🌐 Initializing FastAPI application...")
app = FastAPI(title="Water Quality Safety & Disease Prediction API")
logger.info("✅ FastAPI app initialized")

# Input schema
class WaterQualityInput(BaseModel):
    features: dict  # key = feature name, value = numeric value

@app.post("/predict")
def predict(data: WaterQualityInput):
    start_time = datetime.datetime.now()
    logger.info(f"🔮 Received prediction request at {start_time}")
    logger.info(f"📥 Input features: {data.features}")
    
    try:
        # Load models and encoder
        logger.info("📂 Loading trained models...")
        disease_model = joblib.load("disease_model.pkl")
        safety_model = joblib.load("safety_model.pkl")
        le = joblib.load("label_encoder.pkl")
        feature_names = joblib.load("feature_names.pkl")
        logger.info("✅ Models loaded successfully")

        # Convert input dict into DataFrame
        input_df = pd.DataFrame([data.features])
        logger.info(f"📊 Input converted to DataFrame: {input_df.shape}")

        # Ensure all expected features are present
        for col in feature_names:
            if col not in input_df.columns:
                input_df[col] = 0
        input_df = input_df[feature_names]
        logger.info(f"🔧 Features standardized: {list(input_df.columns)}")

        # First: check safety
        logger.info("🛡️  Making safety prediction...")
        is_safe_pred = safety_model.predict(input_df)[0]
        logger.info(f"🔍 Safety prediction: {'Safe' if is_safe_pred == 1 else 'Unsafe'}")

        if is_safe_pred == 1:
            result = {"status": "Safe", "message": "Water is safe to drink."}
            logger.info("✅ Prediction complete: Water is SAFE")
            return result
        else:
            # Predict disease if unsafe
            logger.info("🦠 Making disease prediction...")
            pred_encoded = disease_model.predict(input_df)[0]
            pred_label = le.inverse_transform([pred_encoded])[0]
            logger.info(f"🔬 Disease prediction: {pred_label}")
            
            result = {"status": "Unsafe", "predicted_disease": pred_label,
                    "alert": f"Water is unsafe. Possible disease: {pred_label}"}
            
            end_time = datetime.datetime.now()
            duration = (end_time - start_time).total_seconds()
            logger.info(f"⚠️  Prediction complete: Water is UNSAFE - {pred_label} (took {duration:.2f}s)")
            return result
            
    except Exception as e:
        logger.error(f"❌ Error during prediction: {str(e)}")
        return {"status": "Error", "message": f"Prediction failed: {str(e)}"}


# ----------------------------
# 3. Run the Server
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Starting Water Quality Prediction Server...")
    logger.info("📊 Server Configuration:")
    logger.info("   • Host: localhost (127.0.0.1)")
    logger.info("   • Port: 8000")
    logger.info("   • API Endpoint: http://localhost:8000/predict")
    logger.info("   • Documentation: http://localhost:8000/docs")
    logger.info("🌟 Server ready to handle water quality predictions!")
    
    try:
        uvicorn.run(app, host="127.0.0.1", port=8000)
    except KeyboardInterrupt:
        logger.info("⛔ Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server error: {str(e)}")
    finally:
        logger.info("👋 Water Quality Prediction Server shutdown complete")

