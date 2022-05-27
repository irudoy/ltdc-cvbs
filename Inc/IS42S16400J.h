#ifndef __IS42S16400J_H
#define __IS42S16400J_H

#include "stm32f4xx_hal.h"

#define SDRAM_BANK_ADDR                          ((uint32_t)0xD0000000)
#define SDRAM_BANK_SIZE                          ((uint32_t)0x800000) // SDRAM bank size bytes

/**
 * Refresh rate counter
 * Device refresh rate
 *
 * (15.62 us x Freq) - 20
 */
#define SDRAM_REFRESH_RATE                       ((uint32_t)1386)

#define SDRAM_TIMEOUT                            ((uint32_t)0xFFFF)

#define SDRAM_MODEREG_BURST_LENGTH_1             ((uint16_t)0x0000)
#define SDRAM_MODEREG_BURST_LENGTH_2             ((uint16_t)0x0001)
#define SDRAM_MODEREG_BURST_LENGTH_4             ((uint16_t)0x0002)
#define SDRAM_MODEREG_BURST_LENGTH_8             ((uint16_t)0x0004)
#define SDRAM_MODEREG_BURST_TYPE_SEQUENTIAL      ((uint16_t)0x0000)
#define SDRAM_MODEREG_BURST_TYPE_INTERLEAVED     ((uint16_t)0x0008)
#define SDRAM_MODEREG_CAS_LATENCY_2              ((uint16_t)0x0020)
#define SDRAM_MODEREG_CAS_LATENCY_3              ((uint16_t)0x0030)
#define SDRAM_MODEREG_OPERATING_MODE_STANDARD    ((uint16_t)0x0000)
#define SDRAM_MODEREG_WRITEBURST_MODE_PROGRAMMED ((uint16_t)0x0000)
#define SDRAM_MODEREG_WRITEBURST_MODE_SINGLE     ((uint16_t)0x0200)

void IS42S16400J_Init(SDRAM_HandleTypeDef *hsdram);

#endif /* __IS42S16400J_H */
