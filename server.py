from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import ollama  # For general-purpose responses

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    try:
        # Use Ollama's Mistral to generate a response
        response = ollama.chat(model="mistral", messages=[{"role": "user", "content": user_message}])
        return jsonify({"response": response['message']['content']})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)