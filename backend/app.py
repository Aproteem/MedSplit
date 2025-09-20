from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# JSON file to store data
DATA_FILE = 'data.json'

def load_data():
    """Load data from JSON file"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_data(data):
    """Save data to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

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
        
    except Exception as e:
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
        
    except Exception as e:
        return jsonify({'error': 'Failed to delete data'}), 500

@app.route('/api/clear', methods=['POST'])
def clear_all_data():
    """Clear all data"""
    try:
        save_data([])
        return jsonify({'message': 'All data cleared successfully'})
    except Exception as e:
        return jsonify({'error': 'Failed to clear data'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)