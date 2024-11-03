#ifndef ADV7393_H
#define ADV7393_H

#include "main.h"

#define ADV7393_I2C_ADDR 0x54
#define ADV7393_I2C_ADDR_R (ADV7393_I2C_ADDR | 0x1)
#define ADV7393_I2C_ADDR_W ADV7393_I2C_ADDR

#define ADV7393_PWR_MODE_REG 0x00
#define ADV7393_MODE_SEL_REG 0x01
#define ADV7393_MODE_REG_0 0x02
#define ADV7393_DAC_OUT_LVL_REG 0x0B
#define ADV7393_DAC_PWR_MODE_REG 0x0D
#define ADV7393_CABLE_DETECT_REG 0x10
#define ADV7393_PP_READBACK_REG_A 0x13
#define ADV7393_PP_READBACK_REG_B 0x14
#define ADV7393_CP_READBACK_REG 0x16
#define ADV7393_SW_RESET_REG 0x17
#define ADV7393_SD_MODE_REG_1 0x80
#define ADV7393_SD_MODE_REG_2 0x82
#define ADV7393_SD_MODE_REG_3 0x83
#define ADV7393_SD_MODE_REG_4 0x84
#define ADV7393_SD_MODE_REG_5 0x86
#define ADV7393_SD_MODE_REG_6 0x87
#define ADV7393_SD_MODE_REG_7 0x88
#define ADV7393_SD_MODE_REG_8 0x89
#define ADV7393_SD_TIMING_REG_0 0x8A
#define ADV7393_SD_TIMING_REG_1 0x8B
#define ADV7393_SD_FSC_REG_0 0x8C
#define ADV7393_SD_FSC_REG_1 0x8D
#define ADV7393_SD_FSC_REG_2 0x8E
#define ADV7393_SD_FSC_REG_3 0x8F
#define ADV7393_SD_FSC_PHASE_REG 0x90
#define ADV7393_SD_CL_CAP_REG_0 0x91
#define ADV7393_SD_CL_CAP_REG_1 0x92
#define ADV7393_SD_CL_CAP_REG_2 0x93
#define ADV7393_SD_CL_CAP_REG_3 0x94
#define ADV7393_SD_PEDESTAL_REG_0 0x95
#define ADV7393_SD_PEDESTAL_REG_1 0x96
#define ADV7393_SD_PEDESTAL_REG_2 0x97
#define ADV7393_SD_PEDESTAL_REG_3 0x98
#define ADV7393_SD_CGMS_WSS_REG_0 0x99
#define ADV7393_SD_CGMS_WSS_REG_1 0x9A
#define ADV7393_SD_CGMS_WSS_REG_2 0x9B
#define ADV7393_SD_SCALE_LSB_REG 0x9C
#define ADV7393_SD_SCALE_Y_REG 0x9D
#define ADV7393_SD_SCALE_CB_REG 0x9E
#define ADV7393_SD_SCALE_CR_REG 0x9F
#define ADV7393_SD_HUE_ADJ_REG 0xA0
#define ADV7393_SD_BR_WSS_REG 0xA1
#define ADV7393_SD_LUMA_SSAF_REG 0xA2
#define ADV7393_SD_DNR_REG_0 0xA3
#define ADV7393_SD_DNR_REG_1 0xA4
#define ADV7393_SD_DNR_REG_2 0xA5
#define ADV7393_SD_GAMMA_REG_A0 0xA6
#define ADV7393_SD_GAMMA_REG_A1 0xA7
#define ADV7393_SD_GAMMA_REG_A2 0xA8
#define ADV7393_SD_GAMMA_REG_A3 0xA9
#define ADV7393_SD_GAMMA_REG_A4 0xAA
#define ADV7393_SD_GAMMA_REG_A5 0xAB
#define ADV7393_SD_GAMMA_REG_A6 0xAC
#define ADV7393_SD_GAMMA_REG_A7 0xAD
#define ADV7393_SD_GAMMA_REG_A8 0xAE
#define ADV7393_SD_GAMMA_REG_A9 0xAF
#define ADV7393_SD_GAMMA_REG_B0 0xB0
#define ADV7393_SD_GAMMA_REG_B1 0xB1
#define ADV7393_SD_GAMMA_REG_B2 0xB2
#define ADV7393_SD_GAMMA_REG_B3 0xB3
#define ADV7393_SD_GAMMA_REG_B4 0xB4
#define ADV7393_SD_GAMMA_REG_B5 0xB5
#define ADV7393_SD_GAMMA_REG_B6 0xB6
#define ADV7393_SD_GAMMA_REG_B7 0xB7
#define ADV7393_SD_GAMMA_REG_B8 0xB8
#define ADV7393_SD_GAMMA_REG_B9 0xB9
#define ADV7393_SD_BR_DETECT_REG 0xBA
#define ADV7393_SD_FIELD_CNT_REG 0xBB

#define ADV7393_PWR_MODE_RST        0b00010010 // 0x12
#define ADV7393_MODE_SEL_RST        0b00000000 // 0x00
#define ADV7393_MODE_REG_0_RST      0b00100000 // 0x20
#define ADV7393_DAC_OUT_LVL_RST     0b00000000 // 0x00
#define ADV7393_DAC_PWR_MODE_RST    0b00000000 // 0x00
#define ADV7393_CABLE_DETECT_RST    0b00000000 // 0x00
#define ADV7393_SW_RESET_RST        0b00000000 // 0x00
#define ADV7393_SD_MODE_REG_1_RST   0b00010000 // 0x10
#define ADV7393_SD_MODE_REG_2_RST   0b00001011 // 0x0B
#define ADV7393_SD_MODE_REG_3_RST   0b00000100 // 0x04
#define ADV7393_SD_MODE_REG_4_RST   0b00000000 // 0x00
#define ADV7393_SD_MODE_REG_5_RST   0b00000010 // 0x02
#define ADV7393_SD_MODE_REG_6_RST   0b00000000 // 0x00
#define ADV7393_SD_MODE_REG_7_RST   0b00000000 // 0x00
#define ADV7393_SD_MODE_REG_8_RST   0b00000000 // 0x00
#define ADV7393_SD_TIMING_REG_0_RST 0b00001000 // 0x08
#define ADV7393_SD_TIMING_REG_1_RST 0b00000000 // 0x00

void adv7393_init(I2C_HandleTypeDef *h);

uint32_t ADV7393_readFsc(void);

void ADV7393_writeFsc(uint32_t fsc);

#endif //ADV7393_H