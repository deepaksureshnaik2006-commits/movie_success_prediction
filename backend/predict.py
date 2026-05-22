import pickle
import numpy as np
import os
import warnings

# Suppress TensorFlow C++ backend logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from keras.models import load_model

# Suppress scikit-learn UserWarnings about feature names
warnings.filterwarnings("ignore", category=UserWarning)

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load models once at startup
RF_MODEL_PATH = os.path.join(BASE_DIR, "models", "rf_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "models", "scaler.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "models", "encoder.pkl")
DL_MODEL_PATH = os.path.join(BASE_DIR, "models", "dl_model.h5")

rf = pickle.load(open(RF_MODEL_PATH, "rb"))
scaler = pickle.load(open(SCALER_PATH, "rb"))
encoder = pickle.load(open(ENCODER_PATH, "rb"))
dl_model = load_model(DL_MODEL_PATH)

def predict_movie(budget, genre, rating, cast):

    budget = float(budget)
    rating = float(rating)
    cast = float(cast)

    genre_encoded = encoder.transform([[genre]]).toarray()

    X_numeric = np.array([[budget, rating, cast]])
    X_final = np.hstack((X_numeric, genre_encoded))

    X_scaled = scaler.transform(X_final)

    # ML
    ml_prob = rf.predict_proba(X_scaled)[0][1]

    # DL (no logs)
    dl_prob = dl_model.predict(X_scaled, verbose=0)[0][0]

    # Combined
    hit_prob = (ml_prob + dl_prob) / 2

    return ("HIT" if hit_prob >= 0.5 else "FLOP"), float(hit_prob)