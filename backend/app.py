from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import os
import copy
from datetime import datetime
import typing as _typing

# Optional: Google Generative AI (Gemini)
# Load .env if present
try:
    from dotenv import load_dotenv  # type: ignore
    # Attempt to load backend/.env relative to this file first, then default
    _env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(_env_path):
        load_dotenv(_env_path)
    else:
        load_dotenv()
except Exception:
    pass

_GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-pro')
_GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

def _collapse_messages_for_llm(messages: _typing.List[dict]) -> str:
    """Flatten chat messages into a single prompt string for basic LLMs.

    Expected message shape: { role: 'system'|'user'|'assistant', content: str }
    """
    if not isinstance(messages, list):
        return "User: Hello!\nAssistant:"
    lines: _typing.List[str] = []
    for m in messages:
        role = str(m.get('role', 'user')).lower()
        content = str(m.get('content', '')).strip()
        if not content:
            continue
        if role == 'system':
            lines.append(f"[System]\n{content}\n")
        elif role == 'assistant':
            lines.append(f"Assistant:\n{content}\n")
        else:
            lines.append(f"User:\n{content}\n")
    return "\n".join(lines).strip() or "User: Hello!\nAssistant:"

def _extract_text_from_response(resp) -> str:
    """Best-effort extraction of text from Gemini response across shapes."""
    try:
        txt = getattr(resp, 'text', None)
        if isinstance(txt, str) and txt.strip():
            return txt.strip()
    except Exception:
        pass
    # Fall back to candidates aggregation
    try:
        candidates = getattr(resp, 'candidates', None) or []
        for cand in candidates:
            content = getattr(cand, 'content', None)
            parts = getattr(content, 'parts', None) or []
            texts = []
            for p in parts:
                try:
                    t = getattr(p, 'text', None)
                    if not t and isinstance(p, dict):
                        t = p.get('text')
                    if isinstance(t, str) and t:
                        texts.append(t)
                except Exception:
                    continue
            if texts:
                return "".join(texts).strip()
    except Exception:
        pass
    return ""

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# JSON file to store data (resolve relative to this file's directory)
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')

# Collections we support in the prototype JSON DB
COLLECTIONS = [
    'users',
    'medicines',
    'wishlists',
    'donations',
    'grants',
    'profiles',
    'counters',
    'notifications',
    'transactions',
]

DEFAULT_DB = {
    'users': [],
    'medicines': [],
    'wishlists': [],
    'donations': [],
    'grants': [],
    'profiles': [],
    'counters': [],
    'notifications': [],
    'transactions': [],
    # Keep demo list used by existing /api/data endpoints
    'demoData': [],
    'meta': {
        'counters': {
            'users': 0,
            'medicines': 0,
            'wishlists': 0,
            'donations': 0,
            'grants': 0,
            'profiles': 0,
            'counters': 0,
            'demoData': 0,
        }
    }
}

def _ensure_db_shape(db):
    """Ensure the loaded DB has the required shape and counters."""
    if not isinstance(db, dict):
        # Old format (a list) → migrate to demoData list
        migrated = copy.deepcopy(DEFAULT_DB)
        migrated['demoData'] = db if isinstance(db, list) else []
        migrated['meta']['counters']['demoData'] = len(migrated['demoData'])
        return migrated

    # Ensure collections
    for key in COLLECTIONS:
        db.setdefault(key, [])

    # Ensure demoData and meta
    db.setdefault('demoData', [])
    db.setdefault('meta', {})
    db['meta'].setdefault('counters', {})
    for key in list(COLLECTIONS) + ['demoData']:
        db['meta']['counters'].setdefault(key, 0)

    # Sync counters to max existing id per collection to avoid duplicate IDs
    try:
        for key in COLLECTIONS:
            items = db.get(key, [])
            max_id = 0
            for item in items:
                try:
                    max_id = max(max_id, int(item.get('id', 0)))
                except Exception:
                    pass
            if int(db['meta']['counters'].get(key, 0)) < max_id:
                db['meta']['counters'][key] = max_id
    except Exception:
        pass

    return db

def load_db():
    """Load the entire DB object from disk, ensuring shape/migration."""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                db = json.load(f)
        except Exception:
            db = copy.deepcopy(DEFAULT_DB)
    else:
        db = copy.deepcopy(DEFAULT_DB)
    return _ensure_db_shape(db)

