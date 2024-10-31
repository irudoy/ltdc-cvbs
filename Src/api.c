#include "api.h"

#define PACKET_SIZE 64

static uint8_t rxBuffer[PACKET_SIZE];
static UART_HandleTypeDef *uartHandle;

void API_Init(UART_HandleTypeDef *huart) {
  uartHandle = huart;
  HAL_UART_Receive_IT(uartHandle, rxBuffer, PACKET_SIZE);
}

HAL_StatusTypeDef API_transmit(uint8_t *pData, uint16_t size) {
  return HAL_UART_Transmit(uartHandle, pData, size, 1000);
}

static void API_parsePacket() {
  for (uint16_t i = 0; i < PACKET_SIZE; i++) {
    volatile uint8_t b = rxBuffer[i];
    switch (b) {
      default:
        HAL_Delay(0);
        break;
    }
  }
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
  if (huart->Instance != uartHandle->Instance) {
    return;
  }

  HAL_UART_Receive_IT(uartHandle, rxBuffer, PACKET_SIZE);
  API_parsePacket();
}
