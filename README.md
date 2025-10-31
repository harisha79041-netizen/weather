Weather App 🌤️

A comprehensive, full-stack weather application that delivers real-time climate data and forecasts for cities worldwide. Built with Flask, JavaScript, and modern web technologies, this app features dynamic backgrounds, persistent search history, and an intuitive user interface designed for both desktop and mobile devices.
🌟 Features
Core Weather Functionality

Real-Time Weather Data: Access current temperature, humidity, wind speed, atmospheric pressure, and detailed weather descriptions for over 200,000 cities globally
5-Day Weather Forecast: View comprehensive daily forecasts with high/low temperatures, precipitation chances, and wind conditions to plan ahead
Dynamic Background Images: Experience location-specific imagery that automatically updates based on your searched city and current weather conditions
Live Time Display: Track current date and time with second-by-second updates throughout your session
Temperature Unit Toggle: Seamlessly switch between Celsius and Fahrenheit to match your regional preferences

User Experience

Persistent Search History: Automatically saves your last 15 weather searches with timestamps, allowing quick access to frequently monitored locations
Secure Authentication: Login system protects your personalized settings and search history from unauthorized access
Responsive Design: Fully optimized interface that adapts beautifully across desktops, tablets, and smartphones
Interactive UI Elements: Hover effects, smooth transitions, and animated loading states create an engaging user experience
Multi-Section Navigation: Organized tabs for Weather, Forecast, Settings, About, and History pages with intuitive switching

🛠️ Technology Stack
Backend

Flask: Python web framework handling API routing, session management, and server-side logic
Werkzeug: Provides secure password hashing and authentication utilities
Python Requests: Manages HTTP communication with external weather and image APIs

Frontend

HTML5/CSS3: Semantic markup and modern styling with gradients, animations, and glassmorphism effects
JavaScript (ES6+): Asynchronous API calls, DOM manipulation, and interactive functionality
Google Fonts: Open Sans typeface for clean, professional typography

APIs

OpenWeatherMap API: Supplies accurate weather data and forecasts using free-tier endpoints
Unsplash API: Delivers high-quality, royalty-free location photography for dynamic backgrounds

📋 Prerequisites
Before running this application, ensure you have the following installed:

Python 3.7+: Download from python.org
pip: Python package manager (included with Python 3.4+)
API Keys: Free accounts required for OpenWeatherMap and Unsplash services

🚀 Installation & Setup
1. Clone the Repository
bashgit clone <repository-url>
cd weather-app
2. Install Dependencies
bashpip install flask requests python-dotenv werkzeug
3. Configure API Keys
Create an api.env file in the project root directory with your credentials:
envOPENWEATHER_API_KEY=your_openweathermap_api_key_here
UNSPLASH_API_KEY=your_unsplash_api_key_here
```

**Obtaining API Keys:**
- **OpenWeatherMap**: Register at [openweathermap.org/api](https://openweathermap.org/api) and copy your free API key
- **Unsplash**: Sign up at [unsplash.com/developers](https://unsplash.com/developers) and create a new application to receive your access key

### 4. Project Structure
Ensure your directory structure matches the following layout:
```
weather-app/
├── app.py                 # Flask application with API routes
├── api.env               # Environment variables (API keys)
├── templates/
│   ├── show_login.html   # Login page
│   ├── index.html        # Main weather dashboard
│   └── history.html      # Search history page
└── static/
    └── js/
        └── script.js     # Frontend JavaScript logic
5. Configure Login Credentials
Open app.py and set your desired login credentials by modifying these variables:
pythonVALID_USERNAME = "your_username"
VALID_PASSWORD_HASH = generate_password_hash("your_password")
6. Run the Application
bashpython app.py
The server will start at http://localhost:5000. Open this URL in your web browser to access the application.
🔐 Authentication
The application includes a secure login system with session management. Configure your own username and password in the app.py file before first use to protect your personalized settings and search history.
📖 Usage Guide
Searching for Weather

