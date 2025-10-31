// ========== SELECTORS ==========
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const cityName = document.querySelector(".city");
const tempEl = document.querySelector(".temp");
const descEl = document.querySelector(".description");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const iconEl = document.querySelector(".icon");
const weatherDefault = document.querySelector(".weather-default");
const weatherData = document.querySelector(".weather-data");
const forecastContainer = document.getElementById("forecast-container");

// Default temperature unit (Celsius)
let isCelsius = true;
let currentWeatherData = null;
let currentCity = "";

// ========== EVENT LISTENERS ==========
if (searchBtn) {
  searchBtn.addEventListener("click", getWeather);
}

if (cityInput) {
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") getWeather();
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log("Weather app initialized");
  
  // Start time and date update immediately - this will keep updating every second
  updateDateTime();
  
  // Check if city parameter is in URL (from history page)
  const urlParams = new URLSearchParams(window.location.search);
  const cityFromUrl = urlParams.get('city');
  if (cityFromUrl && cityInput) {
    cityInput.value = cityFromUrl;
    getWeather();
  }
});

// ========== FETCH WEATHER ==========
async function getWeather() {
  if (!cityInput) {
    console.error("City input not found");
    return;
  }
  
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  currentCity = city;

  try {
    // Show loading state
    if (searchBtn) {
      searchBtn.disabled = true;
      searchBtn.innerHTML = '<span style="animation: spin 1s linear infinite; display: inline-block;">🔄</span> Loading...';
    }

    // Call Flask backend API
    const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
    const result = await response.json();
    console.log("Weather API response:", result);

    if (!result.success) {
      alert(result.message || "City not found! Please try again.");
      if (searchBtn) {
        searchBtn.disabled = false;
        searchBtn.innerHTML = "🔍 Search";
      }
      return;
    }

    const data = result.data;
    currentWeatherData = data;

    // Update UI - Main Weather Info
    if (weatherDefault) weatherDefault.style.display = "none";
    if (weatherData) weatherData.classList.add("show");
    if (cityName) cityName.textContent = `${data.city}, ${data.country}`;
    if (tempEl) tempEl.textContent = `${data.temperature}°C`;
    if (descEl) descEl.textContent = data.description;

    // Update UI - Detailed Weather Info
    if (feelsLikeEl) feelsLikeEl.textContent = `${data.feels_like}°C`;
    if (humidityEl) humidityEl.textContent = `${data.humidity}%`;
    if (windEl) windEl.textContent = `${data.wind_speed} km/h`;
    if (pressureEl) pressureEl.textContent = `${data.pressure} hPa`;
    if (dateEl) dateEl.textContent = data.date;
    if (timeEl) timeEl.textContent = data.time;

    // Weather icon
    if (iconEl) {
      iconEl.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
      iconEl.alt = data.description;
    }

    // Save to search history
    await saveToHistory(data.city);

    // Update background image (dynamic based on weather)
    updateBackground(city, data.description);

    // Auto-update forecast (even if not on forecast tab)
    await getForecast(city);

    // Reset button
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = "🔍 Search";
    }
    
    // Reset to Celsius
    isCelsius = true;
    
    console.log("Weather data loaded successfully:", data);
    
  } catch (error) {
    console.error("Weather fetch error:", error);
    alert("Unable to fetch weather data right now. Please try again.");
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = "🔍 Search";
    }
  }
}

