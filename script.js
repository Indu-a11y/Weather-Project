/* ========================================
   Weather App - JavaScript
   ======================================== */

// OpenWeatherMap API Key (Free tier)
// You can get your own API key at: https://openweathermap.org/api
const API_KEY = '4d8fb5b93d4af21d66a2948710284366'; // Demo key - replace with your own for production
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('errorMsg');
const errorText = document.getElementById('errorText');
const weatherCard = document.getElementById('weatherCard');

// Weather display elements
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const cityName = document.getElementById('cityName');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const feelsLike = document.getElementById('feelsLike');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const sunrise = document.getElementById('sunrise');
const currentTime = document.getElementById('currentTime');
const currentDate = document.getElementById('currentDate');

// Quick city buttons
const quickCityBtns = document.querySelectorAll('.quick-city');

// Weather icon mapping
const weatherIcons = {
    '01d': '☀️',  // clear sky day
    '01n': '🌙',  // clear sky night
    '02d': '⛅',  // few clouds day
    '02n': '☁️',  // few clouds night
    '03d': '☁️',  // scattered clouds
    '03n': '☁️',
    '04d': '☁️',  // broken clouds
    '04n': '☁️',
    '09d': '🌧️',  // shower rain
    '09n': '🌧️',
    '10d': '🌦️',  // rain day
    '10n': '🌧️',  // rain night
    '11d': '⛈️',  // thunderstorm
    '11n': '⛈️',
    '13d': '❄️',  // snow
    '13n': '❄️',
    '50d': '🌫️',  // mist
    '50n': '🌫️'
};

/* ========================================
   Event Listeners
   ======================================== */

// Search button click
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

// Enter key press
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    }
});

// Quick city buttons
quickCityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        cityInput.value = city;
        fetchWeather(city);
    });
});

/* ========================================
   Fetch Weather Data
   ======================================== */

async function fetchWeather(city) {
    // Show loader, hide others
    showLoader();
    
    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (response.status === 401) {
                throw new Error('API key error. Please try again later.');
            } else {
                throw new Error('Unable to fetch weather data. Please try again.');
            }
        }
        
        const data = await response.json();
        displayWeather(data);
        
    } catch (error) {
        showError(error.message);
    }
}

/* ========================================
   Display Weather Data
   ======================================== */

function displayWeather(data) {
    // Hide loader and error
    loader.classList.add('hidden');
    errorMsg.classList.add('hidden');
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.textContent = weatherIcons[iconCode] || '🌤️';
    
    // Update temperature
    temperature.textContent = `${Math.round(data.main.temp)}°`;
    
    // Update description
    description.textContent = data.weather[0].description;
    
    // Update city name
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    // Update weather details
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    pressure.textContent = `${data.main.pressure} hPa`;
    
    // Update sunrise time
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    sunrise.textContent = formatTime(sunriseTime);
    
    // Update date and time for the location
    updateDateTime(data.timezone);
    
    // Change background based on weather
    updateTheme(data.weather[0].main, iconCode);
    
    // Show weather card with animation
    weatherCard.classList.remove('hidden');
    
    // Add animation class
    weatherCard.style.animation = 'none';
    weatherCard.offsetHeight; // Trigger reflow
    weatherCard.style.animation = 'scaleIn 0.5s ease-out';
}

/* ========================================
   Helper Functions
   ======================================== */

function showLoader() {
    loader.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    weatherCard.classList.add('hidden');
}

function showError(message) {
    loader.classList.add('hidden');
    weatherCard.classList.add('hidden');
    errorText.textContent = message;
    errorMsg.classList.remove('hidden');
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function updateDateTime(timezoneOffset) {
    // Get current UTC time
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    
    // Apply timezone offset (in seconds from API)
    const localTime = new Date(utcTime + timezoneOffset * 1000);
    
    // Update time display
    currentTime.textContent = formatTime(localTime);
    
    // Update date display
    currentDate.textContent = localTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateTheme(weatherMain, iconCode) {
    // Remove all theme classes
    document.body.classList.remove('sunny', 'rainy', 'cloudy', 'night', 'snowy');
    
    // Check if it's night time
    const isNight = iconCode.endsWith('n');
    
    if (isNight) {
        document.body.classList.add('night');
        return;
    }
    
    // Apply theme based on weather condition
    switch (weatherMain.toLowerCase()) {
        case 'clear':
            document.body.classList.add('sunny');
            break;
        case 'rain':
        case 'drizzle':
        case 'thunderstorm':
            document.body.classList.add('rainy');
            break;
        case 'clouds':
            document.body.classList.add('cloudy');
            break;
        case 'snow':
            document.body.classList.add('snowy');
            break;
        default:
            // Keep default gradient
            break;
    }
}

/* ========================================
   Initialize App
   ======================================== */

// Load weather for a default city on page load
document.addEventListener('DOMContentLoaded', () => {
    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            () => {
                // If geolocation fails, load default city
                fetchWeather('Mumbai');
            }
        );
    } else {
        // Geolocation not supported, load default city
        fetchWeather('Mumbai');
    }
});

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    showLoader();
    
    try {
        const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Unable to fetch weather data');
        }
        
        const data = await response.json();
        displayWeather(data);
        
    } catch (error) {
        // Fallback to default city
        fetchWeather('Mumbai');
    }
}

/* ========================================
   Console Log for Interview Demo
   ======================================== */
console.log(`
╔═══════════════════════════════════════════════════════╗
║                   🌤️ Weather App                       ║
║                                                       ║
║  Created with: HTML, CSS, JavaScript                  ║
║  Features:                                            ║
║  • Real-time weather data from OpenWeatherMap API    ║
║  • Geolocation support                               ║
║  • Dynamic theme changes based on weather            ║
║  • Glassmorphism UI with smooth animations           ║
║  • Fully responsive design                           ║
║                                                       ║
║  Perfect for portfolio demonstration! 🚀             ║
╚═══════════════════════════════════════════════════════╝
`);
