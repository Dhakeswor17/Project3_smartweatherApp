#ifndef _AHT20_h
#define _AHT20_h

#include <stdint.h>
#include <stdbool.h>
#include "pico/stdlib.h"
#include "hardware/i2c.h"

#define AHT20_ADDRESS             0x38  // I2C address no.1 for AHT20, address pin connect to GND
#define AHT20_MY_I2C_DELAY        50000 // Timeout for I2C comms, uS,

#define AHT20_INIT_CMD             0xBE  // init command for AHT20
#define AHT20_START_MEASURMENT_CMD 0xAC  // start measurement command
#define AHT20_NORMAL_CMD           0xA8  // normal cycle mode command, no info in datasheet!!!
#define AHT20_SOFT_RESET_CMD       0xBA  // soft reset command

#define AHT20_INIT_NORMAL_MODE     0x00  // enable normal mode
#define AHT20_INIT_CYCLE_MODE      0x20  // enable cycle mode
#define AHT20_INIT_CMD_MODE        0x40  // enable command mode
#define AHT20_INIT_CAL_ENABLE      0x08  // load factory calibration coeff

#define AHT20_DATA_MEASURMENT_CMD  0x33
#define AHT20_DATA_NOP             0x00

#define AHT20_MEASURMENT_DELAY     80    // > 75 milliseconds
#define AHT20_POWER_ON_DELAY       40    // 20-40 milliseconds
#define AHT20_CMD_DELAY            350   // > 300 milliseconds
#define AHT20_SOFT_RESET_DELAY     20    // < 20 milliseconds

#define AHT20_FORCE_READ_DATA      true  // force to read data
#define AHT20_USE_READ_DATA        false // force to use data from previous read
#define AHT20_ERROR                0xFF  // returns 255, if communication error is occurred


typedef enum ASAIR_I2C_SENSOR_e{
	AHT10_SENSOR = 0x00,
    AHT15_SENSOR = 0x01,
    AHT20_SENSOR = 0x02
}ASAIR_I2C_SENSOR_e;

class AHT20{
private:
    i2c_inst_t *i2c;
    uint8_t  _address;
    uint8_t _SDataPin;
    uint8_t _SClkPin;
    uint16_t _CLKSpeed = 250; //I2C bus speed in khz typically 100-400
    ASAIR_I2C_SENSOR_e _sensorName;
    uint8_t  _rawDataBuffer[6] = {AHT20_ERROR, 0, 0, 0, 0, 0};
    int16_t  returnValue = 0;
    bool isConnected = false;

public:
    // Constructor
    AHT20(uint8_t address, i2c_inst_t* i2c_type, uint8_t sdata , uint8_t sclk ,uint16_t clockspeed);

    void     AHT20_InitI2C(ASAIR_I2C_SENSOR_e sensorName);
    void     AHT20_DeInit();
    bool     AHT20_begin();
    uint8_t  AHT20_readRawData();
    float    AHT20_readTemperature(bool);
    float    AHT20_readHumidity(bool);
    bool     AHT20_softReset();
    bool     AHT20_setNormalMode();
    bool     AHT20_setCycleMode();

    uint8_t  AHT20_readStatusByte();
    uint8_t  AHT20_getCalibrationBit(bool);
    bool     AHT20_enableFactoryCalCoeff();
    uint8_t  AHT20_getBusyBit(bool);

    void AHT20_SetIsConnected(bool);
    bool AHT20_GetIsConnected(void);
};
#endif
