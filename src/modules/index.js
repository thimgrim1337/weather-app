import format from 'date-fns/format';
import { is, pl } from 'date-fns/locale';
import { isToday, parseISO, set } from 'date-fns';
import getWeather, { autocomplete, getCity } from './Weather';
import { drawChart, updateChart } from './Chart';

const city = 'Plock';
let isF = false;
let activeChartOption = 'temp';
let activeDay = 0;
let chart;

const getDay = (date, pattern) => format(date, pattern, { locale: pl });

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
  currentTemp.innerText = Math.round(current.temp);
  currentChanceRain.innerText = `${current.chanceOfRain}%`;
  currentHumidity.innerText = `${current.humidity}%`;
  currentWindSpeed.innerText = current.wind;
  currentCity.innerText = location.name;
  currentDate.innerText = getDay(Date.now(), 'eeee');
  currentCondition.innerText = current.weatherText;
};

const renderDailyWeather = ({ daily }) => {
  const forecast = document.querySelector('.weather-app__forecast');
  if (!forecast.hasChildNodes()) {
    daily.forEach((day) => {
      forecast.appendChild(createDay(day));
    });
  }
  updateDay(daily);
};

const renderHourlyWeather = ({ hourly }, chart, hourlyData, activeDay) => {
  label = 'Temperature by hour';
  if (hourlyData === 'chanceOfRain') label = 'Chance of rain by hour';
  if (hourlyData === 'wind') label = 'Wind speed by hour';

  const time = hourly[activeDay].map((hour) => hour.time);
  const values = hourly[activeDay].map((hour) => hour[hourlyData]);

  updateChart(chart, { label, time, values });
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
  img.className = 'forecast__weather-icon weather-icon weather-icon--small';
  img.src = dayData.weatherIcon;
  temps.className = 'forecast__temps';
  maxTemp.classList = 'forecast__temp temp';
  minTemp.classList = 'forecast__temp temp temp--min';

  if (isToday(parseISO(dayData.date)))
    day.classList.add('forecast__day--active');

  temps.append(maxTemp, minTemp);
  day.append(dayName, img, temps);

  day.addEventListener('click', (e) => {
    setActiveDay(e);
    renderWeather(isF, chart, activeChartOption, activeDay);
  });

  return day;
};

const updateDay = (dayData) => {
  const days = document.querySelectorAll('.forecast__day');
  dayData.forEach((dayData, index) => {
    days[index].querySelector('.forecast__title').innerText = getDay(
      parseISO(dayData.date),
      'eeeeee'
    );
    days[index].querySelector('.forecast__temps .temp').innerText = Math.round(
      dayData.maxTemp
    );
    days[index].querySelector('.forecast__temps  .temp--min').innerText =
      Math.round(dayData.minTemp);
  });
};

const renderWeather = async (isF, chart, hourlyData, activeDay) => {
  const weather = await getWeather(isF);

  renderCurrentWeather(weather);
  renderDailyWeather(weather);
  renderHourlyWeather(weather, chart, hourlyData, activeDay);
};

const setActiveChartOption = (option) => {
  document
    .querySelectorAll('.chart__button')
    .forEach((btn) => btn.classList.remove('button--active'));
  document
    .querySelector(`[data-option="${option}"]`)
    .classList.add('button--active');
  activeChartOption = option;
};

const setActiveDay = (e) => {
  const days = getRenderedDays();
  days.forEach((day) => day.classList.remove('forecast__day--active'));
  e.target.closest('div').classList.add('forecast__day--active');
  activeDay = getActiveDay(days);
};

const getRenderedDays = () => {
  const days = document.querySelectorAll('.forecast__day');
  return days;
};

const getActiveDay = (days) => {
  return [...days].findIndex((day) =>
    day.classList.contains('forecast__day--active')
  );
};

const measureF = document.querySelector('[data-f]');
const measureC = document.querySelector('[data-c]');
const chartButtons = document.querySelectorAll('[data-option');
const cityInput = document.querySelector('.search__input');

chartButtons.forEach((button) =>
  button.addEventListener('click', (e) => {
    setActiveChartOption(e.target.dataset.option);
    renderWeather(isF, chart, activeChartOption, activeDay);
  })
);

measureF.addEventListener('click', () => {
  measureC.classList.remove('measure--active');
  measureF.classList.add('measure--active');
  isF = true;
  renderWeather(isF, chart, activeChartOption, activeDay);
});

measureC.addEventListener('click', () => {
  measureC.classList.add('measure--active');
  measureF.classList.remove('measure--active');
  isF = false;
  renderWeather(isF, chart, activeChartOption, activeDay);
});

cityInput.addEventListener('keydown', (e) => {
  renderAutocompleteResults(getCity(e.target.value));
});

const renderAutocompleteResults = async (cityResaults) => {
  const resaultList = document.querySelector('.search__resault');
  const citiesResult = await cityResaults;

  resaultList.innerHTML = '';
  if (citiesResult !== undefined && citiesResult.cities.length !== 0) {
    citiesResult.cities.forEach((city) => {
      const li = document.createElement('li');
      li.innerText = `${city.name}, ${city.country}`;
      resaultList.appendChild(li);
    });
  }
};

const init = async () => {
  chart = await drawChart();
  await renderWeather(isF, chart, activeChartOption, activeDay);
};

init();
