#include "main.h"
#include "disp.h"
#include "adv7393.h"
#include "sdram.h"
#include "ili9341_mod.h"

#define FRAME_BUFFER_ADDR SDRAM_BANK_ADDR

#define swap(a, b) { int16_t t = a; a = b; b = t; }

extern LTDC_HandleTypeDef hltdc;
extern SDRAM_HandleTypeDef hsdram1;

void DISP_FillScreen(uint16_t color) {
  uint32_t i;
  uint32_t n = hltdc.LayerCfg[0].ImageHeight * hltdc.LayerCfg[0].ImageWidth;
  for (i = 0; i < n; i++) {
    *(__IO uint16_t *) (hltdc.LayerCfg[0].FBStartAdress + (i * 2)) = DISP_SwapRedBlue(color);
  }
}

void DISP_FillRect(uint16_t x1, uint16_t y1, uint16_t x2, uint16_t y2, uint16_t color) {
  uint32_t xpos, ypos;
  if (x1 > x2) swap(x1, x2);
  if (y1 > y2) swap(y1, y2);
  for (ypos = y1; ypos <= y2; ypos++) {
    for (xpos = x1; xpos <= x2; xpos++) {
      *(__IO uint16_t *) (hltdc.LayerCfg[0].FBStartAdress +
                          (2 * (ypos * hltdc.LayerCfg[0].ImageWidth + xpos))) = DISP_SwapRedBlue((uint16_t) color);
    }
  }
}

void DISP_DrawPixel(uint16_t Xpos, uint16_t Ypos, uint16_t color) {
  *(__IO uint16_t *) (hltdc.LayerCfg[0].FBStartAdress +
                      (2 * (Ypos * hltdc.LayerCfg[0].ImageWidth + Xpos))) = DISP_SwapRedBlue(color);
}

void DISP_DrawBitmap(uint16_t *ptr_image, uint16_t img_width, uint16_t img_height, uint8_t tile, uint8_t center) {
  uint16_t screen_width = hltdc.LayerCfg[0].ImageWidth;
  uint16_t screen_height = hltdc.LayerCfg[0].ImageHeight;

  int16_t offset_x = center && img_width < screen_width ? (screen_width - img_width) / 2 : 0;
  int16_t offset_y = center && img_height < screen_height ? (screen_height - img_height) / 2 : 0;

  for (uint16_t y = 0; y < screen_height; y++) {
    for (uint16_t x = 0; x < screen_width; x++) {
      uint16_t src_x = tile ? (x - offset_x) % img_width : (x - offset_x);
      uint16_t src_y = tile ? (y - offset_y) % img_height : (y - offset_y);

      if (src_x < 0 || src_x >= img_width || src_y < 0 || src_y >= img_height) {
        continue;
      }

      uint32_t addr = hltdc.LayerCfg[0].FBStartAdress + (y * screen_width + x) * 2;
      uint16_t pixel = DISP_SwapRedBlue(ptr_image[src_y * img_width + src_x]);

      *(__IO uint16_t *) addr = pixel;
    }
  }
}

/**
 * 0x001F - Blue channel bitmask
 * 0xF800 - Red channel bitmask
 * 0x7e0 - Green channel bitmask
 */
uint16_t DISP_SwapRedBlue(uint16_t color) {
  return (((color & 0x001F) << 11) | ((color & 0xF800) >> 11)) | (color & 0x7e0);
}

void DISP_drawRects(uint16_t w, uint16_t h, uint8_t step) {
  uint16_t colors[5] = {DISP_COLOR_RED, DISP_COLOR_GREEN, DISP_COLOR_BLUE, DISP_COLOR_WHITE,
                        DISP_COLOR_BLACK};
  uint8_t colorIndex = 0;

  uint16_t width = w;
  uint16_t height = h;

  uint16_t centerX = w / 2;
  uint16_t centerY = h / 2;

  while (width > 0 && height > 0) {
    uint16_t x1 = centerX - width / 2;
    uint16_t y1 = centerY - height / 2;
    uint16_t x2 = centerX + width / 2;
    uint16_t y2 = centerY + height / 2;

    DISP_FillRect(x1, y1, x2, y2, colors[colorIndex]);

    colorIndex = (colorIndex + 1) % 5;

    width -= step;
    height -= step;
  }
}

