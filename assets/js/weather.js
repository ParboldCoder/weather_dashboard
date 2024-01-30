$(document).ready(function () {
  localStorageLoad();
 
  //I implemented a feature to request access to the users geolocation when the page is loaded.
  //This will remain until the user clears their cache.
  if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          getWeatherByCoordinates(latitude, longitude);
      });
  } else {
      console.log("Geolocation is not available");
  }
});

const appid = '4feea38e2c8b6dffeab5bfe8c54ca459';
const current = $('#today');
const future = $('#forecast');
const sidebar = $('#history');
const $searchInput = $("#search-input");
const $searchButton = $("#search-button");
const $clearButton = $("#clear-button");
let cityName;
let previousCities;

$searchButton.attr("disabled", true);

$searchInput.on("input", function (e) {
  const value = e.target.value.trim();
  $searchButton.prop("disabled", value.length === 0);
});

//Here I implemented the search button to clear the text box and disable the button after the search was completed.
$searchButton.on("click", function (e) {
  e.preventDefault();
  current.empty();
  future.empty();
  cityName = $searchInput.val().trim();
  $searchInput.val("");
  $searchButton.prop("disabled", true);
  getCoordinates(cityName);
});

$clearButton.on("click", function (e) {
  e.preventDefault();
  sidebar.empty();
  localStorage.clear();
});

function getCoordinates(cityName) {
  const geoQuery = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${appid}`;
  fetch(geoQuery)
      .then(response => response.json())
      .then(data => {
          const latitude = data[0].lat;
          const longitude = data[0].lon;
          getWeather(cityName, latitude, longitude);
      });
}

function getWeatherByCoordinates(latitude, longitude) {
  const query = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${appid}`;
  fetch(query)
      .then(response => response.json())
      .then(data => {
          const cityName = data.name;
          const temp = data.main.temp;
          const weatherDescription = data.weather[0].description;
          const currentForecast = $(`<h2>${cityName} (${dayjs().format('D/M/YYYY')})</h2><p>Temp: ${toCelsius(temp)} &deg;C</p><p>Weather: ${weatherDescription}</p>`);
          current.append(currentForecast);
      });
}

function getWeather(cityName, latitude, longitude) {
  const query = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${appid}`;
  fetch(query)
      .then(response => response.json())
      .then(data => {
        console.log(data);
          const temp = data.list[0].main.temp;
          const currentForecast = $(`<h2>${cityName} (${dayjs().format('D/M/YYYY')})</h2><p>Temp: ${toCelsius(temp)} &deg;C</p><p>Wind: ${data.list[0].wind.speed} KPH</p><p>Humidity: ${data.list[0].main.humidity} %</p> <img src = 'https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png'> </img>`);
          current.append(currentForecast);
          let futureForecast = $(`<h3>5-Day Forecast:</h3>`);
          future.append(futureForecast);
          for (let i = 3; i < data.list.length; i += 8) {
              futureForecast = $(`<div class="col-2"><h4>${data.list[i].dt_txt[8]}${data.list[i].dt_txt[9]}${dayjs().format('/M/YYYY')}</h4><p>Temp: ${toCelsius(data.list[i].main.temp)} &deg;C</p><p>Wind: ${data.list[i].wind.speed} KPH</p><p>Humidity: ${data.list[i].main.humidity} %</p> <img src = 'https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png'> </img> </div>`);
              future.append(futureForecast);
          }
          if (sidebar.find(`button:contains(${cityName})`).length === 0) {
              previousCities = $(`<button type="submit">${cityName}</button>`);
              sidebar.append(previousCities);
              localStorageUpdate();
          }
      });
}

function resetPageToDefault() {
  current.empty();
  future.empty();
  if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          getWeatherByCoordinates(latitude, longitude);
      });
  } else {
      const defaultCity = "London";
      getCoordinates(defaultCity);
  }
}

$clearButton.on("click", function(e) {
  e.preventDefault();
  sidebar.empty();
  localStorage.clear();
  resetPageToDefault();
});

function localStorageUpdate() {
  const sidebarCities = [];
  sidebar.find('button').each(function () {
      sidebarCities.push($(this).text());
  });
  localStorage.setItem('sidebarCities', JSON.stringify(sidebarCities));
}

function localStorageLoad() {
  const storedCities = localStorage.getItem('sidebarCities');
  if (storedCities) {
      const cityArray = JSON.parse(storedCities);
      for (const city of cityArray) {
          const storedCity = $(`<button type="submit">${city}</button>`);
          sidebar.append(storedCity);
      }
  }
}

sidebar.on('click', 'button', function (e) {
  e.preventDefault();
  current.empty();
  future.empty();
  cityName = $(this).text();
  getCoordinates(cityName);
});

function toCelsius(temp) {
  return (temp - 273.15).toFixed(2);
}