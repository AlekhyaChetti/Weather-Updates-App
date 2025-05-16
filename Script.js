const cityInput = document.querySelector(".city-input");

const searchButton = document.querySelector(".search-btn");

const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const WeatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "a3c189aedd542fa7465a28c5cc3bc9ee";

const createWeatherCard = (cityName, weatherItem, index) => {
  const date = weatherItem.dt_txt.split(" ")[0];
  const tempCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
  const windSpeed = weatherItem.wind.speed;
  const humidity = weatherItem.main.humidity;
  const description = weatherItem.weather[0].description;
  const icon = weatherItem.weather[0].icon;

  if (index === 0) {
    currentWeatherDiv.innerHTML = `
      <div class="details">
        <h2>${cityName} (${date})</h2>
        <h4>Temperature: ${tempCelsius}°C</h4>
        <h4>Wind: ${windSpeed} M/S</h4>
        <h4>Humidity: ${humidity}%</h4>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="Weather icon">
        <h4>${description}</h4>
      </div>
    `;
    return "";
  } else {
    return `
      <li class="cards">
        <h3>(${date})</h3>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon">
        <h4>Temp: ${tempCelsius}°C</h4>
        <h4>Wind: ${windSpeed} M/S</h4>
        <h4>Humidity: ${humidity}%</h4>
      </li>
    `;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then(res => res.json())
    .then(data => {
      const uniqueForecastDays = [];

      const fiveDaysForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          uniqueForecastDays.push(forecastDate);
          return true;
        }
        return false;
      });

      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      WeatherCardsDiv.innerHTML = "";

      fiveDaysForecast.forEach((weatherItem, index) => {
        const cardHTML = createWeatherCard(cityName, weatherItem, index);
        if (cardHTML) {
          WeatherCardsDiv.insertAdjacentHTML("beforeend", cardHTML);
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather data!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;

  const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return alert("City not found!");
      const { lat, lon } = data[0];
      getWeatherDetails(cityName, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates.");
    });
};

const getUserCoordinate = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      fetch(REVERSE_GEOCODING_URL)
        .then(res => res.json())
        .then(data => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name.");
        });
    },
    error => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permissions to grant access again.");
      }
    }
  );
};

// Event listeners
locationButton.addEventListener("click", getUserCoordinate);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => {
  if (e.key === "Enter") getCityCoordinates();
});