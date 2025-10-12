from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import requests
import os
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash

# Initialize Flask
app = Flask(__name__, 
            static_folder='static',
            static_url_path='/static')

# Secret key for session management
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))

# API Keys
OPENWEATHER_API_KEY = ""
UNSPLASH_API_KEY = ""

# Login credentials - Updated
VALID_USERNAME = "harish"
VALID_PASSWORD_HASH = generate_password_hash("56789")

@app.route('/')
def show_login():
    """Show login page"""
    if session.get('logged_in'):
        return redirect(url_for('index'))
    return render_template('show_login.html')

@app.route('/login', methods=['POST'])
def handle_login():
    """Handle login POST request"""
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    
    if username == VALID_USERNAME and check_password_hash(VALID_PASSWORD_HASH, password):
        session['logged_in'] = True
        session['username'] = username
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'})

@app.route('/logout')
def logout():
    """Handle logout"""
    session.clear()
    return redirect(url_for('show_login.html'))

@app.route('/index')
def index():
    """Weather page - requires login"""
    if not session.get('logged_in'):
        return redirect(url_for('show_login'))
    return render_template('index.html')

@app.route('/history')
def history():
    """History page - requires login"""
    if not session.get('logged_in'):
        return redirect(url_for('show_login'))
    return render_template('history.html')

@app.route('/api/weather/<city>')
def get_weather(city):
    """Fetch weather data for a city"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={OPENWEATHER_API_KEY}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            now = datetime.now()
            
            weather_data = {
                'city': data.get('name', 'Unknown'),
                'country': data.get('sys', {}).get('country', 'Unknown'),
                'temperature': round(data.get('main', {}).get('temp', 0), 1),
                'feels_like': round(data.get('main', {}).get('feels_like', 0), 1),
                'humidity': data.get('main', {}).get('humidity', 0),
                'pressure': data.get('main', {}).get('pressure', 0),
                'wind_speed': round((data.get('wind', {}).get('speed', 0) * 3.6), 1),
                'description': data.get('weather', [{}])[0].get('description', 'Unknown').capitalize(),
                'icon': data.get('weather', [{}])[0].get('icon', '01d'),
                'date': now.strftime('%A, %B %d, %Y'),
                'time': now.strftime('%I:%M:%S %p'),
                'sunrise': datetime.fromtimestamp(data.get('sys', {}).get('sunrise', 0)).strftime('%I:%M %p') if data.get('sys', {}).get('sunrise') else 'Unknown',
                'sunset': datetime.fromtimestamp(data.get('sys', {}).get('sunset', 0)).strftime('%I:%M %p') if data.get('sys', {}).get('sunset') else 'Unknown',
                'visibility': data.get('visibility', 0) / 1000 if data.get('visibility') else 0
            }
            
            return jsonify({'success': True, 'data': weather_data})
            
        elif response.status_code == 404:
            return jsonify({'success': False, 'message': 'City not found'})
        else:
            return jsonify({'success': False, 'message': 'Unable to fetch weather data'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Server error'})

@app.route('/api/background/<city>')
def get_background(city):
    """Fetch city background image"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    try:
        url = f"https://api.unsplash.com/search/photos?query={city}+cityscape&client_id={UNSPLASH_API_KEY}&per_page=1&orientation=landscape"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('results') and len(data['results']) > 0:
                image_url = data['results'][0]['urls']['regular']
                photographer = data['results'][0]['user']['name']
                return jsonify({
                    'success': True, 
                    'image_url': image_url,
                    'photographer': photographer
                })
            return jsonify({'success': False, 'message': 'No images found'})
        else:
            return jsonify({'success': False, 'message': 'Error fetching image'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error loading background'})

@app.route('/api/search-history', methods=['GET'])
def get_search_history():
    """Get search history"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    history = session.get('search_history', [])
    return jsonify({'success': True, 'history': history})

@app.route('/api/search-history', methods=['POST'])
def save_search_history():
    """Save search to history"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    data = request.get_json()
    city = data.get('city')
    
    if city:
        history = session.get('search_history', [])
        now = datetime.now()
        
        entry = {
            'city': city,
            'timestamp': now.strftime('%Y-%m-%d %I:%M:%S %p'),
            'date': now.strftime('%B %d, %Y'),
            'time': now.strftime('%I:%M %p')
        }
        
        history = [h for h in history if h.get('city', '').lower() != city.lower()]
        history.insert(0, entry)
        history = history[:10]
        
        session['search_history'] = history
        session.modified = True
        
        return jsonify({'success': True, 'message': 'Search saved'})
    
    return jsonify({'success': False, 'message': 'Invalid data'})

@app.route('/api/clear-history', methods=['POST'])
def clear_history():
    """Clear search history"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    session['search_history'] = []
    session.modified = True
    return jsonify({'success': True, 'message': 'History cleared'})

if __name__ == '__main__':
    # Create directories if they don't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("=" * 50)
    print("Weather App Starting...")
    print(f"OpenWeatherMap API: {'✓ Configured' if OPENWEATHER_API_KEY else '✗ Missing'}")
    print(f"Unsplash API: {'✓ Configured' if UNSPLASH_API_KEY else '✗ Missing'}")
    print("=" * 50)
    print("App running at: http://localhost:5000")
    print(f"Login: username=harish, password=56789")
    print("=" * 50)
    

    app.run(debug=True, host='0.0.0.0', port=5000)
