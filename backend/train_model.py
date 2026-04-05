import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from tensorflow.keras.models import Sequential  # type: ignore
from tensorflow.keras.layers import Dense  # type: ignore

# Load dataset
df = pd.read_csv("movies.csv")

X = df[['budget','genre','rating_imdb','cast_popularity']]
y = df['hit']

# Encode genre (ignore unknown categories at inference)
encoder = OneHotEncoder(handle_unknown='ignore')
genre_encoded = encoder.fit_transform(X[['genre']]).toarray()

# Combine features
import numpy as np
X_numeric = X[['budget','rating_imdb','cast_popularity']].values
X_final = np.hstack((X_numeric, genre_encoded))

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_final)

# Split
X_train,X_test,y_train,y_test = train_test_split(X_scaled,y,test_size=0.2)

# ---------------- ML MODEL ----------------
rf = RandomForestClassifier()
rf.fit(X_train,y_train)

pred = rf.predict(X_test)
print("Random Forest Accuracy:",accuracy_score(y_test,pred))

# Save ML model
pickle.dump(rf,open("models/rf_model.pkl","wb"))
pickle.dump(scaler,open("models/scaler.pkl","wb"))
pickle.dump(encoder,open("models/encoder.pkl","wb"))

# ---------------- DL MODEL ----------------
model = Sequential()
model.add(Dense(64,activation='relu',input_shape=(X_train.shape[1],)))
model.add(Dense(32,activation='relu'))
model.add(Dense(1,activation='sigmoid'))

model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])

model.fit(X_train,y_train,epochs=30,batch_size=8)

model.save("models/dl_model.h5")