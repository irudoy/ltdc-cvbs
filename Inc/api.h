#ifndef LTDC_0_API_H
#define LTDC_0_API_H

#include "main.h"

void API_Init(UART_HandleTypeDef *h);

HAL_StatusTypeDef API_transmit(uint8_t *pData, uint16_t size);

#endif //LTDC_0_API_H
