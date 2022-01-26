var apiKey = "972f8583e55791decea7d59a7b8ad8bf";
var enterCityEL=document.querySelector("#enterCity");
var cityInputEl=document.querySelector("#city");
var todaysWeatherEl=document.querySelector("#todaysWeather");
var searchedCityEl = document.querySelector("#searchedCity");
var forecastTitle = document.querySelector("#forecast");
var futureForecastEl = document.querySelector("#futureForecast");
var searchHistoryButtonEl = document.querySelector("#prevHistory-buttons");
var clear = document.querySelector("#clear");
var cities = [];

//Retrieves city input information
var cityLookup = function(event){
    event.preventDefault();

    var city = cityInputEl.value.trim();
    if(city){
        getCityWeather(city);
        get5DayForecast(city);
        cities.unshift({city});
        cityInputEl.value = "";
    } else{
        alert("Please enter a city!");
        return null;
    }
    saveSearch();
    pastSearch(city);
};
enterCityEL.addEventListener("submit", cityLookup);

//Retrieve city weather information using API
var getCityWeather = function(city){
    var apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`

    fetch(apiURL)
    .then(function(response){
        response.json().then(function(data){
            displayCityWeather(data, city);
        });
    });
};

//Renders information to page
var displayCityWeather = function(weather, searchedCity){
   todaysWeatherEl.textContent= "";  
   searchedCityEl.textContent=searchedCity;

   var currentDate = document.createElement("span")
   currentDate.textContent=" (" + moment(weather.dt.value).format("MMM Do, YYYY") + ") ";
   searchedCityEl.appendChild(currentDate);

   var weatherIcon = document.createElement("img")
   weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`);
   searchedCityEl.appendChild(weatherIcon);

   var temperatureEl = document.createElement("span");
   temperatureEl.textContent = "Temperature: " + weather.main.temp + " °F";
   temperatureEl.classList = "list-group-item";
   todaysWeatherEl.appendChild(temperatureEl);

   var humidityEl = document.createElement("span");
   humidityEl.textContent = "Humidity: " + weather.main.humidity + " %";
   humidityEl.classList = "list-group-item";
   todaysWeatherEl.appendChild(humidityEl);

   var windSpeedEl = document.createElement("span");
   windSpeedEl.textContent = "Wind Speed: " + weather.wind.speed + " MPH";
   windSpeedEl.classList = "list-group-item"

   todaysWeatherEl.appendChild(windSpeedEl);

   var lat = weather.coord.lat;
   var lon = weather.coord.lon;
   getUvIndex(lat,lon)
};
//Retrieves UV Index for requested city
var getUvIndex = function(lat,lon){
    
    var apiURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`
    fetch(apiURL)
    .then(function(response){
        response.json().then(function(data){
            displayUvIndex(data)
        });
    });
};

//Displays color coded UV index to reflect, favorable, moderate, or severe weather conditions
var displayUvIndex = function(index){
    var uvIndexEl = document.createElement("div");
    uvIndexEl.textContent = "UV Index: "
    uvIndexEl.classList = "list-group-item"

    uvIndexValue = document.createElement("span")
    uvIndexValue.textContent = index.value

    if(index.value <=2){
        uvIndexValue.classList = "favorable"
    }else if(index.value >2 && index.value<=8){
        uvIndexValue.classList = "moderate "
    }
    else if(index.value >8){
        uvIndexValue.classList = "severe"
    };

    uvIndexEl.appendChild(uvIndexValue);
    todaysWeatherEl.appendChild(uvIndexEl);
};

//Retrieves a five day weather forecast for the requested city
var get5DayForecast = function(city){
  
    var apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`

    fetch(apiURL)
    .then(function(response){
        response.json().then(function(data){
            display5DayForecast(data);
        });
    });
};
//Renders information for five day weather forcast
var display5DayForecast = function(weather){
    futureForecastEl.textContent = ""
    forecastTitle.textContent = "5-Day Forecast:";

    var forecast = weather.list;
        for(let i=5; i < forecast.length; i=i+8){
       var dailyForecast = forecast[i];
        
       var forecastEl=document.createElement("div");
       forecastEl.classList = "card bg-secondary text-light m-2";

       var forecastDate = document.createElement("h5")
       forecastDate.textContent= moment.unix(dailyForecast.dt).format("MMM D, YYYY");
       forecastDate.classList = "card-header text-center"
       forecastEl.appendChild(forecastDate);

       var weatherIcon = document.createElement("img")
       weatherIcon.classList = "card-body text-center";
       weatherIcon.setAttribute("src", `https://openweathermap.org/img/wn/${dailyForecast.weather[0].icon}@2x.png`);  
       forecastEl.appendChild(weatherIcon);

       var forecastTempEl=document.createElement("span");
       forecastTempEl.classList = "card-body text-center";
       forecastTempEl.textContent = "Temp: " + dailyForecast.main.temp  + " °F";
        forecastEl.appendChild(forecastTempEl);

        var forecastWindSpeedEl=document.createElement("span");
        forecastWindSpeedEl.classList = "card-body text-center";
        forecastWindSpeedEl.textContent = "Wind: " + dailyForecast.wind.speed + " MPH"; 
        forecastEl.appendChild(forecastWindSpeedEl);
 
       var forecastHumEl=document.createElement("span");
       forecastHumEl.classList = "card-body text-center";
       forecastHumEl.textContent = "Humidity: " + dailyForecast.main.humidity + "%";
       forecastEl.appendChild(forecastHumEl);

       futureForecastEl.appendChild(forecastEl);
    };
};

//Local storage for seach history
var saveSearch = function(){
    localStorage.setItem("cities", JSON.stringify(cities));
};
//List of all previous saved searches you can click on
var pastSearch = function(pastSearch){
    prevSearchEl = document.createElement("button");
    prevSearchEl.textContent = pastSearch;
    prevSearchEl.classList = "d-flex w-100 btn-light border p-2";
    prevSearchEl.setAttribute("data-city",pastSearch)
    prevSearchEl.setAttribute("type", "submit");

    searchHistoryButtonEl.prepend(prevSearchEl);
};
var searchHistory = function(event){
    var city = event.target.getAttribute("data-city")
    if(city){
        getCityWeather(city);
        get5DayForecast(city);
    };
};
searchHistoryButtonEl.addEventListener("click", searchHistory);

//Allows you to clear your search history
clear.addEventListener("click", function() {
    localStorage.clear();
    location.reload();
});

