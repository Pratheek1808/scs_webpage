import os
from flask import Flask, send_from_directory, request, jsonify
from dotenv import load_dotenv
import openai
from flask_cors import CORS
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app) # Enable CORS for all routes

# Supabase Initialization
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized.")
    except Exception as e:
        print(f"Failed to initialize Supabase: {e}")

# OpenAI API key loaded from .env

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    data = request.get_json(silent=True) or {}
    
    # Save to CSV file
    import csv
    from datetime import datetime
    
    try:
        file_exists = os.path.isfile('messages.csv')
        with open('messages.csv', 'a', newline='') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(['Timestamp', 'Name', 'Email', 'Message'])
            
            writer.writerow([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                data.get('name', ''),
                data.get('email', ''),
                data.get('message', '')
            ])
    except Exception as e:
        print(f"Skipping CSV save (likely read-only serverless environment): {e}")
    
    # Save to Supabase
    if supabase:
        try:
            supabase.table('contacts').insert({
                "name": data.get('name', ''),
                "email": data.get('email', ''),
                "message": data.get('message', '')
            }).execute()
            print("Contact successfully saved to Supabase DB.")
        except Exception as e:
            print(f"Supabase Insert Error: {e}")
    
    print(f"New Contact Form Submission: {data}")
    
    return jsonify({"status": "success", "message": "Message received!"})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get('message', '')

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
- Location: 404 4th floor Avasa Residency Kushaiguda ECIL
Hyderabad, Telangana, 500062.
- Contact: scshyd2013@gmail.com | +91 9491038955,+91 9490937664
- Services: Financial Auditing, Factory Registration, Labour Law Compliance, Payroll Management, S&E Registration, ESIC/EPFO Registration, Payment of Gratuity.
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
            model_name = "openai/gpt-3.5-turbo"
        else:
            client = openai.OpenAI(api_key=api_key)
            model_name = "gpt-3.5-turbo"

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
        bot_response = f"I'm having trouble connecting right now. Please try again or contact us directly at scshyd2013@gmail.com."

    return jsonify({"response": bot_response})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
