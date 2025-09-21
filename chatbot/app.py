import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# --- Config ---
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("Set GEMINI_API_KEY in your environment.")

genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "*"}})

def collapse_messages(msgs):
    lines = []
    for m in msgs:
        role = m.get("role", "user")
        content = (m.get("content") or "").strip()
        if not content:
            continue
        if role == "system":
            lines.append(f"[System]\\n{content}\\n")
        elif role == "assistant":
            lines.append(f"Assistant:\\n{content}\\n")
        else:
            lines.append(f"User:\\n{content}\\n")
    return "\\n".join(lines).strip() or "User: Hello!\\nAssistant:"

@app.route("/chat", methods=["POST"])
def chat():
    try:
        messages_raw = request.form.get("messages")
        messages = json.loads(messages_raw) if messages_raw else []

        prompt = collapse_messages(messages)

        uploaded_file = request.files.get("file")
        if uploaded_file:
            file_info = f\"[User uploaded file: {uploaded_file.filename}]\\n\"
            prompt = file_info + prompt

        model = genai.GenerativeModel(GEMINI_MODEL)
        resp = model.generate_content(prompt)

        reply = getattr(resp, "text", None) or ""
        if not reply and hasattr(resp, "candidates") and resp.candidates:
            parts = getattr(resp.candidates[0].content, "parts", [])
            reply = "".join(getattr(p, "text", "") for p in parts).strip()

        if not reply:
            reply = "I couldn't generate a response. Please try again."

        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
