import format from 'date-fns/format';
import { pl } from 'date-fns/locale';
import { parseISO } from 'date-fns';
import getWeather from './Weather';

const city = 'Plock';
let isMeasureF = false;

const getDay = (date, pattern) => format(date, pattern, { locale: pl });
const getTemp = (tempC) => (isMeasureF === true ? tempC * 2 : tempC);

const renderCurrentWeather = ({ current, location }) => {
  const weatherIconImg = document.querySelector('.weather-icon--big');
  const currentTemp = document.querySelector('.current-weather-details__temp');
  const currentChanceRain = document.querySelector(
    '.current-weather-details__rain'
  );
  const currentHumidity = document.querySelector(
    '.current-weather-details__humidity'
  );
  const currentWindSpeed = document.querySelector(
    '.current-weather-details__wind'
  );
  const currentCity = document.querySelector('.current-day-info__city');
  const currentDate = document.querySelector('.current-day-info__datetime');
  const currentCondition = document.querySelector(
    '.current-day-info__condition'
  );

  weatherIconImg.src = current.weatherIcon;
  currentTemp.innerText = Math.round(getTemp(current.tempC));
  currentChanceRain.innerText = `${current.chanceOfRain}%`;
  currentHumidity.innerText = `${current.humidity}%`;
  currentWindSpeed.innerText = `${Math.trunc(current.windKph)} km/h`;
  currentCity.innerText = location.name;
  currentDate.innerText = getDay(Date.now(), 'eeee');
  currentCondition.innerText = current.weatherText;
};

const createDay = (dayData) => {
  const day = document.createElement('div');
  const dayName = document.createElement('h2');
  const img = document.createElement('img');
  const temps = document.createElement('div');
  const maxTemp = document.createElement('p');
  const minTemp = document.createElement('p');

  day.className = 'forecast__day';
  dayName.className = 'forecast__title';
  dayName.innerText = getDay(parseISO(dayData.date), 'eeeeee');
  img.className = 'forecast__weather-icon weather-icon weather-icon--small';
  img.src = dayData.weatherIcon;
  temps.className = 'forecast__temps';
  maxTemp.classList = 'forecast__temp temp';
  maxTemp.innerText = Math.round(dayData.maxTempC);
  minTemp.classList = 'forecast__temp temp temp--min';
  minTemp.innerText = Math.round(dayData.minTempC);

  temps.append(maxTemp, minTemp);
  day.append(dayName, img, temps);

  return day;
};

const renderDailyWeather = ({ daily }) => {
  const forecast = document.querySelector('.weather-app__forecast');

  daily.forEach((day) => {
    forecast.appendChild(createDay(day));
  });
};

// const measureF = document.querySelector('.measure-f');
// measureF.addEventListener('click', () => {
//   isMeasureF = true;
// });

const renderWeather = (async () => {
  const weather = await getWeather();
  console.log(weather);
  renderCurrentWeather(weather);
  renderDailyWeather(weather);
})();
