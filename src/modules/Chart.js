import Chart from 'chart.js/auto';
import { parseISO } from 'date-fns';
import format from 'date-fns/format';

export async function drawChart() {
  return new Chart(document.getElementById('myChart'), {
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: '',
          data: [],
        },
      ],
    },
  });
}

export function updateChart(chart, data) {
  removeData(chart);

  chart.data.datasets[0].label = data.label;
  data.time.forEach((hour) =>
    chart.data.labels.push(format(parseISO(hour), 'HH:mm'))
  );
  data.values.forEach((value) =>
    chart.data.datasets.forEach((dataset) => dataset.data.push(value))
  );

  chart.update();
}

function removeData(chart) {
  chart.data.labels = [];
  chart.data.datasets.forEach((dataset) => {
    dataset.data = [];
  });
  chart.update();
}

Chart.defaults.color = '#fff';
Chart.defaults.backgroundColor = '#fff';
