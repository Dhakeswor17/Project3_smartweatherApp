#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "pico/mutex.h"
#include "pico/stdlib.h"
#include "hardware/adc.h"
#include "lwip/ip_addr.h"
#include "lwip/err.h"
#include "../pico-ssd1306/ssd1306.h"
#include "../pico-ssd1306/textRenderer/TextRenderer.h"
#include "../buzzer/buzzer.h"
#include "../mqtt/mqtt.h"
#include "../sensor/aht20.h"
#include "../wifi/wifi.h"

#define QUEUE_LENGTH 10
#define RAIN_THRESHOLD 1700
#define I2C_SDA_PIN 14
#define I2C_SCL_PIN 15

using namespace pico_ssd1306;

QueueHandle_t mqttDataQueue;
QueueHandle_t oledDataQueue;
auto_init_mutex(mutex);			// Create a mutex

struct WeatherData {
    float temperature = 0.0;
    float humidity = 0.0;
};

// Buzzer Task
void vBuzzerTask(void *pvParameters){
	/* ADC setup*/
	adc_init();					// Initialize ADC
	adc_select_input(0);		// Select ADC input (GPIO 26 == 0)

	/* Buzzer setup */
	gpio_init(BUZZER_PIN);
	gpio_set_dir(BUZZER_PIN, GPIO_OUT);
	gpio_set_function(BUZZER_PIN, GPIO_FUNC_PWM);
	buzzer_pwm_init();

	int counter = 0;
	uint16_t raw;
	
    while (1) {
		/* Read rain sensor data */
		raw = adc_read();
		if(raw < RAIN_THRESHOLD){
			// Ring the buzzer for ~10 seconds
			while(counter < 10000){
        		buzzer_pwm_set_duty_cycle(255);			// Set buzzer to high
        		vTaskDelay(1);

        		buzzer_pwm_set_duty_cycle(0);        	// Set buzzer to low
        		vTaskDelay(1);
				counter += 2;
			}
			counter = 0;
		}
		vTaskDelay(100);
    }
}

// MQTT Task
void vMqttTask(void *pvParameters){
	/* Connect to the WiFi*/
	if (connectWifi()) {
		mutex_enter_blocking(&mutex);
       	printf("WiFi connected\r\n");
		mutex_exit(&mutex);
	}


	/* MQTT setup */
	mqtt_client_t *mqtt_client = mqtt_client_new();
	ip_addr_t broker_ip;
    if (!ip4addr_aton(IP_ADDR, &broker_ip)) {
		mutex_enter_blocking(&mutex);
        printf("ip error\n");
		mutex_exit(&mutex);
    }
	const ip_addr_t ip_addr = broker_ip;		// MQTT broker ip
	const u16_t broker_port = BROKER_PORT;		// MQTT broker port
	const char *topic = "weather";				// MQTT topic

	/* Connect to the MQTT broker */
	int retry_count = 0;

	mutex_enter_blocking(&mutex);
	printf("Attempting MQTT connection\r\n");
	mutex_exit(&mutex);

    err_t connect_err = mqtt_client_connect(mqtt_client, &ip_addr, broker_port, NULL, NULL, &mqtt_client_info);
	if(connect_err != ERR_OK){
		do {
        	// Retry the connection
			mutex_enter_blocking(&mutex);
        	printf("Attempting MQTT connection (Retry %d)\r\n", retry_count + 1);
			mutex_exit(&mutex);
        	
			connect_err = mqtt_client_connect(mqtt_client, &ip_addr, broker_port, NULL, NULL, &mqtt_client_info);

	        if (connect_err != ERR_OK) {
    	        retry_count++;            
        	    vTaskDelay(2000);	// Delay between retries
        	} else {
				// Connection successful
				mutex_enter_blocking(&mutex);
        		printf("MQTT connection successful\r\n");
				mutex_exit(&mutex);
            	break;				
        	}

    	} while (retry_count < MAX_CONNECTION_RETRIES);
	}
    
    if (retry_count == MAX_CONNECTION_RETRIES) {
		mutex_enter_blocking(&mutex);
        printf("Maximum number of retries reached. Unable to establish MQTT connection.\r\n");
		mutex_exit(&mutex);
    }

	WeatherData myWeatherData;
	char payload[100];				// MQTT msg
	u16_t payload_length;			// Msg length
	err_t publish_err;
	int sampleNr = 0;

	while(1){
		if (xQueueReceive(mqttDataQueue, &myWeatherData, portMAX_DELAY) == pdPASS){
			sampleNr++;
			// Build the JSON message
    		sprintf(payload, "{\"nr\": %d, \"Temperature\": %.2f, \"Humidity\": %.2f}", sampleNr, myWeatherData.temperature, myWeatherData.humidity);

    		payload_length = strlen(payload);

			// Publish MQTT msg
    		publish_err = mqtt_publish(mqtt_client, topic, payload, payload_length, 0, 0, NULL, NULL);
    		if (publish_err == ERR_OK) {
				mutex_enter_blocking(&mutex);
				printf("Msg published: %s\r\n", payload);
				mutex_exit(&mutex);
    		}
		}
	}
}

