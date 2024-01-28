$(document).ready(function () {
  localStorageLoad();
});

const appid = '4feea38e2c8b6dffeab5bfe8c54ca459';
const current = $('#today');
const future = $('#forecast');
const sidebar = $('#history');
var $searchInput = $("#search-input");
var $searchButton = $("#search-button");
var $clearButton = $("#clear-button");
let cityName;
let previousCities;

$searchButton.attr("disabled", true);

$searchInput.on("input", function(e) {
  var value = e.target.value.trim();

  if (value.length > 0) {
      $searchButton.prop("disabled", false);
  } else {
      $searchButton.prop("disabled", true);
  }
});

$searchButton.on("click", function(e) {
  e.preventDefault();
  current.empty();
  future.empty();
  var cityName = $searchInput.val().trim();
  getCoordinates(cityName);
});

$clearButton.on("click", function(e) {
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
          getWeather(latitude, longitude);
      });
}

function getWeather(latitude, longitude) {
  const query = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${appid}`;
  fetch(query)
      .then(response => response.json())
      .then(data => {
          const temp = data.list[0].main.temp;
          const currentForecast = $(`<h2>${cityName} (${dayjs().format('D/M/YYYY')})</h2><p>Temp: ${toCelsius(temp)} &deg;C</p><p>Wind: ${data.list[0].wind.speed} KPH</p><p>Humidity: ${data.list[0].main.humidity} %</p>`);
          current.append(currentForecast);
          let futureForecast = $(`<h3>5-Day Forecast:</h3>`);
          future.append(futureForecast);
          for (let i = 3; i < data.list.length; i += 8) {
              futureForecast = $(`<div class="col-2"><h4>${data.list[i].dt_txt[8]}${data.list[i].dt_txt[9]}${dayjs().format('/M/YYYY')}</h4><p>Temp: ${toCelsius(data.list[i].main.temp)} &deg;C</p><p>Wind: ${data.list[i].wind.speed} KPH</p><p>Humidity: ${data.list[i].main.humidity} %</p></div>`);
              future.append(futureForecast);
          }
          if (sidebar.find(`button:contains(${cityName})`).length === 0) {
              previousCities = $(`<button type="submit">${cityName}</button>`);
              sidebar.append(previousCities);
              localStorageUpdate();
          }
      });
}

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
      for (let i = 0; i < cityArray.length; i++) {
          const storedCity = $(`<button type="submit">${cityArray[i]}</button>`);
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
  const celsius = temp - 273.15;
  return celsius.toFixed(2);
}
