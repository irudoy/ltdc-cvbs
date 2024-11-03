#include "api.h"
#include "debug_screen.h"
#include "disp.h"

#define PACKET_SIZE 64

static uint8_t rxBuffer[PACKET_SIZE];
static UART_HandleTypeDef *uartHandle;

enum CommandOut {
  NEXT_SCREEN = 0x01,
  PREV_SCREEN = 0x02,
  GET_CONFIG = 0x03,
  PUSH_CONFIG = 0x04,
};

enum DataTypeIn {
  LTDC_CONFIG = 0x01,
};

void API_Init(UART_HandleTypeDef *huart) {
  uartHandle = huart;
  HAL_UART_Receive_IT(uartHandle, rxBuffer, PACKET_SIZE);
}

HAL_StatusTypeDef API_transmit(uint8_t *pData, uint16_t size) {
  return HAL_UART_Transmit(uartHandle, pData, size, 1000);
}

static void API_parsePacket() {
  switch (rxBuffer[0]) {
    case NEXT_SCREEN: {
      DEBUG_SCREEN_next();
      break;
    }
    case PREV_SCREEN: {
      DEBUG_SCREEN_prev();
      break;
    }
    case GET_CONFIG: {
      DISP_LTDC_ConfigTypeDef cfg = DISP_getCurrentCfg();

      uint8_t data[42] = {
          LTDC_CONFIG,
          40,
      };

      uint32_t *cfg_values[] = {
          &cfg.HorizontalSync,
          &cfg.VerticalSync,
          &cfg.AccumulatedHBP,
          &cfg.AccumulatedVBP,
          &cfg.AccumulatedActiveW,
          &cfg.AccumulatedActiveH,
          &cfg.TotalWidth,
          &cfg.TotalHeight,
          (uint32_t *) &cfg.ImageWidth,
          (uint32_t *) &cfg.ImageHeight
      };

      for (int i = 0; i < 10; i++) {
        data[2 + i * 4] = (uint8_t) (*cfg_values[i] & 0xFF);
        data[3 + i * 4] = (uint8_t) ((*cfg_values[i] >> 8) & 0xFF);
        data[4 + i * 4] = (uint8_t) ((*cfg_values[i] >> 16) & 0xFF);
        data[5 + i * 4] = (uint8_t) ((*cfg_values[i] >> 24) & 0xFF);
      }

      API_transmit(data, 42);
      break;
    }
    case PUSH_CONFIG: {
      DISP_LTDC_ConfigTypeDef cfg = {
          .HorizontalSync = (uint32_t) (rxBuffer[1] | rxBuffer[2] << 8 | rxBuffer[3] << 16 | rxBuffer[4] << 24),
          .VerticalSync = (uint32_t) (rxBuffer[5] | rxBuffer[6] << 8 | rxBuffer[7] << 16 | rxBuffer[8] << 24),
          .AccumulatedHBP = (uint32_t) (rxBuffer[9] | rxBuffer[10] << 8 | rxBuffer[11] << 16 | rxBuffer[12] << 24),
          .AccumulatedVBP = (uint32_t) (rxBuffer[13] | rxBuffer[14] << 8 | rxBuffer[15] << 16 | rxBuffer[16] << 24),
          .AccumulatedActiveW = (uint32_t) (rxBuffer[17] | rxBuffer[18] << 8 | rxBuffer[19] << 16 | rxBuffer[20] << 24),
          .AccumulatedActiveH = (uint32_t) (rxBuffer[21] | rxBuffer[22] << 8 | rxBuffer[23] << 16 | rxBuffer[24] << 24),
          .TotalWidth = (uint32_t) (rxBuffer[25] | rxBuffer[26] << 8 | rxBuffer[27] << 16 | rxBuffer[28] << 24),
          .TotalHeight = (uint32_t) (rxBuffer[29] | rxBuffer[30] << 8 | rxBuffer[31] << 16 | rxBuffer[32] << 24),
          .ImageWidth = (uint32_t) (rxBuffer[33] | rxBuffer[34] << 8 | rxBuffer[35] << 16 | rxBuffer[36] << 24),
          .ImageHeight = (uint32_t) (rxBuffer[37] | rxBuffer[38] << 8 | rxBuffer[39] << 16 | rxBuffer[40] << 24),
      };

      DISP_reInit(&cfg);
      break;
    }
    default:
      break;
  }
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
  if (huart->Instance != uartHandle->Instance) {
    return;
  }

  HAL_UART_Receive_IT(uartHandle, rxBuffer, PACKET_SIZE);
  API_parsePacket();
}
