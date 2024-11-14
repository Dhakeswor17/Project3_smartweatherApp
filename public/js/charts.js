const socket = new WebSocket('ws://localhost:3000');

// Event listener for the Drop-down menu
let chartType = 'bar', previousChartType, selectedChart;
document.getElementById('chartType').addEventListener('change', () => {
    // Get the selected chart type
    chartType = document.getElementById('chartType').value;

    // Toggle the display based on the chart type
    toggleInputDisplay();

    // Empty chart type value (will get it again when update button is pressed)
    chartType = undefined;

});

// Event listener for the "Update Chart" button
document.getElementById('updateChart').addEventListener('click', () => {
    // Get the selected chart type
    selectedChart = document.getElementById('chartType').value;
    if (selectedChart === 'doughnut') {
        // Hide the page navigation
        document.getElementById('pagination').style.display = 'none';

        // Update the previous chart type
        previousChartType = selectedChart;

        // Get nr value
        const nr = document.getElementById('nr').value;

        // Check if the nr field is filled
        if (!nr) {
            alert('Please fill the \'nr\' field!');
            return;
        }

        // Validate the nr
        if (nr < 0) {
            alert('Please enter a number starting from 0');
            return;
        }

        const samplenr = {nr: nr};
        // Send the nr to the server
        socket.send(JSON.stringify(samplenr));
    } else {
        // Store the previous chart type value
        previousChartType = chartType;

        // Get the selected chart type
        chartType = document.getElementById('chartType').value;

        // Get the start and end date values
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Get the start and end time values
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;

        // Check if all the fields are filled
        if (!startDate || !endDate || !startTime || !endTime) {
            alert('Please fill all the fields!');
            return;
        }

        // Construct date objects
        const startDateObj = new Date(startDate + 'T' + startTime);
        const endDateObj = new Date(endDate + 'T' + endTime);

        // Validate user input
        if (startDateObj >= endDateObj) {
            alert('\'End date or time\' should be after \'Start date or time\'.');
            return;
        }

        const userInput = {
            startDate,
            endDate,
            startTime,
            endTime,
        };

        // Send the userInput to the server
        socket.send(JSON.stringify(userInput));
    }

});

function toggleInputDisplay() {
    const rangeSelector = document.getElementById('rangeSelector');
    const doughnutChartInput = document.getElementById('doughnutChartInput');

    if (chartType === 'doughnut') {
        // Hide the range selector
        rangeSelector.style.display = 'none';

        // Display the input field for Doughnut chart
        doughnutChartInput.style.display = 'block';
    } else {
        // Display the range selector
        rangeSelector.style.display = 'block';

        // Hide input field for Doughnut chart
        doughnutChartInput.style.display = 'none';
    }
}

let chartData, rawChartData, lineChartData, doughnutChartData, chart;
socket.addEventListener('message', (event) => {
    chartData = JSON.parse(event.data);

    // If it is an MQTT message, exit the function
    if ('topic' in chartData) {
        return;
    }

    /* Database Error Handling */

    // If no data is available for the requested range, alert the user and exit the event listener
    if ('rangeError' in chartData) {
        alert('No data available for the selected range!');
        return;
    }
    // Else if no MongoDB document found for the requested sample nr, alert the user and exit the event listener
    else if ('nrError' in chartData) {
        alert('No data available for the requested sample number!');
        return;
    }

    // Store the chartData obtained from the server for different use cases
    rawChartData = chartData;
    lineChartData = chartData;
    doughnutChartData = chartData;

    // If a chart does not exist, create a new chart. Otherwise, update the existing chart
    if (!chart) {
        createChart();
    } else {
        updateChart(chartData);
    }

});

let canvasElement;

function createChart() {
    // Get the canvas element and its context
    canvasElement = document.getElementById('chartId').getContext('2d');

    // Chart creation based on the selected type
    switch (chartType) {
        case 'bar':
            createBarChart();
            break;
        case 'line':
            createLineChart();
            break;
        default:
            createDoughnutChart();
            return;
    }
}

function newBarChart(data) {
    let delayed;
    chart = new Chart(canvasElement, {
        type: 'bar',
        data: {
            labels: data.map(item => item.nr),
            datasets: [
                {
                    label: 'Humidity (%)',
                    data: data.map(item => item.Humidity),
                    backgroundColor: 'rgba(0, 128, 255, 0.2)',//'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(0, 128, 255, 1)',//'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Temperature (°C)',
                    data: data.map(item => item.Temperature),
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',//'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(255, 0, 0, 1)',//'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            aspectRatio: 2.7,
            maintainAspectRatio: false,
            // Set a delay animation
            animation: {
                onComplete: () => {
                    delayed = true;
                },
                delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 150 + context.datasetIndex * 50;
                    }
                    return delay;
                },
            },
            scales: {
                x: {
                    stacked: true,   // Stack the bar graph
                    ticks: {
                        color: 'black',
                        font: {
                            family: 'Roboto',
                        },
                    },
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        color: 'black',
                        font: {
                            family: 'Roboto',
                        },
                    },
                }
            }
        }
    })
}

