from flask import Flask, request, jsonify
from predict import predict_movie
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "Flask backend is running"})


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    movie_name = data.get("movie_name")
    director = data.get("director")
    actors = data.get("actors")

    try:
        budget = float(data.get("budget"))
        rating = float(data.get("rating"))
        cast = int(data.get("cast"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid numeric input"}), 400

    genre = data.get("genre")

    # ✅ PURE ML + DL
    result, hit_prob = predict_movie(budget, genre, rating, cast)

    hit_prob = max(0.05, min(float(hit_prob), 0.95))
    flop_prob = 1 - hit_prob

    hit_prob_pct = float(round(hit_prob * 100, 2))
    flop_prob_pct = float(round(flop_prob * 100, 2))

    return jsonify({
        "movie_name": movie_name,
        "director": director,
        "actors": actors,
        "genre": genre,
        "budget": float(budget),
        "rating": float(rating),
        "result": result,
        "hit_prob": hit_prob_pct,
        "flop_prob": flop_prob_pct
    })


@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error", "message": str(error)}), 500


if __name__ == "__main__":
    app.run(debug=True)