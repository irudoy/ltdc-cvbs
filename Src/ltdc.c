#include "ltdc.h"

extern volatile uint32_t RGB565_320x240[38400];
extern LTDC_HandleTypeDef hltdc;

void TFT_FillScreen(uint32_t color) {
  uint32_t i;
  uint32_t n = hltdc.LayerCfg[0].ImageHeight * hltdc.LayerCfg[0].ImageWidth;
  for (i = 0; i < n; i++) {
    *(__IO uint16_t*) (hltdc.LayerCfg[0].FBStartAdress + (i * 2)) = (uint16_t) color;
  }
}