// ========== FETCH 5-DAY FORECAST ==========
async function getForecast(city) {
  if (!city) {
    console.error("No city provided for forecast");
    if (forecastContainer) {
      forecastContainer.innerHTML = `
        <div class="forecast-day">
          <h4>📭 No Data</h4>
          <p>Please search for a city first</p>
        </div>
      `;
    }
    return;
  }

  try {
    // Show loading state
    if (forecastContainer) {
      forecastContainer.innerHTML = `
        <div class="forecast-day">
          <h4>⏳ Loading...</h4>
          <p>Fetching 5-day forecast...</p>
        </div>
      `;
    }

    const response = await fetch(`/api/forecast/${encodeURIComponent(city)}`);
    const result = await response.json();
    console.log("Forecast API response:", result);

    if (!result.success) {
      console.error("Forecast fetch failed:", result.message);
      if (forecastContainer) {
        forecastContainer.innerHTML = `
          <div class="forecast-day">
            <h4>❌ Error</h4>
            <p>${result.message || 'Unable to fetch forecast'}</p>
          </div>
        `;
      }
      return;
    }

    const forecast = result.data;
    if (forecast && forecast.length > 0) {
      displayForecast(forecast);
    } else {
      if (forecastContainer) {
        forecastContainer.innerHTML = `
          <div class="forecast-day">
            <h4>📭 No Data</h4>
            <p>No forecast available</p>
          </div>
        `;
      }
    }
    
  } catch (error) {
    console.error("Forecast fetch error:", error);
    if (forecastContainer) {
      forecastContainer.innerHTML = `
        <div class="forecast-day">
          <h4>❌ Error</h4>
          <p>Network error. Please try again.</p>
        </div>
      `;
    }
  }
}

// ========== DISPLAY 5-DAY FORECAST ==========
function displayForecast(forecastData) {
  if (!forecastContainer) {
    console.error("Forecast container not found");
    return;
  }
  
  if (!forecastData || forecastData.length === 0) {
    forecastContainer.innerHTML = `
      <div class="forecast-day">
        <h4>📭 No Data</h4>
        <p>Forecast not available</p>
      </div>
    `;
    return;
  }
  
  forecastContainer.innerHTML = '';
  
  forecastData.forEach((day, index) => {
    const forecastDay = document.createElement('div');
    forecastDay.className = 'forecast-day';
    forecastDay.style.animation = `slideIn 0.5s ease ${index * 0.1}s forwards`;
    forecastDay.style.opacity = '0';
    
    forecastDay.innerHTML = `
      <h4>${day.day || 'N/A'}</h4>
      <p class="forecast-date">${day.date || ''}</p>
      <img src="https://openweathermap.org/img/wn/${day.icon || '01d'}@2x.png" 
           alt="${day.description || 'Weather'}" 
           class="forecast-icon">
      <p class="forecast-desc">${day.description || 'No description'}</p>
      <div class="forecast-temps">
        <p class="temp-high">↑ ${day.temp_max || 0}°C</p>
        <p class="temp-low">↓ ${day.temp_min || 0}°C</p>
      </div>
      <div class="forecast-details">
        <p>💧 ${day.humidity || 0}%</p>
        <p>💨 ${day.wind_speed || 0} km/h</p>
      </div>
    `;
    
    forecastContainer.appendChild(forecastDay);
  });
  
  console.log(`Displayed ${forecastData.length} forecast days`);
}

