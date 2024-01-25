document.addEventListener('DOMContentLoaded', function () {
    const apiKey = '4feea38e2c8b6dffeab5bfe8c54ca459';
  
    const form = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
  
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const cityName = searchInput.value;
  
      if (cityName) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
          .then(response => response.json())
          .then(cityData => {
            const latitude = cityData.coord.lat;
            const longitude = cityData.coord.lon;
  
            const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
  
            return fetch(apiUrl);
          })
          .then(response => response.json())
          .then(weatherData => {
            console.log('API Response:', weatherData);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      } else {
        console.log('City name not provided.');
      }
    });
  });
  