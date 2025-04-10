
const form = document.getElementById('activity-form');
const chartCtx = document.getElementById('summaryChart').getContext('2d');
const filterDateInput = document.getElementById('filter-date');

const activityColors = {
  working: 'green',
  study: 'yellow',
  houseworking: 'white',
  chilling: 'blue',
  harding: 'red'
};

let allActivities = JSON.parse(localStorage.getItem('activities')) || [];

let chart = new Chart(chartCtx, {
  type: 'pie',
  data: {
    labels: Object.keys(activityColors),
    datasets: [{
      label: 'Time Spent',
      data: Array(5).fill(0),
      backgroundColor: Object.values(activityColors)
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function updateChart(dateStr) {
  const data = {
    working: 0,
    study: 0,
    houseworking: 0,
    chilling: 0,
    harding: 0
  };

  allActivities
    .filter(act => act.date === dateStr)
    .forEach(act => {
      data[act.type] += act.duration;
    });

  chart.data.datasets[0].data = Object.keys(data).map(k => data[k]);
  chart.update();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;

  const startTime = toMinutes(start);
  const endTime = toMinutes(end);
  const duration = endTime - startTime;

  if (duration > 0) {
    const activity = { date, type, start, end, duration };
    allActivities.push(activity);
    localStorage.setItem('activities', JSON.stringify(allActivities));
    if (filterDateInput.value === date) updateChart(date);
  }

  form.reset();
});

filterDateInput.addEventListener('change', () => {
  const selectedDate = filterDateInput.value;
  updateChart(selectedDate);
});

function downloadCSV() {
  if (allActivities.length === 0) return alert("No data to export.");

  const header = ['Date', 'Activity', 'Start', 'End', 'Duration(min)'];
  const rows = allActivities.map(a => [a.date, a.type, a.start, a.end, a.duration]);
  const csv = [header, ...rows].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'time_tracking.csv';
  a.click();

  URL.revokeObjectURL(url);
}
