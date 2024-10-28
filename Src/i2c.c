#include "i2c.h"

extern I2C_HandleTypeDef hi2c3;

uint8_t I2C_ReadData(uint8_t Addr, uint8_t Reg) {
  HAL_StatusTypeDef status = HAL_OK;
  uint8_t value = 0;

  status = HAL_I2C_Mem_Read(&hi2c3, Addr, Reg, I2C_MEMADD_SIZE_8BIT, &value, 1, I2C_TIMEOUT_MAX);

  /* Check the communication status */
  if (status != HAL_OK) {
    /* Re-Initialize the BUS */
    //I2Cx_Error();
  }
  return value;
}


HAL_StatusTypeDef I2C_WriteData(uint8_t Addr, uint8_t Reg, uint8_t Value) {
  HAL_StatusTypeDef status = HAL_OK;

  status = HAL_I2C_Mem_Write(&hi2c3, Addr, (uint16_t) Reg, I2C_MEMADD_SIZE_8BIT, &Value, 1, I2C_TIMEOUT_MAX);

  /* Check the communication status */
  if (status != HAL_OK) {
    /* Re-Initialize the BUS */
    //I2Cx_Error();
  }

  return status;
}
