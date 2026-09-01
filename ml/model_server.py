from flask import Flask, request, jsonify

from predictor import predict_recovery


app = Flask(__name__)


@app.route("/predict", methods=["POST"])
def predict():

    try:

        payment = request.json

        probability = predict_recovery(payment)

        return jsonify({
            "success": True,
            "recovery_probability": probability
        })

    except Exception as error:

        print(error)

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=8000,
        debug=True
    )