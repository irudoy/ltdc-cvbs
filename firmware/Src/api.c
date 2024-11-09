#include "api.h"
#include "debug_screen.h"
#include "disp.h"
#include "adv7393.h"

#define PACKET_SIZE 64

static uint8_t rxBuffer[PACKET_SIZE];
static uint8_t txBuffer[PACKET_SIZE];
static UART_HandleTypeDef *uartHandle;

enum CommandOut {
  NEXT_SCREEN = 0xc1,
  PREV_SCREEN = 0xc2,
  GET_CONFIG = 0xc3,
  PUSH_CONFIG = 0xc4,
  GET_CLK_CONFIG = 0xc5,
  PUSH_CLK_CONFIG = 0xc6,
  GET_ADV7393_CONFIG = 0xc7,
  PUSH_ADV7393_CONFIG = 0xc8,
};

enum DataTypeIn {
  LTDC_CONFIG = 0xf1,
  LTDC_CLK_CONFIG = 0xf2,
  ADV7393_CONFIG = 0xf3,
};

void API_Init(UART_HandleTypeDef *huart) {
  uartHandle = huart;
  HAL_UART_Receive_IT(uartHandle, rxBuffer, PACKET_SIZE);
}

HAL_StatusTypeDef API_transmit(const uint8_t *pData, uint16_t size) {
  uint8_t crc = 0;
  for (int i = 0; i < PACKET_SIZE - 1; i++) {
    txBuffer[i] = i < size ? pData[i] : 0xFF;
    crc += txBuffer[i];
  }
  txBuffer[PACKET_SIZE - 1] = crc;
  return HAL_UART_Transmit(uartHandle, txBuffer, PACKET_SIZE, 2000);
}

static uint8_t checkCrc() {
  uint8_t crc = 0;
  for (int i = 0; i < PACKET_SIZE - 1; i++) {
    crc += rxBuffer[i];
  }
  return crc == rxBuffer[PACKET_SIZE - 1];
}

static void API_parsePacket() {
  uint8_t crcCorrect = checkCrc();
  if (!crcCorrect) {
    return;
  }

  uint8_t payloadSize = rxBuffer[1];

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
          .HorizontalSync = (uint32_t) (rxBuffer[2] | rxBuffer[3] << 8 | rxBuffer[4] << 16 | rxBuffer[5] << 24),
          .VerticalSync = (uint32_t) (rxBuffer[6] | rxBuffer[7] << 8 | rxBuffer[8] << 16 | rxBuffer[9] << 24),
          .AccumulatedHBP = (uint32_t) (rxBuffer[10] | rxBuffer[11] << 8 | rxBuffer[12] << 16 | rxBuffer[13] << 24),
          .AccumulatedVBP = (uint32_t) (rxBuffer[14] | rxBuffer[15] << 8 | rxBuffer[16] << 16 | rxBuffer[17] << 24),
          .AccumulatedActiveW = (uint32_t) (rxBuffer[18] | rxBuffer[19] << 8 | rxBuffer[20] << 16 | rxBuffer[21] << 24),
          .AccumulatedActiveH = (uint32_t) (rxBuffer[22] | rxBuffer[23] << 8 | rxBuffer[24] << 16 | rxBuffer[25] << 24),
          .TotalWidth = (uint32_t) (rxBuffer[26] | rxBuffer[27] << 8 | rxBuffer[28] << 16 | rxBuffer[29] << 24),
          .TotalHeight = (uint32_t) (rxBuffer[30] | rxBuffer[31] << 8 | rxBuffer[32] << 16 | rxBuffer[33] << 24),
          .ImageWidth = (uint32_t) (rxBuffer[34] | rxBuffer[35] << 8 | rxBuffer[36] << 16 | rxBuffer[37] << 24),
          .ImageHeight = (uint32_t) (rxBuffer[38] | rxBuffer[39] << 8 | rxBuffer[40] << 16 | rxBuffer[41] << 24),
      };

      DISP_reInit(&cfg);
      break;
    }
    case GET_CLK_CONFIG: {
      DISP_LTDC_ClockConfigTypeDef cfg = DISP_Get_Clock_Config();

      uint8_t data[14] = {
          LTDC_CLK_CONFIG,
          12,
      };

      uint32_t *cfg_values[] = {
          &cfg.PLLSAIN,
          &cfg.PLLSAIR,
          &cfg.PLLSAIDivR,
      };

      for (int i = 0; i < 3; i++) {
        data[2 + i * 4] = (uint8_t) (*cfg_values[i] & 0xFF);
        data[3 + i * 4] = (uint8_t) ((*cfg_values[i] >> 8) & 0xFF);
        data[4 + i * 4] = (uint8_t) ((*cfg_values[i] >> 16) & 0xFF);
        data[5 + i * 4] = (uint8_t) ((*cfg_values[i] >> 24) & 0xFF);
      }

      API_transmit(data, 14);
      break;
    }
    case PUSH_CLK_CONFIG: {
      DISP_LTDC_ClockConfigTypeDef cfg = {
          .PLLSAIN = (uint32_t) (rxBuffer[2] | rxBuffer[3] << 8 | rxBuffer[4] << 16 | rxBuffer[5] << 24),
          .PLLSAIR = (uint32_t) (rxBuffer[6] | rxBuffer[7] << 8 | rxBuffer[8] << 16 | rxBuffer[9] << 24),
          .PLLSAIDivR = (uint32_t) (rxBuffer[10] | rxBuffer[11] << 8 | rxBuffer[12] << 16 | rxBuffer[13] << 24),
      };

      switch (cfg.PLLSAIDivR) {
        case 0:
          cfg.PLLSAIDivR = RCC_PLLSAIDIVR_2;
          break;
        case 1:
          cfg.PLLSAIDivR = RCC_PLLSAIDIVR_4;
          break;
        case 2:
          cfg.PLLSAIDivR = RCC_PLLSAIDIVR_8;
          break;
        case 3:
          cfg.PLLSAIDivR = RCC_PLLSAIDIVR_16;
          break;
        default:
          break;
      }

      DISP_Set_Clock_Config(&cfg);
      break;
    }
    case GET_ADV7393_CONFIG: {
      uint8_t size = payloadSize * 2;
      uint8_t data[PACKET_SIZE] = {
          ADV7393_CONFIG,
          size,
      };

      for (uint8_t i = 0; i < payloadSize; i++) {
        data[2 + i * 2] = rxBuffer[2 + i];
        data[3 + i * 2] = ADV7393_readReg(rxBuffer[2 + i]);
      }

      API_transmit(data, size + 2);
      break;
    }
    case PUSH_ADV7393_CONFIG: {
      for (uint8_t i = 0; i < payloadSize / 2; i++) {
        uint8_t reg = rxBuffer[2 + i * 2];
//        volatile uint8_t currValue = ADV7393_readReg(reg);
        uint8_t newValue = rxBuffer[3 + i * 2];
//        if (newValue != currValue) {
//          HAL_Delay(1);
//        }
        ADV7393_writeReg(reg, newValue);
      }
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

  API_parsePacket();
  HAL_UART_Receive_IT(uartHandle, rxBuffer, PACKET_SIZE);
}
