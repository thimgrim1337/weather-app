import format from 'date-fns/format';
import { isToday, parseISO } from 'date-fns';
import getWeather, { getCity } from './Weather';
import { drawChart, updateChart } from './Chart';
import { debounced } from './Utils';

let activeCity = 'Plock';
let isF = false;
let activeChartOption = 'temp';
let activeDay = 0;
let chart;

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
  currentDate.innerText = format(Date.now(), 'PPPP');
  currentCondition.innerText = current.weatherText;
};

const getActiveDay = (days) => {
  return [...days].findIndex((day) =>
    day.classList.contains('forecast__day--active')
  );
};

const setActiveDay = (e) => {
  const days = document.querySelectorAll('.forecast__day');
  days.forEach((day) => day.classList.remove('forecast__day--active'));
  e.target.closest('div').classList.add('forecast__day--active');
  activeDay = getActiveDay(days);
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
    if (!e.target.closest('div').classList.contains('forecast__day--active')) {
      setActiveDay(e);
      renderWeather(isF, chart, activeChartOption, activeDay);
    }
    return;
  });

  return day;
};

const updateDay = (dayData) => {
  const days = document.querySelectorAll('.forecast__day');
  dayData.forEach((dayData, index) => {
    days[index].querySelector('.forecast__title').innerText = format(
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

const checkInputValue = (input) => {
  if (input.length >= 3) return true;
};

const clearResult = () => {
  document.querySelector('.search__result').innerHTML = '';
  document.querySelector('.search__input').value = '';
};

const createResultItem = ({ name, country }) => {
  const li = document.createElement('li');
  li.classList.add('search__item');
  li.innerText = `${name}, ${country}`;

  li.addEventListener('click', async () => {
    activeCity = name;
    await renderWeather(isF, chart, activeChartOption, activeDay);
    clearResult();
  });

  return li;
};

const renderAutocompleteResults = async (input) => {
  if (checkInputValue(input.target.value)) {
    const resultList = document.querySelector('.search__result');
    const citiesResult = await getCity(input.target.value);

    resultList.innerHTML = '';
    if (citiesResult !== undefined)
      citiesResult.cities.forEach((city) =>
        resultList.appendChild(createResultItem(city))
      );
  }
};

const renderWeather = async (isF, chart, hourlyData, activeDay) => {
  const weather = await getWeather(isF, activeCity);

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

const mHandler = (e) => {
  if (e.target.hasAttribute('data-f') && !isF) {
    measureC.classList.remove('measure--active');
    measureF.classList.add('measure--active');
    isF = true;
    renderWeather(isF, chart, activeChartOption, activeDay);
  }

  if (e.target.hasAttribute('data-c') && isF) {
    measureC.classList.add('measure--active');
    measureF.classList.remove('measure--active');
    isF = false;
    renderWeather(isF, chart, activeChartOption, activeDay);
  }
};

measureF.addEventListener('click', mHandler);
measureC.addEventListener('click', mHandler);

const tHandler = debounced(200, renderAutocompleteResults);
cityInput.addEventListener('input', tHandler);

const init = async () => {
  chart = await drawChart();
  cityInput.value = '';
  await renderWeather(isF, chart, activeChartOption, activeDay);
};

init();
