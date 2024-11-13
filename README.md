# Smart Weather Station
The Weather Station is a comprehensive project designed to provide real-time monitoring of rainfall, and display of temperature, and humidity levels. The system employs various sensors and communication protocols to ensure accurate data collection and seamless information dissemination.

## Menu

* [Methods and Materials](#methods-and-materials)
  - [Hardware Components](#hardware-components)
  - [Software Tools](#software-tools)
* [Implementation](#implementation)
* [Other Features](#other-features)
* [Results](#results)
  - [Key Achievements](#key-achievements)
  - [Potential Areas for Further Improvement](#potential-areas-for-further-improvement)
* [Weather Station High Level Block Diagram](#weather-station-high-level-block-diagram)

## Methods and Materials

### Hardware Components

**1. Raspberry Pi Pico W:**
The Raspberry Pi Pico W serves as the central processing unit and controller for the entire system. Its compact form factor and GPIO capabilities make it ideal for interfacing with various sensors and actuators.

**2. AHT20 Sensor:**
The AHT20 sensor is employed for precise and reliable measurement of temperature and humidity. This sensor is integrated to provide accurate environmental data for real-time monitoring.

**3. Raindrops Detection Module:**
The raindrops detection module is utilized to detect rainfall. The module has an analog (proportional) and digital output with an adjustable switching threshold (comparator output). The module allows to measure the occurrence and strength of precipitation. It also has an LM393 comparator and an adjustable threshold for the digital output.

**4. PS12 Buzzer:**
A PS12 buzzer is integrated into the system to provide audible alerts when rainfall is detected. The buzzer enhances user awareness by offering a distinct and recognizable signal for immediate attention.

**5. SSD1306 OLED Display:**
The OLED display is used for presenting real-time temperature and humidity data in a visually accessible manner. Its compact size and low power consumption make it an ideal choice for this application.

### Software Tools:

**FreeRTOS:**
FreeRTOS is employed as the real-time operating system for managing tasks, scheduling, and ensuring timely execution of critical functions. Its efficiency in handling concurrent processes enhances the overall reliability and responsiveness of the system.

**MQTT:**
MQTT is chosen as the communication protocol for transmitting temperature and humidity data. Its lightweight nature and publish-subscribe architecture facilitate efficient and reliable data exchange between the Raspberry Pi Pico W and the server.

## Implementation
The system employs a Raspberry Pi Pico W as the main processing unit, interfacing with various components, including the AHT20 sensor for temperature and humidity measurement, a raindrops detection module, a buzzer for audible alerts, and an OLED display for visual representation. The code utilizes the FreeRTOS framework to manage concurrent tasks efficiently, ensuring responsive and real-time data processing.

## Other Features
1. Real-Time Data Display: The system provides a live page displaying real-time weather data, accessible through the home route.

2. Interactive Charts: Users can explore historical weather data through interactive charts. The system supports bar/line charts for a specified date range and doughnut charts for specific sample numbers.

4. MongoDB Integration: Weather data received via MQTT is stored in a MongoDB database for future reference and historical analysis.

## Results
The Smart Rainfall Monitoring and Environmental Display System has successfully achieved its primary goal, demonstrating effectiveness in monitoring rainfall, capturing temperature and humidity data, and providing real-time alerts. The system's performance aligns with the project objectives, and the outcomes are promising.

### Key Achievements

**1. Rainfall Monitoring:**
The rain detection module, coupled with the buzzer alert system, effectively notifies users when rainfall is detected, contributing to improved situational awareness.

**2. Temperature and Humidity Sensing:**
The AHT20 sensor consistently and accurately measures ambient temperature and humidity, providing reliable environmental data for monitoring and analysis.

**3. MQTT Communication:**
The MQTT communication mechanism successfully transmits weather data to designated endpoints, enabling remote monitoring and data analysis.

**4. OLED Display Integration:**
The OLED display presents temperature and humidity information in real-time, offering a user-friendly interface for immediate visual feedback.

**5. FreeRTOS Integration:**
The successful integration and utilization of FreeRTOS have been instrumental in achieving seamless task management. FreeRTOS ensures efficient scheduling, synchronization, and execution of tasks, contributing to the overall responsiveness and reliability of the Weather Station.

### Potential Areas for Further Improvement

**1. Sensor Expansion:**
Integration of additional sensors, such as pressure and wind speed sensors, could enhance the system's capability to provide a more comprehensive set of environmental data.

**2. Power Efficiency:**
Investigating power-efficient strategies, especially for scenarios where the system operates on battery power, could contribute to prolonged system uptime.

## Weather Station High Level Block Diagram 