uint32_t DISP_getScreenWidth() {
  return hltdc.LayerCfg[0].ImageWidth;
}

uint32_t DISP_getScreenHeight() {
  return hltdc.LayerCfg[0].ImageHeight;
}

DISP_LTDC_ConfigTypeDef DISP_getCurrentCfg() {
  DISP_LTDC_ConfigTypeDef cfg = {
      .HorizontalSync = hltdc.Init.HorizontalSync,
      .VerticalSync = hltdc.Init.VerticalSync,
      .AccumulatedHBP = hltdc.Init.AccumulatedHBP,
      .AccumulatedVBP = hltdc.Init.AccumulatedVBP,
      .AccumulatedActiveW = hltdc.Init.AccumulatedActiveW,
      .AccumulatedActiveH = hltdc.Init.AccumulatedActiveH,
      .TotalWidth = hltdc.Init.TotalWidth,
      .TotalHeight = hltdc.Init.TotalHeigh,
      .ImageWidth = hltdc.LayerCfg[0].ImageWidth,
      .ImageHeight = hltdc.LayerCfg[0].ImageHeight,
  };
  return cfg;
}

void DISP_init() {
  IS42S16400J_Init(&hsdram1);
  ILI9341_init();
  adv7393_init();

  HAL_LTDC_SetAddress(&hltdc, FRAME_BUFFER_ADDR, LTDC_LAYER_1);
}

void DISP_reInit() {
  //  hltdc.Init.HorizontalSync = 63;
  //  hltdc.Init.VerticalSync = 3;
  //  hltdc.Init.AccumulatedHBP = 123;
  //  hltdc.Init.AccumulatedVBP = 18;
  //  hltdc.Init.AccumulatedActiveW = 763;
  //  hltdc.Init.AccumulatedActiveH = 258;
  //  hltdc.Init.TotalWidth = 779;
  //  hltdc.Init.TotalHeigh = 261;
  //  if (HAL_LTDC_Init(&hltdc) != HAL_OK) {
  //    Error_Handler();
  //  }
  //
  //  LTDC_LayerCfgTypeDef pLayerCfg = {0};
  //  pLayerCfg.WindowX0 = 0;
  //  pLayerCfg.WindowX1 = 320;
  //  pLayerCfg.WindowY0 = 0;
  //  pLayerCfg.WindowY1 = 240;
  //  pLayerCfg.PixelFormat = LTDC_PIXEL_FORMAT_RGB565;
  //  pLayerCfg.Alpha = 255;
  //  pLayerCfg.Alpha0 = 0;
  //  pLayerCfg.BlendingFactor1 = LTDC_BLENDING_FACTOR1_PAxCA;
  //  pLayerCfg.BlendingFactor2 = LTDC_BLENDING_FACTOR2_PAxCA;
  //  pLayerCfg.FBStartAdress = 0;
  //  pLayerCfg.ImageWidth = 320;
  //  pLayerCfg.ImageHeight = 240;
  //  pLayerCfg.Backcolor.Blue = 0;
  //  pLayerCfg.Backcolor.Green = 0;
  //  pLayerCfg.Backcolor.Red = 0;
  //  if (HAL_LTDC_ConfigLayer(&hltdc, &pLayerCfg, 0) != HAL_OK)
  //  {
  //    Error_Handler();
  //  }
  //
  //  HAL_LTDC_SetAddress(&hltdc, LCD_FRAME_BUFFER, LTDC_LAYER_1);
}