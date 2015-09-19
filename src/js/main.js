var Weather = {

    localInfo: {
        country: '',
        city: '',
        latitude: '',
        longitude: ''
    },

    $mainCardbox: $("#main-card"),
    $cardsBox: $("#week-cards"),
    generalWeatherArray: {
        "Thunderstorm": "wi-thunderstorm",
        "Drizzle": "wi-sprinkle",
        "Rain": "wi-rain",
        "Snow": "wi-snow",
        "Atmosphere": "wi-smoke",
        "Clouds": "wi-cloudy",
        "Clear": "wi-day-sunny",
        "Extreme": "wi-storm-warning",
        "Aditional": "wi-fog"
    },
    commonWeatherArray: {
        "light rain": "wi-rain-mix",
        "moderate rain": "wi-hail",
        "shower rain": "wi-showers",
        "heavy snow": "wi-snow-wind",
        "tornado": "wi-tornado",
        "dust": "wi-dust",
        "clear sky": "wi-day-sunny",
        "few clouds": "wi-day-cloudy",
        "overcast clouds": "wi-cloud",
        "hurricane": "wi-hurricane",
        "cold": "wi-snowflake-cold",
        "hot": "wi-hot"
    },
    backgroundArray: {
        "Thunderstorm": "http://s6.postimg.org/61i7uhirl/thunderstorm_compressor.jpg",
        "Drizzle": "http://s6.postimg.org/nmbjs3znl/drizzle_compressor.jpg",
        "Rain": "http://s6.postimg.org/g8w5t5flt/rain_compressor.jpg",
        "Snow": "http://s6.postimg.org/5akwayr0h/snow_compressor.jpg",
        "Atmosphere": "http://s21.postimg.org/qex4h32x3/cielo_nublado.jpg",
        "Clouds": "http://s6.postimg.org/nl1lyoxtt/clouds_compressor.jpg",
        "Clear": "http://s6.postimg.org/d8oynh001/clear_compressor.jpg",
        "Extreme": "http://s6.postimg.org/ktic82zb5/extreme_compressor.jpg",
        "Aditional": "http://s6.postimg.org/d8fbcm4ap/aditional_compressor.jpg"
    },
    currentUnit: 'Celsius',

    helper: {
        fahrenheitToCelsius: function(value) {
            return ((value - 32) * (5 / 9)).toFixed(2);
        },

        celsiusToFahrenheit: function(value) {
            return (value * (9 / 5) + 32).toFixed(2);
        },

        toggleUnit: function(value) {
            if (Weather.currentUnit == "Celsius")
                return Weather.helper.celsiusToFahrenheit(value);
            else
                return Weather.helper.fahrenheitToCelsius(value);
        },

        // stackoverflow.com/questions/13459866/javascript-change-date-into-format-of-dd-mm-yyyy
        currentFormatedDate: function() {

            var d = new Date(Date.now()),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [month, day, year].join('/');
        },

        currentDay: function(value) {

            var d = new Date(Date.now()),
                days = ["Sunday", "Monday", "Tuesday", "Wednesday",
                    "Thursday", "Friday", "Saturday"
                ];

            if (value || value === 0)
                return days[value];
            else
                return days[d.getDay()];
        },

        shortValue: function(value) {
            value = '' + value;
            return value.substr(0, 4);
        },

        getWeatherIconClass: function(common, general) {
            if (Weather.commonWeatherArray[common])
                return Weather.commonWeatherArray[common];
            else if (Weather.generalWeatherArray[general])
                return Weather.generalWeatherArray[general];
            else
                return "wi-day-sunny";
        },

        clearValueImput: function(value) {
            return value.replace(/\°/g, "");
        }
    },

    getInfo: function(response) {

        if (!this.localInfo.longitude) {
            this.localInfo.latitude = response.latitude;
            this.localInfo.longitude = response.longitude;
            this.localInfo.country = response.country_name;
        }
    },

    setBackground: function(value) {
        if (!Weather.backgroundArray[value])
            value = "Clear";

        $("html").css({
            background: 'url(' + Weather.backgroundArray[value] + ') no-repeat fixed center center / cover'
        });
    },

    loadContent: function() {
        Weather.toggleLoading();

        var infoUrl = "https://freegeoip.net/json/";

        $.when(Weather.getJson(infoUrl)).
        then(function(response) {

            Weather.getInfo(response);

            var currentWeatherUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
                Weather.localInfo.latitude + '&lon=' + Weather.localInfo.longitude +
                '&units=metric';

            return Weather.getJson(currentWeatherUrl);
        }).
        then(function(response) {

            Weather.setBackground(response.weather[0].main);
            Weather.insertMainCard(response);

            Weather.toggleLoading();
            Weather.$mainCardbox.fadeIn();

            var weekWeatherUrl = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat=' +
                Weather.localInfo.latitude + '&lon=' + Weather.localInfo.longitude +
                '&units=metric&cnt=5&mode=json';

            return Weather.getJson(weekWeatherUrl);
        }).
        then(function(response) {

            Weather.insertCards(response);

            Weather.$cardsBox.fadeIn();

            $("#footer").fadeIn();
        });
    },

    insertMainCard: function(response) {
        var header = response.name + ', ' + response.sys.country;
        Weather.$mainCardbox.find("#location").html(header);

        var date = Weather.helper.currentFormatedDate(),
            day = Weather.helper.currentDay();

        Weather.$mainCardbox.find(".header-text h4").html(date + ' <strong>' + day + '</strong>');

        Weather.$mainCardbox.find(".value-main").html(response.main.temp);

        Weather.$mainCardbox.find("#max").html(response.main.temp_max + "&deg;");
        Weather.$mainCardbox.find("#min").html(response.main.temp_min + "&deg;");

        Weather.$mainCardbox.find("#weather-info i").addClass(Weather.helper.getWeatherIconClass(response.weather[0].description, response.weather[0].main));
        var weatherText = response.weather[0].description.replace(/\b\w/g, function(match) {
            return match.toUpperCase();
        });
        Weather.$mainCardbox.find(".weather-text").html(weatherText);

        Weather.$mainCardbox.find("#humidity").html(response.main.humidity + '%');
        Weather.$mainCardbox.find("#pressure").html(Weather.helper.shortValue(response.main.pressure) + ' hPa');
        Weather.$mainCardbox.find("#wind").html(response.wind.speed + ' m/s');
    },

    insertCards: function(response) {
        var day = new Date().getDay(),
            card = "",
            $container = Weather.$cardsBox.find(".col-xs-12");
        $container.html("");

        response.list.forEach(function(item, i) {

        	if (day >= 6)
                day = 0;
            else
                day += 1;

            card = '<div class="card"> ' +
                '<div class="center-data-row">' +
                '<div class="header-text">' + Weather.helper.currentDay(day) + '</div>' +
                '</div>' +
                '<div class="weather-image">' +
                '<div class="icon"><i class="wi ' + Weather.helper.getWeatherIconClass(item.weather[0].description, item.weather[0].main) + '"></i></div>' +
                '</div>' +
                '<div class="data-row">' +
                '<div class="icon"><i class="wi wi-thermometer"></i></div>' +
                '<div class="value-d">' + item.temp.day + '&deg;</div>' +
                '</div>' +
                '<div class="data-row">' +
                '<div class="icon"><i class="wi wi-humidity"></i></div>' +
                '<div class="value">' + item.humidity + '%</div>' +
                '</div>' +
                '<div class="data-row">' +
                '<div class="icon"><i class="wi wi-barometer"></i></div>' +
                '<div class="value">' + Weather.helper.shortValue(item.pressure) + ' hPa</div>' +
                '</div>' +
                '<div class="data-row">' +
                '<div class="icon"><i class="wi wi-dust"></i></div>' +
                '<div class="value">' + item.speed + ' m/s</div>' +
                '</div>' +
                '</div>';

            $container.append(card);            
        });
    },

    toggleLoading: function() {
        var $loading = $(".loading");

        if ($loading.hasClass("none"))
            $loading.removeClass("none");
        else
            $loading.addClass("none");
    },

    getJson: function(url) {
        return $.ajax({
            url: url,
            dataType: "jsonp",
        });
    },

    setLatLong: function(latitude, longitude) {
        Weather.localInfo.latitude = latitude;
        Weather.localInfo.longitude = longitude;
    },

    toggleAllUnits: function() {
        var $values = $(".value-d");

        $values.fadeOut();

        $.each($values, function(i, item) {

            item.innerHTML = Weather.helper.
            toggleUnit(Weather.helper.clearValueImput(item.innerHTML));

            if (i !== 0)
                item.innerHTML += '°';
        });

        if (Weather.currentUnit == "Celsius") {
            $(".degree i").removeClass("wi-celsius").addClass("wi-fahrenheit");
            Weather.currentUnit = "Fahrenheit";
        } else {
            $(".degree i").removeClass("wi-fahrenheit").addClass("wi-celsius");
            Weather.currentUnit = "Celsius";
        }

        Weather.$mainCardbox.find("a .property").html(Weather.currentUnit);

        $values.fadeIn();
    }
};

$(document).ready(function() {
    Weather.loadContent();

    $("#degree a").on("click", function(event) {
        event.preventDefault();

        Weather.toggleAllUnits();
    });

    var geo = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                Weather.setLatLong(position.coords.latitude, position.coords.longitude);
                Weather.loadContent();
            });

        } else {
            $("#footer").innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    $("#fix-location").on("click", function(event) {
        event.preventDefault();

        geo();
    });
});
