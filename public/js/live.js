const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
});

const ctx = document.getElementById('live-chart-id').getContext('2d');

// Initialize an empty data array for the chart
const chartData = {
    labels: [],
    datasets: [
        {
            label: 'Humidity',
            borderColor: 'rgba(0, 128, 255, 1)', // Blue
            data: [],
            borderWidth: 2,
            fill: false,
        },
        {
            label: 'Temperature',
            borderColor: 'rgba(255, 0, 0, 1)', // Red
            data: [],
            borderWidth: 2,
            fill: false,
        },
    ],
};

// Check for stored chart data
const storedChartData = localStorage.getItem('chartData');
let liveChart;
liveChart = new Chart(ctx, {
    type: 'line',
    data: storedChartData ? JSON.parse(storedChartData) : chartData,
    options: {
        aspectRatio: 2.7,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    color: 'black',
                    font: {
                        family: 'Roboto',
                    },
                },
            },

            y: {
                ticks: {
                    color: 'black',
                    font: {
                        family: 'Roboto',
                    },
                },
            }

        },
    },
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const message = JSON.parse(data.message);

    //Update the live page fields
    document.getElementById('rh').textContent = message.Humidity;
    document.getElementById('temperature').textContent = message.Temperature;

    // Update the live chart
    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    liveChart.data.labels.push(time);
    liveChart.data.datasets[0].data.push(message.Humidity);
    liveChart.data.datasets[1].data.push(message.Temperature);

    // Keep a maximum number of data points to prevent the chart from growing indefinitely
    const maxDataPoints = 25;
    while (liveChart.data.labels.length > maxDataPoints) {
        liveChart.data.labels.shift();
        liveChart.data.datasets[0].data.shift();
        liveChart.data.datasets[1].data.shift();
    }

    // Save chart data to local storage
    localStorage.setItem('chartData', JSON.stringify(liveChart.data));

    // Update the chart
    liveChart.update();

});
