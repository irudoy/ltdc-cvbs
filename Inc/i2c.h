#ifndef I2C_H
#define I2C_H

#include "main.h"

#define I2C_TIMEOUT_MAX 0x3000 /*<! The value of the maximal timeout for I2C waiting loops */

uint8_t I2C_ReadData(uint8_t Addr, uint8_t Reg);
HAL_StatusTypeDef I2C_WriteData(uint8_t Addr, uint8_t Reg, uint8_t Value);

#endif //I2C_H