Log in with your credentials on the initial landing page
Enter any city name in the search bar (e.g., "London", "Tokyo", "New York")
Click the "🔍 Search" button or press Enter to fetch weather data
View current conditions, detailed metrics, and automatically updated forecasts

Navigating Sections

Weather: Displays current temperature, feels-like temperature, humidity, pressure, wind speed, and live date/time
Forecast: Shows a 5-day outlook with daily highs/lows, weather descriptions, and condition icons
Settings: Toggle between Celsius/Fahrenheit units (additional customization options coming soon)
About: Learn about the app's features, technology stack, and data sources
History: Review your last 15 searches with timestamps and quick re-search functionality

Managing History

Access the History page to view statistics including total searches, unique cities, and last search time
Click "Search Again" on any history item to instantly reload that city's weather
Clear all history using the "Clear All History" button (requires confirmation)

🎨 Design Highlights

Dark Theme with Golden Accents: High-contrast interface using black backgrounds with vibrant yellow (#ffcc00) highlights
Gradient Effects: Subtle gradients on cards, buttons, and navigation elements create depth
Glassmorphism: Translucent panels with backdrop blur effects for modern aesthetics
Responsive Grid Layouts: Automatically adjusts column counts based on screen size
Smooth Animations: CSS transitions and keyframe animations enhance interactivity
Weather-Matched Backgrounds: Real city photos from Unsplash reflect current atmospheric conditions

📱 Mobile Optimization
The application includes comprehensive media queries for screens below 768px width:

Stacked navigation with reduced font sizes
Full-width search bar and buttons
Single-column forecast cards
Optimized spacing and padding for touch interfaces
Readable typography scaled for smaller viewports

🔧 Troubleshooting
Weather Data Not Loading

Verify API keys are correctly set in api.env with no extra spaces
Check that your OpenWeatherMap account is activated (may take up to 2 hours after registration)
Ensure your internet connection is stable and not blocking API requests

"City Not Found" Error

Confirm spelling and try variations (e.g., "New York" vs "New York City")
Use English city names for best results
Try adding the country name (e.g., "Paris, France" vs "Paris, Texas")

Background Images Not Displaying

Check Unsplash API key validity and rate limits (50 requests/hour on free tier)
Verify browser allows loading external images from unsplash.com
Clear browser cache and reload the page

Login Issues

Double-check username and password match your configured credentials exactly (case-sensitive)
Clear browser cookies and session data, then restart the application
Review Flask console for authentication error messages

🚀 Future Enhancements

Weather Alerts: Push notifications for severe weather warnings in saved locations
Geolocation: Automatic detection of user's current location for instant local weather
Extended Forecasts: 10-day and hourly forecasts for detailed planning
Weather Maps: Interactive radar and satellite imagery overlays
Multi-Language Support: Internationalization for global accessibility
Dark/Light Mode Toggle: User-selectable themes beyond the default dark interface
Favorite Locations: Pin frequently checked cities for one-click access
Weather Widgets: Embeddable components for external websites

📄 License
This project is open-source and available under the MIT License. Feel free to modify, distribute, and use for personal or commercial purposes with proper attribution.
🤝 Contributing
Contributions are welcome! Please follow these guidelines:

Fork the repository and create a feature branch
Write clean, commented code following existing style conventions
Test thoroughly across different browsers and devices
Submit a pull request with a detailed description of changes

📧 Contact & Support
For bug reports, feature requests, or general inquiries, please contact:

Email: support@weatherapp.com
GitHub Issues: Submit detailed reports through the repository's issue tracker

🙏 Acknowledgments

OpenWeatherMap: Providing reliable, free-tier weather data APIs
Unsplash: Curating beautiful, high-resolution photography for dynamic backgrounds
Google Fonts: Offering the Open Sans typeface for enhanced readability
Flask Community: Maintaining excellent documentation and extension libraries
