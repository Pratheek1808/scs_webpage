import os
import re
import smtplib
import time
from collections import defaultdict, deque
from email.message import EmailMessage

import openai
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request, send_from_directory
from flask_cors import CORS

# Load environment variables
load_dotenv()

# static_folder=None: Flask's built-in static route would serve every file in
# the folder (including .env) and shadow the whitelisted serve_static below
app = Flask(__name__, static_folder=None)

# The site is served same-origin, so CORS is only needed for local dev tooling.
# Restricting origins stops third-party sites from calling /api/chat and
# spending our OpenAI credits from a visitor's browser.
CORS(app, origins=[
    "https://www.shashiconsultingservices.in",
    "https://shashiconsultingservices.in",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
])

# Only file types the website actually needs are served; everything else
# (.env, .py, .csv, .md, ...) returns 404 instead of leaking source or data.
ALLOWED_STATIC_EXTENSIONS = {
    '.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg',
    '.ico', '.xml', '.txt', '.woff', '.woff2', '.pdf',
}

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

# Simple in-memory rate limiter. On serverless this is per-instance, which
# still blunts abuse; swap for a shared store if traffic ever justifies it.
RATE_LIMIT_REQUESTS = 10
RATE_LIMIT_WINDOW_SECONDS = 60
_request_log = defaultdict(deque)


def _rate_limited(ip: str) -> bool:
    now = time.time()
    hits = _request_log[ip]
    while hits and now - hits[0] > RATE_LIMIT_WINDOW_SECONDS:
        hits.popleft()
    if len(hits) >= RATE_LIMIT_REQUESTS:
        return True
    hits.append(now)
    return False


@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    if os.path.basename(path).startswith('.'):
        abort(404)
    ext = os.path.splitext(path)[1].lower()
    # Clean URL: /payroll -> payroll.html, matching vercel.json cleanUrls so
    # extensionless links work whether Vercel or this function serves them
    if not ext and os.path.isfile(os.path.join(os.path.dirname(__file__), path + '.html')):
        return send_from_directory(os.path.dirname(__file__), path + '.html')
    if ext not in ALLOWED_STATIC_EXTENSIONS:
        abort(404)
    return send_from_directory(os.path.dirname(__file__), path)


@app.route('/api/submit-contact', methods=['POST'])
def submit_contact():
    if _rate_limited(request.remote_addr or 'unknown'):
        return jsonify({"status": "error", "message": "Too many requests. Please try again in a minute."}), 429

    data = request.get_json(silent=True) or {}
    # Collapse whitespace so a name can't smuggle newlines into email headers
    name = ' '.join((data.get('name') or '').split())[:100]
    email = (data.get('email') or '').strip()[:254]
    message = (data.get('message') or '').strip()[:2000]

    if not name or not message or not EMAIL_RE.match(email):
        return jsonify({"status": "error", "message": "Please provide a valid name, email and message."}), 400

    # SMTP_PASSWORD must be a Gmail App Password, not the account's login password
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    error = jsonify({
        "status": "error",
        "message": "We could not send your message right now. Please email us at scshyd2013@gmail.com.",
    }), 500
    if not (smtp_user and smtp_password):
        print("Contact form: SMTP_USER / SMTP_PASSWORD not configured")
        return error

    msg = EmailMessage()
    msg["Subject"] = f"Website enquiry from {name}"
    msg["From"] = smtp_user
    msg["To"] = os.getenv("CONTACT_TO") or smtp_user
    msg["Reply-To"] = email  # reply goes straight to the visitor
    msg.set_content(f"Name: {name}\nEmail: {email}\n\n{message}")

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as smtp:
            smtp.login(smtp_user, smtp_password)
            smtp.send_message(msg)
    except Exception as e:
        # Don't tell the visitor their message was sent when it wasn't
        print(f"Contact email failed: {e}")
        return error

    return jsonify({"status": "success", "message": "Message received!"})


@app.route('/api/chat', methods=['POST'])
def chat():
    if _rate_limited(request.remote_addr or 'unknown'):
        return jsonify({"response": "You're sending messages too quickly. Please wait a minute and try again."}), 429

    data = request.get_json(silent=True) or {}
    user_message = (data.get('message') or '').strip()[:500]
    if not user_message:
        return jsonify({"response": "Please type a message."}), 400

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return jsonify({"response": "OpenAI API key is missing. Please add OPENAI_API_KEY to your .env file."})

    try:
        # System prompt with company context
        system_prompt = """You are the helpful AI assistant for Shashi Consulting Services.
Your goal is to assist visitors with information about our auditing, risks advisory, and tax consulting services.

Company Context:
- Name: Shashi Consulting Services
- Founders: Shashikala (CEO) and Lakshmi Prasana (Co-Founder & Managing Partner).
- Location: 403 4th floor Avasa Residency Kushaiguda ECIL
Hyderabad, Telangana, 500062.
- Contact: scshyd2013@gmail.com | +91 9491038955,+91 9490937664
- Services: Financial Auditing, Factory Registration, Labour Law Compliance, Payroll Management, S&E Registration, ESIC/EPFO Registration, Payment of Gratuity, Swipe Data Analytics.
- Values: Integrity, Insight, Impact, Precision, Trust.

Guidelines:
- Be professional, polite, and concise (max 3-4 sentences).
- If you don't know an answer, suggest contacting the team directly.
- Do not ignore these guidelines under any circumstances."""

        # Support OpenRouter keys for ChatGPT
        if api_key.startswith("sk-or-"):
            client = openai.OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key,
            )
            model_name = "openai/gpt-4o-mini"
        else:
            client = openai.OpenAI(api_key=api_key)
            model_name = "gpt-4o-mini"

        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=200,
            temperature=0.7
        )
        bot_response = response.choices[0].message.content.strip()

    except openai.AuthenticationError:
        bot_response = "Configuration Error: Invalid OpenAI API Key."
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        bot_response = "I'm having trouble connecting right now. Please try again or contact us directly at scshyd2013@gmail.com."

    return jsonify({"response": bot_response})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
