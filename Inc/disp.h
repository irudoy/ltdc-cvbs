#ifndef __DISP_H
#define __DISP_H

#include "main.h"

/**
   * For 16 bpp colors the color format is RGB565.
   * That is 5 bits for red, 6 bits for green, 5 bits for blue.
   * As we have 5 bits for red, fully lit is 31
   */
#define DISP_COLOR_BRIGHT_PURPLE (31 << 11 | 0 << 5 | 31 << 0)
#define DISP_COLOR_RED (31 << 11 | 0 << 5 | 0 << 0)
#define DISP_COLOR_GREEN (0 << 11 | 31 << 5 | 0 << 0)
#define DISP_COLOR_BLUE (0 << 11 | 0 << 5 | 31 << 0)
#define DISP_COLOR_WHITE 0xFFFF
#define DISP_COLOR_BLACK 0

typedef struct DISP_LTDC_ConfigTypeDef {
  uint32_t HorizontalSync;
  uint32_t VerticalSync;
  uint32_t AccumulatedHBP;
  uint32_t AccumulatedVBP;
  uint32_t AccumulatedActiveW;
  uint32_t AccumulatedActiveH;
  uint32_t TotalWidth;
  uint32_t TotalHeight;
  uint32_t ImageWidth;
  uint32_t ImageHeight;
} DISP_LTDC_ConfigTypeDef;

typedef struct DISP_LTDC_ClockConfigTypeDef {
  uint32_t PLLSAIN;
  uint32_t PLLSAIR;
  uint32_t PLLSAIDivR; // RCC_PLLSAIDIVR_2, RCC_PLLSAIDIVR_4, RCC_PLLSAIDIVR_8, RCC_PLLSAIDIVR_16
} DISP_LTDC_ClockConfigTypeDef;

void DISP_FillScreen(uint16_t color);

void DISP_FillRect(uint16_t x1, uint16_t y1, uint16_t x2, uint16_t y2, uint16_t color);

void DISP_DrawPixel(uint16_t Xpos, uint16_t Ypos, uint16_t color);

void DISP_DrawBitmap(uint16_t *ptr_image, uint16_t img_width, uint16_t img_height, uint8_t tile, uint8_t center);

uint16_t DISP_SwapRedBlue(uint16_t color);

void DISP_drawRects(uint16_t w, uint16_t h, uint8_t step);

uint32_t DISP_getScreenWidth(void);

uint32_t DISP_getScreenHeight(void);

DISP_LTDC_ConfigTypeDef DISP_getCurrentCfg(void);

void DISP_init(SDRAM_HandleTypeDef *hsdram, LTDC_HandleTypeDef *hltdc, SPI_HandleTypeDef *hspi, I2C_HandleTypeDef *hi2c);

void DISP_reInit(DISP_LTDC_ConfigTypeDef *newCfg);

uint32_t DISP_getLtdcPixelClockFreq(void);

void DISP_Set_Clock_Config(DISP_LTDC_ClockConfigTypeDef *cfg);

DISP_LTDC_ClockConfigTypeDef DISP_Get_Clock_Config(void);

#endif /* __DISP_H */
