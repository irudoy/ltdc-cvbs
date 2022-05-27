#include "IS42S16400J.h"

FMC_SDRAM_CommandTypeDef command;

void IS42S16400J_Init(SDRAM_HandleTypeDef *hsdram) {
  __IO uint32_t tmpmrd = 0;

  command.CommandMode = FMC_SDRAM_CMD_CLK_ENABLE;
  command.CommandTarget = FMC_SDRAM_CMD_TARGET_BANK2;
  command.AutoRefreshNumber = 1;
  command.ModeRegisterDefinition = 0;
  HAL_SDRAM_SendCommand(hsdram, &command, SDRAM_TIMEOUT);

  command.CommandMode = FMC_SDRAM_CMD_PALL;
  command.CommandTarget = FMC_SDRAM_CMD_TARGET_BANK2;
  command.AutoRefreshNumber = 1;
  command.ModeRegisterDefinition = 0;
  HAL_SDRAM_SendCommand(hsdram, &command, SDRAM_TIMEOUT);

  command.CommandMode = FMC_SDRAM_CMD_AUTOREFRESH_MODE;
  command.CommandTarget = FMC_SDRAM_CMD_TARGET_BANK2;
  command.AutoRefreshNumber = 8;
  command.ModeRegisterDefinition = 0;
  HAL_SDRAM_SendCommand(hsdram, &command, SDRAM_TIMEOUT);

  tmpmrd = (uint32_t) SDRAM_MODEREG_BURST_LENGTH_1 |
                      SDRAM_MODEREG_BURST_TYPE_SEQUENTIAL |
//                      SDRAM_MODEREG_CAS_LATENCY_2 |
                      SDRAM_MODEREG_CAS_LATENCY_3 |
                      SDRAM_MODEREG_OPERATING_MODE_STANDARD |
                      SDRAM_MODEREG_WRITEBURST_MODE_SINGLE;

  command.CommandMode = FMC_SDRAM_CMD_LOAD_MODE;
  command.CommandTarget = FMC_SDRAM_CMD_TARGET_BANK2;
  command.AutoRefreshNumber = 1;
  command.ModeRegisterDefinition = tmpmrd;
  HAL_SDRAM_SendCommand(hsdram, &command, SDRAM_TIMEOUT);

  HAL_SDRAM_ProgramRefreshRate(hsdram, SDRAM_REFRESH_RATE);
}