// AHT20 Sensor Task
void vAHT20Task(void *pvParameters){
	/* AHT20 sensor setup */
    AHT20 myAHT20(AHT20_ADDRESS, i2c0, 16, 17, 250);
	sleep_ms(1000);

	myAHT20.AHT20_InitI2C(AHT20_SENSOR);	// Initialize AHT20
	sleep_ms(500);

	// Start the sensor comms
	if (myAHT20.AHT20_begin() != true){
		mutex_enter_blocking(&mutex);
		printf("AHT20 sensor comms err\r\n");
		mutex_exit(&mutex);
	}

	WeatherData myWeatherData;

	while(1){
		// Read temperature
		myWeatherData.temperature = myAHT20.AHT20_readTemperature(true);

		// Read humidity
		myWeatherData.humidity = myAHT20.AHT20_readHumidity(true);

		// Send weather data to queues
		xQueueSendToBack(mqttDataQueue, &myWeatherData, portMAX_DELAY);
		xQueueSendToBack(oledDataQueue, &myWeatherData, portMAX_DELAY);

		vTaskDelay(8000);	// Recommended polling frequency: 8sec - 30sec
	}
}

// OLED Display Task
void vOLEDTask(void *pvParameters){
	i2c_init(i2c1, 1000000); //Use i2c port with baud rate of 1Mhz

	/* I2C setup for OLED display */
	gpio_set_function(I2C_SDA_PIN, GPIO_FUNC_I2C);
	gpio_set_function(I2C_SCL_PIN, GPIO_FUNC_I2C);
	gpio_pull_up(I2C_SDA_PIN);
	gpio_pull_up(I2C_SCL_PIN);

	sleep_ms(250);

    // Create a new display object at address 0x3C and size of 128x64
    SSD1306 display = SSD1306(i2c1, 0x3C, Size::W128xH64);

	// Rotate the display by 180 degrees
    display.setOrientation(0);

	WeatherData myWeatherData;
	char tempBuffer[32];
	char humidityBuffer[32];

	while(1){
		if (xQueueReceive(oledDataQueue, &myWeatherData, portMAX_DELAY) == pdPASS){
			// Clear the OLED display before displaying updated values
			display.clear();

			sprintf(tempBuffer, "Temp: %.2f C", myWeatherData.temperature);
			drawText(&display, font_8x8, tempBuffer, 0, 0);
		
			sprintf(humidityBuffer, "Humidity: %.1f %%", myWeatherData.humidity);
			drawText(&display, font_8x8, humidityBuffer, 0, 32);

    		// Send buffer to display
    		display.sendBuffer();
		}
	}
}


int main(void) { 
	stdio_init_all();

	/* Create queues */
	mqttDataQueue = xQueueCreate(QUEUE_LENGTH, sizeof(WeatherData));
	oledDataQueue = xQueueCreate(QUEUE_LENGTH, sizeof(WeatherData));

	/* Create Tasks */

	xTaskCreate(vBuzzerTask, "Buzzer_Task", configMINIMAL_STACK_SIZE * 2, NULL, 
		(tskIDLE_PRIORITY + 1UL), (TaskHandle_t*) NULL);

	xTaskCreate(vMqttTask, "MQTT_Task", configMINIMAL_STACK_SIZE * 2, NULL, 
		(tskIDLE_PRIORITY + 1UL), (TaskHandle_t*) NULL);	

	xTaskCreate(vAHT20Task, "AHT20_Sensor_Task", configMINIMAL_STACK_SIZE * 2, NULL, 
		(tskIDLE_PRIORITY + 1UL), (TaskHandle_t*) NULL);
	
	xTaskCreate(vOLEDTask, "OLED_Display_Task", configMINIMAL_STACK_SIZE * 2, NULL, 
		(tskIDLE_PRIORITY + 1UL), (TaskHandle_t*) NULL);

	// Start the scheduler
    vTaskStartScheduler();

	// Should never reach here
	return 1;

}
