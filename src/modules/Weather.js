const getWeather = async (isF) => {
  try {
    const weather = await fetch(
      'https://api.weatherapi.com/v1/forecast.json?key=d85ae36fb9014f138aa125530231904&q=Plock&days=10&aqi=no&alerts=no'
    );

    const weatherData = await weather.json();

    return {
      location: weatherData.location,
      current: parseCurrentWeather(weatherData, isF),
      daily: parseDailyWeather(weatherData, isF),
      hourly: parseHourlyWeather(weatherData, isF),
    };
  } catch (error) {
    console.log(error);
  }
};

export const getCity = async (cityInput) => {
  try {
    if (cityInput !== '') {
      const city = await fetch(
        `http://api.weatherapi.com/v1/search.json?key=d85ae36fb9014f138aa125530231904&q=${cityInput}`
      );
      const cityData = await city.json();

      return {
        cities: parseCity(cityData),
      };
    }
  } catch (error) {
    console.log(error);
  }
};

const parseCity = (cityData) => {
  return cityData.map((city) => {
    return {
      name: city.name,
      country: city.country,
    };
  });
};

const parseCurrentWeather = ({ current, forecast }, isF) => {
  const temp = isF ? current.temp_f : current.temp_c;
  const wind = isF ? `${current.wind_mph} mp/h` : `${current.wind_kph} km/h`;
  const { last_updated_epoch: localtime, humidity } = current;
  const { icon: weatherIcon, text: weatherText } = current.condition;
  const { daily_chance_of_rain: chanceOfRain } = forecast.forecastday[0].day;
  return {
    localtime,
    temp,
    humidity,
    wind,
    chanceOfRain,
    weatherIcon,
    weatherText,
  };
};

const parseDailyWeather = ({ forecast }, isF) => {
  return forecast.forecastday.map((day) => {
    const maxTemp = isF ? day.day.maxtemp_f : day.day.maxtemp_c;
    const minTemp = isF ? day.day.mintemp_f : day.day.mintemp_c;
    return {
      date: day.date,
      maxTemp,
      minTemp,
      weatherIcon: day.day.condition.icon,
    };
  });
};

const parseHourlyWeather = ({ forecast }, isF) => {
  return forecast.forecastday.map((day) => {
    return day.hour.map((hour) => {
      const temp = isF ? hour.temp_f : hour.temp_c;
      const wind = isF ? hour.wind_mph : hour.wind_kph;
      return {
        time: hour.time,
        temp,
        wind,
        chanceOfRain: hour.chance_of_rain,
      };
    });
  });
};

export default getWeather;