/* If the chartData array contains more than 25 items slice the data and render partial charts for fast loading times and better visualization of the data */
let currentPage = 1;        // Current page number
const itemsPerPage = 25;    // Number of items to display per page
function renderPartialChart() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Display the initially hidden page navigation buttons
    document.getElementById('pagination').style.display = 'block';

    // Divide the chartData array into a smaller array
    const slicedData = chartData.slice(startIndex, endIndex);

    if (chartType === 'bar') {
        newBarChart(slicedData);
    } else {
        newLineChart(slicedData);
    }
}

function updatePartialChart() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const slicedData = rawChartData.slice(startIndex, endIndex);

    updateChart(slicedData);
}

function createBarChart() {
    if (chartData.length > 25) {
        renderPartialChart();
    } else {
        newBarChart(rawChartData);
    }
}

function newLineChart(data) {
    chart = new Chart(canvasElement, {
        type: 'line',
        data: {
            labels: data.map(item => item.nr),
            datasets: [
                {
                    label: 'Humidity (%)',
                    data: data.map(item => item.Humidity),
                    borderColor: 'rgba(0, 128, 255, 1)',//'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Temperature (°C)',
                    data: data.map(item => item.Temperature),
                    borderColor: 'rgba(255, 0, 0, 1)',//'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
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

        }
    });

}

function createLineChart() {
    if (chartData.length > 25) {
        renderPartialChart();
    } else {
        newLineChart(lineChartData);
    }
}

function createDoughnutChart() {
    chart = new Chart(canvasElement, {
        type: 'doughnut',
        data: {
            labels: ['Humidity (%)', 'Temperature (°C)'],
            datasets: [
                {
                    data: [
                        doughnutChartData.Humidity,
                        doughnutChartData.Temperature,
                    ],
                    backgroundColor: [
                        'rgba(0, 128, 255, 1)',
                        'rgba(255, 0, 0, 1)',
                        //'rgba(75, 192, 192, 1)',
                        //'rgba(153, 102, 255, 1)',
                    ],
                },
            ],
        },
        options: {
            aspectRatio: 2.7,
            maintainAspectRatio: false,
            cutout: '50%',
            responsive: true,
        },
    });
}

function updateChart(data) {
    // Check if chart type has changed
    if (chartType !== previousChartType) {
        // Remove existing chart
        chart.destroy();

        // Reset page number before creating new chart
        currentPage = 1;
        // Update the correct Page number
        document.getElementById('currentPage').textContent = 'Page ' + currentPage;

        // Create new chart based on the selected type
        switch (chartType) {
            case 'bar':
                createBarChart();
                break;
            case 'line':
                createLineChart();
                break;
            default:
                createDoughnutChart();
                return;
        }
    }
    // If chart type has not changed, update the existing chart with new datasets
    else {
        if (selectedChart === 'doughnut') {
            // Update the chart data (for doughnut chart)
            chart.data.datasets[0].data = [
                doughnutChartData.Humidity,
                doughnutChartData.Temperature,
            ];
        } else {
            if (data.length > 25) {
                currentPage = 1;
                updatePartialChart();
            } else {
                if (rawChartData.length <= 25) {
                    // Hide the page navigation
                    document.getElementById('pagination').style.display = 'none';
                } else {
                    // Display the initially hidden page navigation buttons
                    document.getElementById('pagination').style.display = 'block';

                    // Update the correct Page number
                    document.getElementById('currentPage').textContent = 'Page ' + currentPage;
                }

                // Update the chart data (for bar chart or line chart)
                chart.data.labels = data.map(item => item.nr);
                chart.data.datasets[0].data = data.map(item => item.Humidity);
                chart.data.datasets[1].data = data.map(item => item.Temperature);
            }

        }

        // Update the chart
        chart.update();
    }
}

function goToPage(pageNumber) {
    currentPage = pageNumber;
    updatePartialChart();
}

// Event listeners for pagination buttons
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        // Store the previous chart type value
        previousChartType = chartType;
        goToPage(currentPage - 1);
        document.getElementById('currentPage').textContent = 'Page ' + currentPage;
    }
});
document.getElementById('nextPage').addEventListener('click', () => {
    // Get total number of pages for the whole chart to be displayed
    const totalPages = Math.ceil(rawChartData.length / itemsPerPage);

    if (currentPage < totalPages) {
        // Store the previous chart type value
        previousChartType = chartType;
        goToPage(currentPage + 1);
        document.getElementById('currentPage').textContent = 'Page ' + currentPage;

    }
});