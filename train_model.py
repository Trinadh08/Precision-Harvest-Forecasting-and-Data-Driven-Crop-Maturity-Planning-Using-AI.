import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Conv2D, MaxPooling2D, Flatten, concatenate

# -------------------------------
# Dummy dataset (replace with real data if available)
# -------------------------------
num_samples = 100
img_height, img_width = 128, 128

# Numerical features: crop_encoded, temperature, rainfall, soil_ph, fertilizer_used, previous_yield
X_num = np.random.rand(num_samples, 6) * 10
# Images: random noise images for dummy
X_img = np.random.rand(num_samples, img_height, img_width, 3)
# Target: harvest days
y = np.random.randint(50, 150, size=(num_samples, 1))

# -------------------------------
# Model architecture
# -------------------------------
num_input_layer = Input(shape=(6,))
x1 = Dense(64, activation='relu')(num_input_layer)

img_input_layer = Input(shape=(img_height, img_width, 3))
x2 = Conv2D(32, (3, 3), activation='relu')(img_input_layer)
x2 = MaxPooling2D((2, 2))(x2)
x2 = Flatten()(x2)

combined = concatenate([x1, x2])
output = Dense(1, activation='linear')(combined)

model = Model(inputs=[num_input_layer, img_input_layer], outputs=output)
model.compile(optimizer='adam', loss='mse')

# -------------------------------
# Train the model
# -------------------------------
model.fit([X_num, X_img], y, epochs=5, batch_size=8)

# -------------------------------
# Save model in models/ folder
# -------------------------------
os.makedirs("models", exist_ok=True)
model_path = "models/crop_model.keras"
model.save(model_path)
print(f"Model saved at {model_path}")
