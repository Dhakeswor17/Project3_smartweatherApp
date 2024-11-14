# Set minimum required version of CMake
cmake_minimum_required(VERSION 3.12)

# Initialize the SDK based on PICO_SDK_PATH
# note: this must happen before project()
include(pico_sdk_import.cmake)

# Set the board as Pico W
set(PICO_BOARD pico_w)

# Set any variables required for importing libraries
SET(FREERTOS_KERNEL_PATH ${CMAKE_CURRENT_SOURCE_DIR}/lib/FreeRTOS-Kernel)
include(${FREERTOS_KERNEL_PATH}/portable/ThirdParty/GCC/RP2040/FreeRTOS_Kernel_import.cmake)

# Set project name
set(PROJECT_NAME Smart_Weather_Station)
project(${PROJECT_NAME} C CXX ASM)

# Set C/C++ Standards
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

# Initialize the Raspberry Pi Pico SDK
pico_sdk_init()

# Enable several warnings
add_compile_options(-Wall
        -Wno-format          
        -Wno-unused-function
        -Wno-maybe-uninitialized
)

# Create a variable for the c source files in the project
file(GLOB SOURCES "src/*.cpp"
 "sensor/*.cpp"
  "wifi/*.cpp"
  "buzzer/*.cpp"
)

# Tell CMake where to find executable source files
add_executable(${PROJECT_NAME} ${SOURCES})

# include the header file directories
target_include_directories(${PROJECT_NAME} PRIVATE inc)
target_include_directories(${PROJECT_NAME} PRIVATE wifi)
target_include_directories(${PROJECT_NAME} PRIVATE sensor)
target_include_directories(${PROJECT_NAME} PRIVATE mqtt)
target_include_directories(${PROJECT_NAME} PRIVATE buzzer)
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_LIST_DIR})

# Link to required libs from SDK
target_link_libraries(${PROJECT_NAME}
 pico_stdlib
 hardware_i2c 
 pico_ssd1306 
 pico_multicore 
 pico_cyw43_arch_lwip_threadsafe_background
 hardware_adc
 hardware_gpio
 pico_lwip_mqtt
 hardware_pwm
 FreeRTOS-Kernel-Heap4
)

# Add library for OLED display (ssd1306)
add_subdirectory(pico-ssd1306)

# create map/bin/hex/uf2 file in addition to ELF.
pico_add_extra_outputs(${PROJECT_NAME})

# Enable usb output, disable uart output
pico_enable_stdio_usb(${PROJECT_NAME} 1)
pico_enable_stdio_uart(${PROJECT_NAME} 0)

# This adds a post build command that tries to copy uf2 to Pico
add_custom_command(
    TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_BINARY_DIR}/${PROJECT_NAME}.uf2 e:/
)