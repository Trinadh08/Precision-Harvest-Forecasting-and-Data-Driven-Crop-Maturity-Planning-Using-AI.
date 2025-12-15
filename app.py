from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from sklearn.preprocessing import LabelEncoder, StandardScaler

app = Flask(__name__)
CORS(app)

# -------------------------------
# Load trained model
# -------------------------------
model_path = "models/crop_model.keras"
if not os.path.exists(model_path):
    raise FileNotFoundError("Trained model not found. Run train_model.py first!")
model = load_model(model_path)

# -------------------------------
# Crop types and scaler
# -------------------------------
crop_types = ["wheat", "rice", "maize", "tomato"]
le = LabelEncoder()
le.fit(crop_types)
scaler = StandardScaler()

# -------------------------------
# Ensure uploads folder exists
# -------------------------------
os.makedirs("uploads", exist_ok=True)

# -------------------------------
# Predict API
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.form
        crop_type = data.get("crop_type", "wheat")
        temperature = float(data.get("temperature", 25))
        rainfall = float(data.get("rainfall", 100))
        soil_ph = float(data.get("soil_ph", 6.5))
        fertilizer_used = float(data.get("fertilizer_used", 50))
        previous_yield = float(data.get("previous_yield", 2))

        # Encode crop type
        if crop_type not in crop_types:
            crop_types.append(crop_type)
            le.fit(crop_types)
        crop_encoded = le.transform([crop_type])[0]

        # Scale numeric input
        X_num = np.array([[crop_encoded, temperature, rainfall, soil_ph, fertilizer_used, previous_yield]])
        X_num_scaled = scaler.fit_transform(X_num)

        # Handle image
        img_file = request.files.get("image")
        if not img_file:
            return jsonify({"error": "No image uploaded"}), 400
        img_path = os.path.join("uploads", img_file.filename)
        img_file.save(img_path)

        img = load_img(img_path, target_size=(128, 128))
        img_array = img_to_array(img) / 255.0
        X_img = np.expand_dims(img_array, axis=0)

        # Make prediction
        y_pred = model.predict([X_num_scaled, X_img])
        harvest_days = int(np.round(y_pred[0][0]))

        def maturity_stage(days):
            if days <= 60:
                return "Early"
            elif days <= 120:
                return "Mid"
            else:
                return "Mature"

        return jsonify({
            "crop": crop_type,
            "harvest_days": harvest_days,
            "maturity_stage": maturity_stage(harvest_days)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------------------
# Run app
# -------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
