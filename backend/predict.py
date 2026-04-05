def predict_movie(budget, genre, rating, cast):

    import pickle
    import numpy as np
    from keras.models import load_model

    rf = pickle.load(open("models/rf_model.pkl","rb"))
    scaler = pickle.load(open("models/scaler.pkl","rb"))
    encoder = pickle.load(open("models/encoder.pkl","rb"))
    dl_model = load_model("models/dl_model.h5")

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