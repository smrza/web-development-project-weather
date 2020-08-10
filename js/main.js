//my openweathermap.org api key + default address for location/city search functions
const api = {
    key: "d1481023fe42627ece741c8c6db55455",
    default: "https://api.openweathermap.org/data/2.5/"
}

const iconElement = document.querySelector(".weather-icon");
const temperatureElement = document.querySelector(".temperature-value p");
const descriptionElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const dateElement = document.querySelector(".date p");
const notificationElement = document.querySelector(".notification");
const latitudeElement = document.querySelector(".latitude p");
const longtitudeElement = document.querySelector(".longtitude p");
const sunriseElement = document.querySelector(".sunrise p");
const sunsetElement = document.querySelector(".sunset p");
const humidityElement = document.querySelector(".humidity p");
const pressureElement = document.querySelector(".pressure p");
const windSpeedElement = document.querySelector(".wind-speed p");
const windDirectionElement = document.querySelector(".wind-direction p");
const searchBoxElement = document.querySelector(".search-box");
const buttonSubmitElement = document.querySelector(".submitButton");
const buttonFavouriteElement = document.querySelector(".favouriteButton");
var historyBoxElement = document.querySelector(".history-textarea");
const buttonsContainer = document.getElementById("favourites");
var favouritesArr = [];
var searchHistoryArr = [];
var dateToday;
var counter = 0; //counter for favourites

//add events to buttons + search box
buttonSubmitElement.addEventListener('click', setQueryByButton);
searchBoxElement.addEventListener('keypress', setQueryByEnter);
buttonFavouriteElement.addEventListener('click', saveToFavourites);

//save weather here
const weather = {};
weather.temperature = { unit: "C" }

//check location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setPosition, userDenied);
} else {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = "<p>Browser does not support geolocation</p>";
    setTimeout(hideNotificationPanel, 2000);
}

//hide notification panel function for setTimeout
function hideNotificationPanel() {
    notificationElement.style.display = "none";
}

//when user denies location, use Zlín
function userDenied() {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = "<p>Location access denied, using Zlín as default location</p>";
    getWeatherByCitySearch("Zlin");
    setTimeout(hideNotificationPanel, 2000);
}

//set user position and call for weather
function setPosition(position) {
    getWeatherByLocation(position.coords.latitude, position.coords.longitude);
}

//search for city by enter
function setQueryByEnter(keypress) {
    if (keypress.keyCode == 13) {
        getWeatherByCitySearch(searchBoxElement.value);
    }
}

//search for city by button
function setQueryByButton() {
    getWeatherByCitySearch(searchBoxElement.value);
}

//calls API to get JSON weather by set location
function getWeatherByLocation(latitude, longitude) {
    fetch(`${api.default}weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${api.key}`)
        .then(function (response) {
            var data = response.json();
            return data;
        })
        .then(getWeather)
}

//calls API to get JSON weather by city search
function getWeatherByCitySearch(query) {
    fetch(`${api.default}weather?q=${query}&units=metric&appid=${api.key}`)
        .then(function (response) {
            var data = response.json();
            return data;
        })
        .then(getWeather)
}

//load JSON data to weather
function getWeather(data) {
    weather.temperature.value = Math.round(data.main.temp);
    weather.description = data.weather[0].description;
    weather.iconId = data.weather[0].icon;
    weather.city = data.name;
    weather.country = data.sys.country;
    weather.latitude = data.coord.lat;
    weather.longitude = data.coord.lon;
    weather.sunrise = data.sys.sunrise;
    weather.sunset = data.sys.sunset;
    weather.humidity = data.main.humidity;
    weather.pressure = data.main.pressure;
    weather.windSpeed = data.wind.speed;
    weather.windDirection = data.wind.deg;
    dateToday = getDate(new Date());
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    //save to local storage history
    insertIntoHistorySearch(weather.city, weather.temperature.value, weather.description, dateToday, time);
    //finally call function to display weather
    displayWeather();
}

//https://openweathermap.org/weather-data

