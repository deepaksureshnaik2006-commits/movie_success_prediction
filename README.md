🎬 Movie Success Prediction (ML + DL)

A web-based application that predicts whether a movie will be a Hit or Flop using Machine Learning and Deep Learning techniques.

---

🚀 Features

- 🎯 Predicts Hit / Flop
- 📊 Displays Hit % and Flop %
- 🔥 Shows Confidence Level (Strong / Medium / Weak)
- 💡 Insight messages based on prediction

---

🧠 Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Python (Flask)
- Machine Learning: Random Forest
- Deep Learning: Keras (Artificial Neural Network)

---

⚙️ How It Works

1. User enters movie details (budget, rating, cast, etc.)
2. Data is sent to backend (Flask API)
3. Model processes input using ML/DL
4. Prediction is returned as:
   - Hit probability
   - Flop probability
5. Results are displayed with insights

---

📊 Confidence Logic

Confidence is calculated using the higher value between Hit % and Flop %:

- 🔥 Strong → 80% – 100%
- ➖ Medium → 60% – 79%
- ⚠ Weak → Below 60%

---

This project combines Machine Learning and Deep Learning to provide a simple and effective way to predict movie success and understand model confidence.
