/*
 * Author: Yevgeniy Kiveisha <yevgeniy.kiveisha@intel.com>
 * Copyright (c) 2014 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
#pragma once

#include <string>
#include <mraa/i2c.h>

#define ADDR                    0x68 // device address

// timekeeping registers
#define TIME_CAL_ADDR           0x00
#define ALARM1_ADDR             0x07
#define ALARM2_ADDR             0x0B
#define CONTROL_ADDR            0x0E
#define STATUS_ADDR             0x0F
#define AGING_OFFSET_ADDR       0x10
#define TEMPERATURE_ADDR        0x11

// control register bits
#define A1IE                    0x1
#define A2IE                    0x2
#define INTCN                   0x4

// status register bits
#define A1F                     0x1
#define A2F                     0x2
#define OSF                     0x80

#define HIGH                    1
#define LOW                     0

namespace upm {

struct Time3231 {
    uint8_t second;
    uint8_t minute;
    uint8_t hour;
    uint8_t day;
    uint8_t month;
    int16_t year;
    uint8_t weekDay;
};

/**
 * @brief maxds3231m proximity sensor library
 * @defgroup maxds3231m libupm-maxds3231m
 */

/**
 * @brief C++ API for MAXDS3231M chip (Ambient and Infrared Proximity Sensor)
 *
 * @ingroup maxds3231m i2c
 */
class MAXDS3231M {
    public:
        /**
         * Instanciates a MAXDS3231M object
         *
         * @param bus number of used bus
         * @param devAddr addres of used i2c device
         */
        MAXDS3231M (int bus=0, int devAddr=0x68);

        /**
         * MAXDS3231M object destructor, basicaly it close i2c connection.
         */
        ~MAXDS3231M ();

        /**
         * Set date and time on the chip.
         *
         * @param time staracture
         */
        void setDate (Time3231 &time);

        /**
         * Get date and time located on the chip.
         *
         * @param time staracture
         */
        bool getDate (Time3231 &time);

        /**
         * Get on board temperature.
         */
        uint16_t getTemperature ();

        /**
         * Return name of the component
         */
        std::string name()
        {
            return m_name;
        }
    private:
        std::string m_name;

        int m_i2cAddr;
        int m_bus;
        mraa_i2c_context m_i2Ctx;

        uint16_t i2cReadReg_N (int reg, unsigned int len, uint8_t * buffer);
        mraa_result_t i2cWriteReg_N (uint8_t reg, unsigned int len, uint8_t * buffer);
        uint8_t DECtoBSD (uint8_t data);
        uint8_t BCDtoDEC (uint8_t data);
};

}
