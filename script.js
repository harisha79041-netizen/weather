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
const visibilityEl = document.getElementById("visibility");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const iconEl = document.querySelector(".icon");
const weatherDefault = document.querySelector(".weather-default");
const weatherData = document.querySelector(".weather-data");

// Default temperature unit (Celsius)
let isCelsius = true;
let currentWeatherData = null;

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
  
  // Start time update
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

  try {
    // Show loading state
    if (searchBtn) {
      searchBtn.disabled = true;
      searchBtn.textContent = "🔄 Loading...";
    }

    // Call Flask backend API
    const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);
    const result = await response.json();

    if (!result.success) {
      alert(result.message || "City not found! Please try again.");
      if (searchBtn) {
        searchBtn.disabled = false;
        searchBtn.textContent = "🔍 Search";
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
    if (visibilityEl) visibilityEl.textContent = `${data.visibility} km`;
    if (sunriseEl) sunriseEl.textContent = data.sunrise;
    if (sunsetEl) sunsetEl.textContent = data.sunset;
    if (dateEl) dateEl.textContent = data.date;
    if (timeEl) timeEl.textContent = data.time;

    // Weather icon
    if (iconEl) {
      iconEl.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
      iconEl.alt = data.description;
    }

    // Save to search history
    await saveToHistory(data.city);

    // Update background image
    updateBackground(city);

    // Reset button
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.textContent = "🔍 Search";
    }
    
    // Reset to Celsius
    isCelsius = true;
    
    console.log("Weather data loaded successfully:", data);
    
  } catch (error) {
    console.error("Weather fetch error:", error);
    alert("Unable to fetch weather data right now. Please try again.");
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.textContent = "🔍 Search";
    }
  }
}

// ========== UPDATE BACKGROUND ==========
async function updateBackground(city) {
  try {
    const response = await fetch(`/api/background/${encodeURIComponent(city)}`);
    const result = await response.json();
    
    if (result.success && result.image_url) {
      document.body.style.backgroundImage = `url(${result.image_url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      
      if (result.photographer) {
        console.log(`Photo by ${result.photographer} on Unsplash`);
      }
    }
  } catch (error) {
    console.error("Background fetch error:", error);
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
  } else {
    // Convert to Celsius
    tempValue = ((tempValue - 32) * 5) / 9;
    feelsLikeValue = ((feelsLikeValue - 32) * 5) / 9;
    tempEl.textContent = `${tempValue.toFixed(1)}°C`;
    feelsLikeEl.textContent = `${feelsLikeValue.toFixed(1)}°C`;
    isCelsius = true;
  }
}

// ========== SECTION SWITCHER ==========
function showSection(section, event) {
  console.log("Switching to section:", section);
  
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

// ========== AUTO UPDATE TIME ==========
function updateDateTime() {
  const now = new Date();
  
  if (timeEl && weatherData && weatherData.classList.contains("show")) {
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

// Make functions globally available for onclick handlers
window.getWeather = getWeather;
window.toggleUnits = toggleUnits;
window.showSection = showSection;