#include "ltdc.h"
#include <stdlib.h>

#define swap(a, b) { int16_t t = a; a = b; b = t; }

extern volatile uint32_t RGB565_320x240[38400];
extern LTDC_HandleTypeDef hltdc;

void TFT_FillScreen(uint32_t color) {
  uint32_t i;
  uint32_t n = hltdc.LayerCfg[0].ImageHeight * hltdc.LayerCfg[0].ImageWidth;
  for (i = 0; i < n; i++) {
    *(__IO uint16_t*) (hltdc.LayerCfg[0].FBStartAdress + (i * 2)) = (uint16_t) color;
  }
}

void TFT_FillRect(uint16_t x1, uint16_t y1, uint16_t x2, uint16_t y2, uint16_t color) {
  uint32_t xpos, ypos;
  if (x1 > x2) swap(x1, x2);
  if (y1 > y2) swap(y1, y2);
  for (ypos = y1; ypos <= y2; ypos++) {
    for (xpos = x1; xpos <= x2; xpos++) {
      *(__IO uint16_t*) (hltdc.LayerCfg[0].FBStartAdress + (2 * (ypos * hltdc.LayerCfg[0].ImageWidth + xpos))) = (uint16_t)color;
    }
  }
}

void TFT_DrawPixel(uint16_t Xpos, uint16_t Ypos, uint32_t color) {
   *(__IO uint16_t*) (hltdc.LayerCfg[0].FBStartAdress + (2 * (Ypos * hltdc.LayerCfg[0].ImageWidth + Xpos))) = (uint16_t)color;
}