//display weather to page elements
function displayWeather() {
    iconElement.innerHTML = `<img src="icons/${weather.iconId}.png"/>`;
    temperatureElement.innerHTML = `${weather.temperature.value}°C`;
    descriptionElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
    dateElement.innerHTML = dateToday;
    latitudeElement.innerHTML = `Latitude: ${weather.latitude}`;
    longtitudeElement.innerHTML = `Longtitude: ${weather.longitude}`;
    sunriseElement.innerHTML = `Sunrise: ${convertUnixTime(weather.sunrise)} CEST`;
    sunsetElement.innerHTML = `Sunset: ${convertUnixTime(weather.sunset)} CEST`;
    humidityElement.innerHTML = `Humidity: ${weather.humidity} %`;
    pressureElement.innerHTML = `Pressure: ${weather.pressure} hPa`;
    windSpeedElement.innerHTML = `Wind speed: ${weather.windSpeed} m/s`;
    windDirectionElement.innerHTML = `Wind direction: ${weather.windDirection}°`;
}

//convert UNIX time to show sunrise/sunset
function convertUnixTime(unixTime) {
    var unixTimeConverter = new Date(unixTime * 1000);
    var hours = unixTimeConverter.getHours();
    var minutes = "0" + unixTimeConverter.getMinutes();
    var seconds = "0" + unixTimeConverter.getSeconds();
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

//convert °C to °F
function convertCelsiusToFahrenheit(temperature) {
    return (temperature * 9 / 5) + 32;
}

//when user presses temperature button - convert between °C and °F
temperatureElement.addEventListener("click", function () {
    if (weather.temperature.unit == "C") {
        var fahrenheit = Math.floor(convertCelsiusToFahrenheit(weather.temperature.value));
        temperatureElement.innerHTML = `${fahrenheit}°F`;
        weather.temperature.unit = "F";
    } else {
        temperatureElement.innerHTML = `${weather.temperature.value}°C`;
        weather.temperature.unit = "C"
    }
});

//return current date + day
function getDate(date) {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

//load history - favourites + search history
function loadHistory() {
    if (localStorage.getItem("searchHistory123456789") != null) {
        var retrievedData = localStorage.getItem("searchHistory123456789");
        searchHistoryArr = JSON.parse(retrievedData);
        searchHistoryArr.forEach(i => {
            historyBoxElement.append(i);
        })
    }

    if (localStorage.getItem("favouritesHistory123456789") != null) {
        var retrievedData = localStorage.getItem("favouritesHistory123456789");
        favouritesArr = JSON.parse(retrievedData);
        favouritesArr.forEach(i => {
            counter++;
            var button = document.createElement("button");
            button.innerText = i;
            button.addEventListener("click", function () {
                searchBoxElement.value = i;
                getWeatherByCitySearch(i);
            })
            favourites.appendChild(button);
        })
    }
}

//save search history item to local storage
function insertIntoHistorySearch(city, temperature, description, date, time) {
    var addItem = time + " | " + date + " --- " + city + " | " + temperature + " | " + description + "\n";
    searchHistoryArr.push(addItem);
    localStorage.setItem("searchHistory123456789", JSON.stringify(searchHistoryArr));
    historyBoxElement.append(addItem);
}

//save favourite city item to local storage
function saveToFavourites() {
    var addItem = searchBoxElement.value;
    //determine if the city is already in favourites or not
    var isFavourite = new Boolean(false);
    for (var i = 0; i < favouritesArr.length; i++) {
        if (favouritesArr[i] == addItem) {
            isFavourite = true;
        }
    }
    if (isFavourite == true) {
        notificationElement.style.display = "block";
        notificationElement.innerHTML = "<p>You already have this city favourite.</p>";
        setTimeout(hideNotificationPanel, 2000);
    }
    //add city to favourites
    else {
        favouritesArr.push(addItem);
        localStorage.removeItem("favouritesHistory123456789");
        localStorage.setItem("favouritesHistory123456789", JSON.stringify(favouritesArr));

        var button = document.createElement("button");
        button.innerText = favouritesArr[counter];

        button.addEventListener("click", function () {
            searchBoxElement.value = addItem;
            getWeatherByCitySearch(addItem);
        })
        favourites.appendChild(button);
        counter++;
        notificationElement.style.display = "block";
        notificationElement.innerHTML = "<p>City added to favourites.</p>";
        setTimeout(hideNotificationPanel, 2000);
    }
}