// ========== UPDATE BACKGROUND ==========
async function updateBackground(city, description) {
  try {
    const response = await fetch(`/api/background/${encodeURIComponent(city)}/${encodeURIComponent(description)}`);
    const result = await response.json();
    console.log("Background API response:", result);
    
    if (result.success && result.image_url) {
      document.body.style.backgroundImage = `url(${result.image_url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      
      if (result.photographer) {
        console.log(`Photo by ${result.photographer} on Unsplash`);
      }
    } else {
      // Fallback to default background
      document.body.style.backgroundImage = `url('https://images.pexels.com/photos/209831/pexels-photo-209831.jpeg?cs=srgb&dl=pexels-pixabay-209831.jpg&fm=jpg')`;
      console.warn("Using fallback background:", result.message);
    }
  } catch (error) {
    console.error("Background fetch error:", error);
    // Fallback
    document.body.style.backgroundImage = `url('https://images.pexels.com/photos/209831/pexels-photo-209831.jpeg?cs=srgb&dl=pexels-pixabay-209831.jpg&fm=jpg')`;
  }
}

// ========== HISTORY STORAGE ==========
async function saveToHistory(city) {
  try {
    const response = await fetch('/api/search-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ city: city })
    });
    
    const result = await response.json();
    console.log("History save:", result.message);
  } catch (error) {
    console.error("Error saving to history:", error);
  }
}

// ========== TOGGLE UNITS ==========
function toggleUnits() {
  if (!tempEl || !feelsLikeEl) {
    console.error("Temperature elements not found");
    return;
  }
  
  const currentTempText = tempEl.textContent;
  if (!currentTempText || currentTempText === "--°C") {
    alert("Search for a city first!");
    return;
  }

  // Toggle main temperature
  let tempValue = parseFloat(currentTempText);
  let feelsLikeValue = parseFloat(feelsLikeEl.textContent);
  
  if (isNaN(tempValue) || isNaN(feelsLikeValue)) return;

  if (isCelsius) {
    // Convert to Fahrenheit
    tempValue = (tempValue * 9) / 5 + 32;
    feelsLikeValue = (feelsLikeValue * 9) / 5 + 32;
    tempEl.textContent = `${tempValue.toFixed(1)}°F`;
    feelsLikeEl.textContent = `${feelsLikeValue.toFixed(1)}°F`;
    isCelsius = false;
    
    // Update forecast if visible
    updateForecastUnits(false);
  } else {
    // Convert to Celsius
    tempValue = ((tempValue - 32) * 5) / 9;
    feelsLikeValue = ((feelsLikeValue - 32) * 5) / 9;
    tempEl.textContent = `${tempValue.toFixed(1)}°C`;
    feelsLikeEl.textContent = `${feelsLikeValue.toFixed(1)}°C`;
    isCelsius = true;
    
    // Update forecast if visible
    updateForecastUnits(true);
  }
}

// ========== UPDATE FORECAST UNITS ==========
function updateForecastUnits(toCelsius) {
  const tempHighElements = document.querySelectorAll('.temp-high');
  const tempLowElements = document.querySelectorAll('.temp-low');
  
  tempHighElements.forEach(el => {
    const match = el.textContent.match(/↑ ([\d.]+)°([CF])/);
    if (match) {
      let temp = parseFloat(match[1]);
      if (toCelsius && match[2] === 'F') {
        temp = ((temp - 32) * 5) / 9;
        el.textContent = `↑ ${temp.toFixed(1)}°C`;
      } else if (!toCelsius && match[2] === 'C') {
        temp = (temp * 9) / 5 + 32;
        el.textContent = `↑ ${temp.toFixed(1)}°F`;
      }
    }
  });
  
  tempLowElements.forEach(el => {
    const match = el.textContent.match(/↓ ([\d.]+)°([CF])/);
    if (match) {
      let temp = parseFloat(match[1]);
      if (toCelsius && match[2] === 'F') {
        temp = ((temp - 32) * 5) / 9;
        el.textContent = `↓ ${temp.toFixed(1)}°C`;
      } else if (!toCelsius && match[2] === 'C') {
        temp = (temp * 9) / 5 + 32;
        el.textContent = `↓ ${temp.toFixed(1)}°F`;
      }
    }
  });
}

// ========== SECTION SWITCHER ==========
function showSection(section, event) {
  console.log("Switching to section:", section);
  
  // If switching to forecast and we have a city, load forecast
  if (section === 'forecast' && currentCity) {
    getForecast(currentCity);
  }
  
  // Hide all sections
  const allSections = document.querySelectorAll(".section-content");
  allSections.forEach((el) => {
    el.classList.remove("active");
    el.style.display = "none";
  });
  
  // Show selected section
  const activeSection = document.querySelector(`.${section}`);
  if (activeSection) {
    activeSection.classList.add("active");
    activeSection.style.display = "block";
    console.log("Section shown:", section);
  } else {
    console.error("Section not found:", section);
  }

  // Highlight nav link
  const navLinks = document.querySelectorAll(".nav-item a");
  navLinks.forEach((a) => {
    a.style.color = "#fff";
    a.style.fontWeight = "normal";
  });
  
  if (event && event.target) {
    event.target.style.color = "#ffcc00";
    event.target.style.fontWeight = "bold";
  }
}

// ========== AUTO UPDATE TIME AND DATE ==========
function updateDateTime() {
  const now = new Date();
  
  // Update date
  if (dateEl) {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);
    dateEl.textContent = formattedDate;
  }
  
  // Update time
  if (timeEl) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    timeEl.textContent = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`;
  }
}

// Update time every second
setInterval(updateDateTime, 1000);

// Add CSS animation for forecast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Make functions globally available for onclick handlers
window.getWeather = getWeather;
window.toggleUnits = toggleUnits;
window.showSection = showSection;