def save_db(db):
    """Persist the entire DB object to disk."""
    with open(DATA_FILE, 'w') as f:
        json.dump(db, f, indent=2)

def _next_id(db, collection):
    """Get the next auto-incrementing id for a collection and advance it."""
    current = int(db['meta']['counters'].get(collection, 0))
    new_id = current + 1
    db['meta']['counters'][collection] = new_id
    return new_id

# Back-compat helpers for existing demo endpoints
def load_data():
    """Load legacy demo list used by /api/data endpoints."""
    db = load_db()
    return db.get('demoData', [])

def save_data(data):
    """Save legacy demo list used by /api/data endpoints."""
    db = load_db()
    db['demoData'] = data
    db['meta']['counters']['demoData'] = len(data)
    save_db(db)

@app.route('/api/data', methods=['GET'])
def get_data():
    """Get all stored data"""
    data = load_data()
    return jsonify({
        'message': 'Data retrieved successfully',
        'data': data,
        'count': len(data)
    })

@app.route('/api/data', methods=['POST'])
def add_data():
    """Add new data"""
    try:
        request_data = request.get_json()
        
        if not request_data or 'text' not in request_data:
            return jsonify({'error': 'Text field is required'}), 400
        
        # Load existing data
        data = load_data()
        
        # Create new entry
        new_entry = {
            'id': len(data) + 1,
            'text': request_data['text'],
            'timestamp': datetime.now().isoformat()
        }
        
        # Add to data
        data.append(new_entry)
        
        # Save to file
        save_data(data)
        
        return jsonify({
            'message': 'Data saved successfully',
            'data': new_entry
        }), 201
        
    except Exception:
        return jsonify({'error': 'Failed to save data'}), 500

@app.route('/api/data/<int:data_id>', methods=['DELETE'])
def delete_data(data_id):
    """Delete specific data entry"""
    try:
        data = load_data()
        
        # Find and remove the entry
        data = [entry for entry in data if entry['id'] != data_id]
        
        # Save updated data
        save_data(data)
        
        return jsonify({'message': 'Data deleted successfully'})
        
    except Exception:
        return jsonify({'error': 'Failed to delete data'}), 500

@app.route('/api/clear', methods=['POST'])
def clear_all_data():
    """Clear all data"""
    try:
        save_data([])
        return jsonify({'message': 'All data cleared successfully'})
    except Exception:
        return jsonify({'error': 'Failed to clear data'}), 500

# -----------------------------
# Chatbot (Gemini) endpoint
# -----------------------------

