#ifndef __LTDC_H
#define __LTDC_H

#include "stm32f4xx_hal.h"
#include <string.h>
#include <stdlib.h>

void TFT_FillScreen(uint32_t color);
void TFT_FillRect(uint16_t x1, uint16_t y1, uint16_t x2, uint16_t y2, uint16_t color);
void TFT_DrawPixel(uint16_t Xpos, uint16_t Ypos, uint32_t color);
void TFT_DrawBitmap(uint16_t *ptr_image, uint16_t img_width, uint16_t img_height, uint8_t tile, uint8_t center);
uint16_t TFT_SwapRedBlue(uint16_t color);

#endif /* __LTDC_H */
