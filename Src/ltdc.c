#include "ltdc.h"
#include <stdlib.h>

#define swap(a, b) { int16_t t = a; a = b; b = t; }

extern LTDC_HandleTypeDef hltdc;

void TFT_FillScreen(uint32_t color) {
  uint32_t i;
  uint32_t n = hltdc.LayerCfg[0].ImageHeight * hltdc.LayerCfg[0].ImageWidth;
  for (i = 0; i < n; i++) {
    *(__IO uint16_t*) (hltdc.LayerCfg[0].FBStartAdress + (i * 2)) = TFT_SwapRedBlue((uint16_t)color);
  }
}

void TFT_FillRect(uint16_t x1, uint16_t y1, uint16_t x2, uint16_t y2, uint16_t color) {
  uint32_t xpos, ypos;
  if (x1 > x2) swap(x1, x2);
  if (y1 > y2) swap(y1, y2);
  for (ypos = y1; ypos <= y2; ypos++) {
    for (xpos = x1; xpos <= x2; xpos++) {
      *(__IO uint16_t*) (hltdc.LayerCfg[0].FBStartAdress + (2 * (ypos * hltdc.LayerCfg[0].ImageWidth + xpos))) = TFT_SwapRedBlue((uint16_t)color);
    }
  }
}

void TFT_DrawPixel(uint16_t Xpos, uint16_t Ypos, uint32_t color) {
  *(__IO uint16_t*) (hltdc.LayerCfg[0].FBStartAdress + (2 * (Ypos * hltdc.LayerCfg[0].ImageWidth + Xpos))) = TFT_SwapRedBlue((uint16_t)color);
}

void TFT_DrawBitmap(uint16_t *ptr_image) {
  // uint16_t pic_resx, uint16_t pic_resy, uint16_t pic_posx, uint16_t pic_posy
  uint32_t i;
  uint32_t n = hltdc.LayerCfg[0].ImageHeight * hltdc.LayerCfg[0].ImageWidth;

  for (i = 0; i < n; i++) {
    *(__IO uint16_t*) (hltdc.LayerCfg[0].FBStartAdress + (i * 2)) = TFT_SwapRedBlue(ptr_image[i]);
  }
}

/**
 * 0x001F - Blue channel bitmask
 * 0xF800 - Red channel bitmask
 * 0x7e0 - Green channel bitmask
 */
uint16_t TFT_SwapRedBlue(uint16_t color) {
  return (((color & 0x001F) << 11) | ((color & 0xF800) >> 11)) | (color & 0x7e0);
}