@app.route('/api/chat', methods=['POST'])
def chat_route():
    try:
        # Lazy import so the server can run without the dependency when not used
        try:
            import google.generativeai as _genai  # type: ignore
        except Exception as e:
            return jsonify({'error': 'Chat dependency not installed on server'}), 500

        # Accept both JSON and form-data
        if request.content_type and 'multipart/form-data' in request.content_type:
            raw_messages = request.form.get('messages')
            import json as _json
            messages = _json.loads(raw_messages) if raw_messages else []
        else:
            messages = request.json.get('messages', []) if request.is_json else []

        prompt = _collapse_messages_for_llm(messages)

        # If a file is attached, prepend a note
        uploaded_file = None
        try:
            uploaded_file = request.files.get('file')
        except Exception:
            uploaded_file = None
        if uploaded_file is not None:
            prompt = f"[User uploaded file: {uploaded_file.filename}]\n" + prompt

        # Add a system priming for healthcare advisor
        system_instruction = (
            "You are MedSplit, a compassionate healthcare advisor assistant. "
            "Prefer brevity (1–2 sentences). For greetings, give a short friendly reply and a concise follow-up question. "
            "Only reference user documents if the user asks or context clearly requires it. "
            "Add safety disclaimers only when giving medical advice or discussing risks."
        )
        full_prompt = f"[System]\n{system_instruction}\n\n{prompt}"

        # Fallback response when GEMINI_API_KEY is missing
        if not _GEMINI_API_KEY:
            reply = (
                "I'm your MedSplit healthcare assistant. I can't access AI right now, "
                "but I can help summarize and guide you based on your message and uploaded document names. "
                "Please consult a licensed clinician for medical decisions."
            )
            return jsonify({'reply': reply})

        _genai.configure(api_key=_GEMINI_API_KEY)

        # Quick mode support for faster, shorter outputs
        quick = False
        try:
            if request.content_type and 'multipart/form-data' in (request.content_type or ''):
                quick = (request.form.get('quick') == '1')
            elif request.is_json:
                quick = bool((request.json or {}).get('quick'))
        except Exception:
            quick = False

        model = _genai.GenerativeModel(_GEMINI_MODEL)
        if quick:
            resp = model.generate_content(full_prompt, generation_config={
                'max_output_tokens': 120,
                'temperature': 0.4,
                'top_p': 0.8,
                'top_k': 40,
            })
        else:
            resp = model.generate_content(full_prompt)
        # Robust extraction across shapes
        reply = _extract_text_from_response(resp)
        # If quick mode produced no text, fall back to a standard generation
        if quick and not reply:
            try:
                resp_full = model.generate_content(full_prompt)
                reply = _extract_text_from_response(resp_full)
            except Exception:
                pass
        if not reply:
            reply = "I couldn't generate a response. Please try again."
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/stream', methods=['POST'])
def chat_stream_route():
    """Server-Sent Events streaming endpoint for faster perceived responses."""
    try:
        try:
            import google.generativeai as _genai  # type: ignore
        except Exception:
            return jsonify({'error': 'Chat dependency not installed on server'}), 500

        # Accept JSON only for streaming for simplicity
        if not request.is_json:
            return jsonify({'error': 'application/json required'}), 400
        messages = request.json.get('messages', [])
        quick = bool(request.json.get('quick', False))

        prompt = _collapse_messages_for_llm(messages)

        system_instruction = (
            "You are MedSplit, a compassionate healthcare advisor assistant. "
            "Prefer brevity (1–2 sentences). For greetings, give a short friendly reply and a concise follow-up question. "
            "Only reference user documents if the user asks or context clearly requires it. "
            "Add safety disclaimers only when giving medical advice or discussing risks."
        )
        full_prompt = f"[System]\n{system_instruction}\n\n{prompt}"

        if not _GEMINI_API_KEY:
            # Stream a single fallback message
            def _fallback_gen():
                yield "data: I'm your MedSplit assistant. AI is unavailable right now.\n\n"
                yield "event: done\ndata: [DONE]\n\n"
            return Response(_fallback_gen(), mimetype='text/event-stream', headers={
                'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'
            })

        _genai.configure(api_key=_GEMINI_API_KEY)

        model = _genai.GenerativeModel(_GEMINI_MODEL)
        gen_cfg = {'max_output_tokens': 120, 'temperature': 0.4, 'top_p': 0.8, 'top_k': 40} if quick else None

        def event_stream():
            try:
                if gen_cfg:
                    responses = model.generate_content(full_prompt, stream=True, generation_config=gen_cfg)
                else:
                    responses = model.generate_content(full_prompt, stream=True)
                for chunk in responses:
                    try:
                        piece = _extract_text_from_response(chunk)
                        if piece:
                            # Normalize newlines for SSE
                            piece = piece.replace("\r\n", "\n")
                            for line in piece.split("\n"):
                                if line:
                                    yield f"data: {line}\n\n"
                    except Exception:
                        continue
                yield "event: done\ndata: [DONE]\n\n"
            except Exception as e:
                yield f"event: error\ndata: {str(e)}\n\n"
        return Response(event_stream(), mimetype='text/event-stream', headers={
            'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -----------------------------
# Generic helpers for CRUD
# -----------------------------

def _find_by_id(items, item_id):
    for item in items:
        if int(item.get('id')) == int(item_id):
            return item
    return None

def _list_items(collection):
    db = load_db()
    items = db.get(collection, [])
    # Basic filtering by simple equality on query params
    if request.args:
        filtered = []
        for item in items:
            include = True
            for key, value in request.args.items():
                if key == 'query':
                    # handled elsewhere (e.g., search)
                    continue
                if str(item.get(key)) != value:
                    include = False
                    break
            if include:
                filtered.append(item)
        items = filtered
    return jsonify(items)

def _get_item(collection, item_id):
    db = load_db()
    item = _find_by_id(db.get(collection, []), item_id)
    if not item:
        return jsonify({'error': f'{collection[:-1].capitalize()} not found'}), 404
    return jsonify(item)

def _create_item(collection, payload, defaults=None):
    db = load_db()
    item = {**(defaults or {}), **(payload or {})}
    item['id'] = _next_id(db, collection)
    # Add created_at if not provided
    item.setdefault('created_at', datetime.now().isoformat())
    db[collection].append(item)
    save_db(db)
    return jsonify(item), 201

def _update_item(collection, item_id, payload):
    db = load_db()
    items = db.get(collection, [])
    item = _find_by_id(items, item_id)
    if not item:
        return jsonify({'error': f'{collection[:-1].capitalize()} not found'}), 404
    # Prevent id overwrite
    payload = {k: v for k, v in (payload or {}).items() if k != 'id'}
    item.update(payload)
    save_db(db)
    return jsonify(item)

def _delete_item(collection, item_id):
    db = load_db()
    items = db.get(collection, [])
    item = _find_by_id(items, item_id)
    if not item:
        return jsonify({'error': f'{collection[:-1].capitalize()} not found'}), 404
    db[collection] = [i for i in items if int(i.get('id')) != int(item_id)]
    save_db(db)
    return jsonify({'message': 'Deleted successfully'})

# -----------------------------
# Users
# -----------------------------

@app.route('/api/users', methods=['GET'])
def list_users():
    return _list_items('users')

@app.route('/api/users/<int:item_id>', methods=['GET'])
def get_user(item_id):
    return _get_item('users', item_id)

@app.route('/api/users', methods=['POST'])
def create_user():
    payload = request.get_json() or {}
    # Minimal validation
    if 'email' not in payload or 'password' not in payload:
        return jsonify({'error': 'email and password are required'}), 400
    payload.setdefault('role', 'patient')
    payload.setdefault('phone', '')
    payload.setdefault('num_meds_requested', 0)
    payload.setdefault('pending_approval_meds', [])
    return _create_item('users', payload)

@app.route('/api/users/<int:item_id>', methods=['PUT', 'PATCH'])
def update_user(item_id):
    payload = request.get_json() or {}
    return _update_item('users', item_id, payload)

@app.route('/api/users/<int:item_id>', methods=['DELETE'])
def delete_user(item_id):
    return _delete_item('users', item_id)

# -----------------------------
# Medicines
# -----------------------------

@app.route('/api/medicines', methods=['GET'])
def list_medicines():
    # Support simple search via ?query= across name and generic_name
    db = load_db()
    items = db.get('medicines', [])
    query = (request.args.get('query') or '').strip().lower()
    if query:
        items = [
            m for m in items
            if query in (m.get('name', '').lower()) or query in (m.get('generic_name', '').lower())
        ]
    # Optional additional exact-match filters are handled generically
    if request.args:
        filtered = []
        for item in items:
            include = True
            for key, value in request.args.items():
                if key == 'query':
                    continue
                if str(item.get(key)) != value:
                    include = False
                    break
            if include:
                filtered.append(item)
        items = filtered
    return jsonify(items)

@app.route('/api/medicines/<int:item_id>', methods=['GET'])
def get_medicine(item_id):
    return _get_item('medicines', item_id)

@app.route('/api/medicines', methods=['POST'])
def create_medicine():
    payload = request.get_json() or {}
    # Normalize keys
    defaults = {
        'name': payload.get('name', ''),
        'generic_name': payload.get('generic_name', ''),
        'description': payload.get('description', ''),
        'expire_at': payload.get('expire_at', None),
        'current_demand': payload.get('current_demand', 0),
        'required_demand': payload.get('required_demand', 20),
    }
    return _create_item('medicines', payload, defaults=defaults)

@app.route('/api/medicines/<int:item_id>', methods=['PUT', 'PATCH'])
def update_medicine(item_id):
    payload = request.get_json() or {}
    return _update_item('medicines', item_id, payload)

@app.route('/api/medicines/<int:item_id>', methods=['DELETE'])
def delete_medicine(item_id):
    return _delete_item('medicines', item_id)

# -----------------------------
# Wishlists
# -----------------------------

@app.route('/api/wishlists', methods=['GET'])
def list_wishlists():
    return _list_items('wishlists')

@app.route('/api/wishlists/<int:item_id>', methods=['GET'])
def get_wishlist(item_id):
    return _get_item('wishlists', item_id)

@app.route('/api/wishlists', methods=['POST'])
def create_wishlist():
    payload = request.get_json() or {}
    defaults = {
        'user_id': payload.get('user_id'),
        'medicine_id': payload.get('medicine_id'),
        'quantity': payload.get('quantity', 1),
        'approved': payload.get('approved', False),
    }
    # Create wishlist item
    response = _create_item('wishlists', payload, defaults=defaults)
    # Increment medicine demand and create a notification
    try:
        db = load_db()
        med = _find_by_id(db.get('medicines', []), defaults.get('medicine_id'))
        if med is not None:
            med['current_demand'] = int(med.get('current_demand', 0)) + 1
            save_db(db)
        # Create notification for user
        notif_payload = {
            'user_id': defaults.get('user_id'),
            'type': 'wishlist',
            'title': 'Added to Wishlist',
            'message': f"Your request for {med.get('name') if med else 'medicine'} was added to wishlist.",
            'read': False,
        }
        _create_item('notifications', notif_payload)
    except Exception:
        pass
    return response

@app.route('/api/wishlists/<int:item_id>', methods=['PUT', 'PATCH'])
def update_wishlist(item_id):
    payload = request.get_json() or {}
    return _update_item('wishlists', item_id, payload)

@app.route('/api/wishlists/<int:item_id>', methods=['DELETE'])
def delete_wishlist(item_id):
    return _delete_item('wishlists', item_id)

# -----------------------------
# Donations
# -----------------------------

@app.route('/api/donations', methods=['GET'])
def list_donations():
    # Support simple search via ?query= across related medicine name and generic_name
    db = load_db()
    donations = db.get('donations', [])
    query = (request.args.get('query') or '').strip().lower()
    if query:
        medicines = db.get('medicines', [])
        matching_med_ids = set(
            m.get('id') for m in medicines
            if query in (m.get('name', '').lower()) or query in (m.get('generic_name', '').lower())
        )
        donations = [
            d for d in donations
            if (d.get('medicine_id') in matching_med_ids) or (query in str(d.get('medicine_name', '')).lower())
        ]
    # Optional additional exact-match filters are handled generically (excluding query)
    if request.args:
        filtered = []
        for item in donations:
            include = True
            for key, value in request.args.items():
                if key == 'query':
                    continue
                if str(item.get(key)) != value:
                    include = False
                    break
            if include:
                filtered.append(item)
        donations = filtered
    return jsonify(donations)

@app.route('/api/donations/<int:item_id>', methods=['GET'])
def get_donation(item_id):
    return _get_item('donations', item_id)

@app.route('/api/donations', methods=['POST'])
def create_donation():
    payload = request.get_json() or {}
    # If medicine_id not provided, try to resolve from medicine_name
    try:
        if not payload.get('medicine_id') and payload.get('medicine_name'):
            db = load_db()
            name_q = str(payload.get('medicine_name', '')).strip().lower()
            match = None
            for m in db.get('medicines', []):
                if name_q and (name_q in str(m.get('name', '')).lower() or name_q in str(m.get('generic_name', '')).lower()):
                    match = m
                    break
            if match:
                payload['medicine_id'] = match.get('id')
    except Exception:
        pass
    # Coerce quantity to an integer if a string like "30 tablets" was provided
    raw_qty = payload.get('quantity', 1)
    qty = 1
    try:
        if isinstance(raw_qty, str):
            digits = ''.join(ch for ch in raw_qty if ch.isdigit())
            qty = int(digits) if digits else 1
        else:
            qty = int(raw_qty)
    except Exception:
        qty = 1
    defaults = {
        'donor_id': payload.get('donor_id'),
        'medicine_id': payload.get('medicine_id'),
        'medicine_name': payload.get('medicine_name', ''),
        'quantity': qty,
        'quantity_text': payload.get('quantity_text', raw_qty if isinstance(raw_qty, str) else ''),
        'medicine_expires_at': payload.get('medicine_expires_at', None),
        'condition': payload.get('condition', ''),
        'doctor_name': payload.get('doctor_name', ''),
        'notes': payload.get('notes', ''),
    }
    return _create_item('donations', payload, defaults=defaults)

@app.route('/api/donations/<int:item_id>', methods=['PUT', 'PATCH'])
def update_donation(item_id):
    payload = request.get_json() or {}
    return _update_item('donations', item_id, payload)

@app.route('/api/donations/<int:item_id>', methods=['DELETE'])
def delete_donation(item_id):
    return _delete_item('donations', item_id)

# -----------------------------
# Grants
# -----------------------------

@app.route('/api/grants', methods=['GET'])
def list_grants():
    return _list_items('grants')

@app.route('/api/grants/<int:item_id>', methods=['GET'])
def get_grant(item_id):
    return _get_item('grants', item_id)

@app.route('/api/grants', methods=['POST'])
def create_grant():
    payload = request.get_json() or {}
    defaults = {
        'requestor_id': payload.get('requestor_id'),
        'title': payload.get('title', ''),
        'description': payload.get('description', ''),
    }
    return _create_item('grants', payload, defaults=defaults)

@app.route('/api/grants/<int:item_id>', methods=['PUT', 'PATCH'])
def update_grant(item_id):
    payload = request.get_json() or {}
    return _update_item('grants', item_id, payload)

@app.route('/api/grants/<int:item_id>', methods=['DELETE'])
def delete_grant(item_id):
    return _delete_item('grants', item_id)

# -----------------------------
# Profiles
# -----------------------------

@app.route('/api/profiles', methods=['GET'])
def list_profiles():
    return _list_items('profiles')

@app.route('/api/profiles/<int:item_id>', methods=['GET'])
def get_profile(item_id):
    return _get_item('profiles', item_id)

@app.route('/api/profiles', methods=['POST'])
def create_profile():
    payload = request.get_json() or {}
    defaults = {
        'first_name': payload.get('first_name', ''),
        'last_name': payload.get('last_name', ''),
        'phone': payload.get('phone', ''),
        'address': payload.get('address', ''),
        'emergency_contact': payload.get('emergency_contact', ''),
        'date_of_birth': payload.get('date_of_birth', ''),
        'bio': payload.get('bio', ''),
        'medical_conditions': payload.get('medical_conditions', []),
        'allergies': payload.get('allergies', []),
        'user_id': payload.get('user_id'),
    }
    return _create_item('profiles', payload, defaults=defaults)

@app.route('/api/profiles/<int:item_id>', methods=['PUT', 'PATCH'])
def update_profile(item_id):
    payload = request.get_json() or {}
    return _update_item('profiles', item_id, payload)

@app.route('/api/profiles/<int:item_id>', methods=['DELETE'])
def delete_profile(item_id):
    return _delete_item('profiles', item_id)

# -----------------------------
# Counters (per-user activity counters)
# -----------------------------

@app.route('/api/counters', methods=['GET'])
def list_counters():
    return _list_items('counters')

@app.route('/api/counters/<int:item_id>', methods=['GET'])
def get_counter(item_id):
    return _get_item('counters', item_id)

@app.route('/api/counters', methods=['POST'])
def create_counter():
    payload = request.get_json() or {}
    defaults = {
        'user_id': payload.get('user_id'),
        'medicine_purchases': payload.get('medicine_purchases', 0),
        'donations': payload.get('donations', 0),
        'grant_given': payload.get('grant_given', 0),
    }
    return _create_item('counters', payload, defaults=defaults)

@app.route('/api/counters/<int:item_id>', methods=['PUT', 'PATCH'])
def update_counter(item_id):
    payload = request.get_json() or {}
    return _update_item('counters', item_id, payload)

@app.route('/api/counters/<int:item_id>', methods=['DELETE'])
def delete_counter(item_id):
    return _delete_item('counters', item_id)

# -----------------------------
# Notifications
# -----------------------------

@app.route('/api/notifications', methods=['GET'])
def list_notifications():
    return _list_items('notifications')

@app.route('/api/notifications/<int:item_id>', methods=['GET'])
def get_notification(item_id):
    return _get_item('notifications', item_id)

@app.route('/api/notifications', methods=['POST'])
def create_notification():
    payload = request.get_json() or {}
    defaults = {
        'user_id': payload.get('user_id'),
        'type': payload.get('type', ''),
        'title': payload.get('title', ''),
        'message': payload.get('message', ''),
        'read': payload.get('read', False),
    }
    return _create_item('notifications', payload, defaults=defaults)

@app.route('/api/notifications/<int:item_id>', methods=['PUT', 'PATCH'])
def update_notification(item_id):
    payload = request.get_json() or {}
    return _update_item('notifications', item_id, payload)

@app.route('/api/notifications/<int:item_id>', methods=['DELETE'])
def delete_notification(item_id):
    return _delete_item('notifications', item_id)

@app.route('/api/notifications/clear', methods=['POST'])
def clear_notifications():
    """Clear all notifications or mark as read. Query param action=delete|read (default read). Optional user_id filter."""
    action = request.args.get('action', 'read')
    user_id = request.args.get('user_id')
    db = load_db()
    items = db.get('notifications', [])
    if user_id is not None:
        # filter by user_id (string compare safe)
        target = [n for n in items if str(n.get('user_id')) == str(user_id)]
    else:
        target = items

    if action == 'delete':
        if user_id is not None:
            db['notifications'] = [n for n in items if str(n.get('user_id')) != str(user_id)]
        else:
            db['notifications'] = []
        save_db(db)
        return jsonify({'message': 'Notifications cleared'})
    else:
        # mark as read
        for n in target:
            n['read'] = True
        save_db(db)
        return jsonify({'message': 'Notifications marked as read'})

# -----------------------------
# Transactions & Fund Summary
# -----------------------------

@app.route('/api/transactions', methods=['GET'])
def list_transactions():
    return _list_items('transactions')

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    payload = request.get_json() or {}
    tx_type = payload.get('type')
    amount = payload.get('amount')
    if tx_type not in ['contribution', 'disbursement']:
        return jsonify({'error': 'type must be contribution or disbursement'}), 400
    try:
        amount = float(amount)
    except Exception:
        return jsonify({'error': 'amount must be a number'}), 400
    if amount <= 0:
        return jsonify({'error': 'amount must be > 0'}), 400
    defaults = {
        'user_id': payload.get('user_id'),
        'type': tx_type,
        'amount': amount,
        'note': payload.get('note', ''),
    }
    return _create_item('transactions', payload, defaults=defaults)

@app.route('/api/fund/summary', methods=['GET'])
def fund_summary():
    db = load_db()
    txs = db.get('transactions', [])
    total_contributions = sum(t.get('amount', 0) for t in txs if t.get('type') == 'contribution')
    total_disbursements = sum(t.get('amount', 0) for t in txs if t.get('type') == 'disbursement')
    balance = total_contributions - total_disbursements
    recent = sorted(txs, key=lambda t: t.get('created_at', ''), reverse=True)[:10]
    return jsonify({
        'balance': balance,
        'total_contributions': total_contributions,
        'total_disbursements': total_disbursements,
        'recent': recent,
    })

# -----------------------------
# Actions: Donation Claim & Wishlist Approve
# -----------------------------

@app.route('/api/donations/<int:item_id>/claim', methods=['POST'])
def claim_donation(item_id):
    payload = request.get_json() or {}
    user_id = payload.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    db = load_db()
    donation = _find_by_id(db.get('donations', []), item_id)
    if not donation:
        return jsonify({'error': 'Donation not found'}), 404
    if donation.get('claimed_by'):
        return jsonify({'error': 'Donation already claimed'}), 400
    donation['claimed_by'] = user_id
    donation['claimed_at'] = datetime.now().isoformat()
    donation['claim_status'] = 'pending'
    save_db(db)
    # Notify donor (if any) and claimer
    try:
        med_name = donation.get('medicine_name')
        if not med_name:
            med = _find_by_id(db.get('medicines', []), donation.get('medicine_id'))
            med_name = (med or {}).get('name') or f"donation #{item_id}"
    except Exception:
        med_name = f"donation #{item_id}"
    _create_item('notifications', {
        'user_id': user_id,
        'type': 'donation',
        'title': 'Request Submitted',
        'message': f"You requested {med_name}.",
    })
    return jsonify({'message': 'Donation claimed'})

@app.route('/api/wishlists/<int:item_id>/approve', methods=['POST'])
def approve_wishlist(item_id):
    db = load_db()
    item = _find_by_id(db.get('wishlists', []), item_id)
    if not item:
        return jsonify({'error': 'Wishlist not found'}), 404
    if item.get('approved') is True:
        return jsonify({'message': 'Already approved'})
    item['approved'] = True
    save_db(db)
    # Notify user
    try:
        med = _find_by_id(db.get('medicines', []), item.get('medicine_id'))
        med_name = (med or {}).get('name') or f"medicine #{item.get('medicine_id')}"
    except Exception:
        med_name = f"medicine #{item.get('medicine_id')}"
    _create_item('notifications', {
        'user_id': item.get('user_id'),
        'type': 'approval',
        'title': 'Request Approved',
        'message': f"Your request for {med_name} has been approved.",
        # Provide an action link to checkout the medicine
        'action_url': f"/checkout/{item.get('medicine_id')}",
    })
    return jsonify(item)

@app.route('/api/wishlists/<int:item_id>/reject', methods=['POST'])
def reject_wishlist(item_id):
    db = load_db()
    item = _find_by_id(db.get('wishlists', []), item_id)
    if not item:
        return jsonify({'error': 'Wishlist not found'}), 404
    item['approved'] = False
    item['rejected_at'] = datetime.now().isoformat()
    save_db(db)
    try:
        med = _find_by_id(db.get('medicines', []), item.get('medicine_id'))
        med_name = (med or {}).get('name') or f"medicine #{item.get('medicine_id')}"
    except Exception:
        med_name = f"medicine #{item.get('medicine_id')}"
    _create_item('notifications', {
        'user_id': item.get('user_id'),
        'type': 'approval',
        'title': 'Request Rejected',
        'message': f"Your request for {med_name} was not approved at this time.",
    })
    return jsonify(item)

@app.route('/api/donations/<int:item_id>/approve-claim', methods=['POST'])
def approve_donation_claim(item_id):
    db = load_db()
    donation = _find_by_id(db.get('donations', []), item_id)
    if not donation:
        return jsonify({'error': 'Donation not found'}), 404
    if not donation.get('claimed_by'):
        return jsonify({'error': 'No pending claim'}), 400
    donation['claim_status'] = 'approved'
    donation['claim_decided_at'] = datetime.now().isoformat()
    save_db(db)
    try:
        med_name = donation.get('medicine_name')
        if not med_name:
            db = load_db()
            med = _find_by_id(db.get('medicines', []), donation.get('medicine_id'))
            med_name = (med or {}).get('name') or f"donation #{item_id}"
    except Exception:
        med_name = f"donation #{item_id}"
    _create_item('notifications', {
        'user_id': donation.get('claimed_by'),
        'type': 'donation',
        'title': 'Request Approved',
        'message': f"Your request for {med_name} was approved.",
        'action_url': f"/donate-meds?highlight={item_id}",
    })
    return jsonify(donation)

@app.route('/api/donations/<int:item_id>/reject-claim', methods=['POST'])
def reject_donation_claim(item_id):
    db = load_db()
    donation = _find_by_id(db.get('donations', []), item_id)
    if not donation:
        return jsonify({'error': 'Donation not found'}), 404
    if not donation.get('claimed_by'):
        return jsonify({'error': 'No pending claim'}), 400
    user_id = donation.get('claimed_by')
    donation['claim_status'] = 'rejected'
    donation['claim_decided_at'] = datetime.now().isoformat()
    save_db(db)
    try:
        med_name = donation.get('medicine_name')
        if not med_name:
            db = load_db()
            med = _find_by_id(db.get('medicines', []), donation.get('medicine_id'))
            med_name = (med or {}).get('name') or f"donation #{item_id}"
    except Exception:
        med_name = f"donation #{item_id}"
    _create_item('notifications', {
        'user_id': user_id,
        'type': 'donation',
        'title': 'Request Rejected',
        'message': f"Your request for {med_name} was rejected.",
    })
    return jsonify(donation)

# Allow a user to cancel their pending claim
@app.route('/api/donations/<int:item_id>/cancel-claim', methods=['POST'])
def cancel_donation_claim(item_id):
    payload = request.get_json() or {}
    user_id = payload.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    db = load_db()
    donation = _find_by_id(db.get('donations', []), item_id)
    if not donation:
        return jsonify({'error': 'Donation not found'}), 404
    if donation.get('claimed_by') != user_id:
        return jsonify({'error': 'Not your request to cancel'}), 403
    # Only allow cancel if still pending
    if donation.get('claim_status') not in (None, 'pending'):
        return jsonify({'error': 'Cannot cancel after decision'}), 400
    # Reset claim fields
    donation['claimed_by'] = None
    donation['claimed_at'] = None
    donation['claim_status'] = None
    donation['claim_decided_at'] = None
    save_db(db)
    try:
        med_name = donation.get('medicine_name')
        if not med_name:
            med = _find_by_id(db.get('medicines', []), donation.get('medicine_id'))
            med_name = (med or {}).get('name') or f"donation #{item_id}"
    except Exception:
        med_name = f"donation #{item_id}"
    _create_item('notifications', {
        'user_id': user_id,
        'type': 'donation',
        'title': 'Request Canceled',
        'message': f"You canceled your request for {med_name}.",
    })
    return jsonify({'message': 'Claim canceled'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', '5050'))
    app.run(debug=True, port=port)