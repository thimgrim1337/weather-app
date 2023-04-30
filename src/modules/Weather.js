const getWeather = async () => {
  try {
    const weather = await fetch(
      'http://api.weatherapi.com/v1/forecast.json?key=d85ae36fb9014f138aa125530231904&q=Plock&days=10&aqi=no&alerts=no'
    );

    const weatherData = await weather.json();
    return {
      location: weatherData.location,
      current: parseCurrentWeather(weatherData),
      daily: parseDailyWeather(weatherData),
      hourly: parseHourlyWeather(weatherData),
    };
  } catch (error) {
    console.log(error);
  }
};

const parseCurrentWeather = ({ current, forecast }) => {
  console.log(current);
  const {
    last_updated_epoch: localtime,
    temp_c: tempC,
    humidity,
    wind_kph: windKph,
  } = current;
  const { icon: weatherIcon, text: weatherText } = current.condition;
  const { daily_chance_of_rain: chanceOfRain } = forecast.forecastday[0].day;
  return {
    localtime,
    tempC,
    humidity,
    windKph,
    chanceOfRain,
    weatherIcon,
    weatherText,
  };
};

const parseDailyWeather = ({ forecast }) => {
  return forecast.forecastday.map((day) => {
    return {
      date: day.date,
      maxTempC: day.day.maxtemp_c,
      minTempC: day.day.mintemp_c,
      weatherIcon: day.day.condition.icon,
    };
  });
};

const parseHourlyWeather = ({ forecast }) => {
  console.log(forecast);
  return forecast.forecastday.map((day) => {
    return day.hour
      .map((hour) => {
        return {
          time: hour.time,
          tempC: hour.temp_c,
        };
      })
      .filter((hour, index) => index % 2 === 0);
  });
};

export default getWeather;
