#include <math.h>
#include "main.h"
#include "disp.h"
#include "adv7393.h"
#include "sdram.h"
#include "ili9341_mod.h"

#define FRAME_BUFFER_ADDR SDRAM_BANK_ADDR

#define swap(a, b) { int16_t t = a; a = b; b = t; }

static LTDC_HandleTypeDef *ltdc;

void DISP_FillScreen(uint16_t color) {
  uint32_t i;
  uint32_t n = ltdc->LayerCfg[0].ImageHeight * ltdc->LayerCfg[0].ImageWidth;
  for (i = 0; i < n; i++) {
    *(__IO uint16_t *) (ltdc->LayerCfg[0].FBStartAdress + (i * 2)) = DISP_SwapRedBlue(color);
  }
}

void DISP_FillRect(uint16_t x1, uint16_t y1, uint16_t x2, uint16_t y2, uint16_t color) {
  uint32_t xpos, ypos;
  if (x1 > x2) swap(x1, x2);
  if (y1 > y2) swap(y1, y2);
  for (ypos = y1; ypos <= y2; ypos++) {
    for (xpos = x1; xpos <= x2; xpos++) {
      *(__IO uint16_t *) (ltdc->LayerCfg[0].FBStartAdress +
                          (2 * (ypos * ltdc->LayerCfg[0].ImageWidth + xpos))) = DISP_SwapRedBlue((uint16_t) color);
    }
  }
}

void DISP_DrawPixel(uint16_t Xpos, uint16_t Ypos, uint16_t color) {
  *(__IO uint16_t *) (ltdc->LayerCfg[0].FBStartAdress +
                      (2 * (Ypos * ltdc->LayerCfg[0].ImageWidth + Xpos))) = DISP_SwapRedBlue(color);
}

void DISP_DrawBitmap(uint16_t *ptr_image, uint16_t img_width, uint16_t img_height, uint8_t tile, uint8_t center) {
  uint16_t screen_width = ltdc->LayerCfg[0].ImageWidth;
  uint16_t screen_height = ltdc->LayerCfg[0].ImageHeight;

  int16_t offset_x = center && img_width < screen_width ? (screen_width - img_width) / 2 : 0;
  int16_t offset_y = center && img_height < screen_height ? (screen_height - img_height) / 2 : 0;

  for (uint16_t y = 0; y < screen_height; y++) {
    for (uint16_t x = 0; x < screen_width; x++) {
      uint16_t src_x = tile ? (x - offset_x) % img_width : (x - offset_x);
      uint16_t src_y = tile ? (y - offset_y) % img_height : (y - offset_y);

      if (src_x < 0 || src_x >= img_width || src_y < 0 || src_y >= img_height) {
        continue;
      }

      uint32_t addr = ltdc->LayerCfg[0].FBStartAdress + (y * screen_width + x) * 2;
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
  return ltdc->LayerCfg[0].ImageWidth;
}

uint32_t DISP_getScreenHeight() {
  return ltdc->LayerCfg[0].ImageHeight;
}

DISP_LTDC_ConfigTypeDef DISP_getCurrentCfg() {
  DISP_LTDC_ConfigTypeDef cfg = {
      .HorizontalSync = ltdc->Init.HorizontalSync,
      .VerticalSync = ltdc->Init.VerticalSync,
      .AccumulatedHBP = ltdc->Init.AccumulatedHBP,
      .AccumulatedVBP = ltdc->Init.AccumulatedVBP,
      .AccumulatedActiveW = ltdc->Init.AccumulatedActiveW,
      .AccumulatedActiveH = ltdc->Init.AccumulatedActiveH,
      .TotalWidth = ltdc->Init.TotalWidth,
      .TotalHeight = ltdc->Init.TotalHeigh,
      .ImageWidth = ltdc->LayerCfg[0].ImageWidth,
      .ImageHeight = ltdc->LayerCfg[0].ImageHeight,
  };
  return cfg;
}

uint32_t DISP_getLtdcPixelClockFreq(void) {
  uint32_t pllsai_source_freq;
  uint32_t pllm, pllsain, pllsair, ltdc_div;
  if (__HAL_RCC_GET_PLL_OSCSOURCE() == RCC_PLLSOURCE_HSE) {
    pllsai_source_freq = HSE_VALUE;
  } else {
    pllsai_source_freq = HSI_VALUE;
  }
  pllm = (RCC->PLLCFGR & RCC_PLLCFGR_PLLM) >> RCC_PLLCFGR_PLLM_Pos;
  pllsain = (RCC->PLLSAICFGR & RCC_PLLSAICFGR_PLLSAIN) >> RCC_PLLSAICFGR_PLLSAIN_Pos;
  pllsair = (RCC->PLLSAICFGR & RCC_PLLSAICFGR_PLLSAIR) >> RCC_PLLSAICFGR_PLLSAIR_Pos;
  ltdc_div = (RCC->DCKCFGR & RCC_DCKCFGR_PLLSAIDIVR) >> RCC_DCKCFGR_PLLSAIDIVR_Pos;
  uint32_t pllsai_vco_freq = (pllsai_source_freq / pllm) * pllsain;
  uint32_t pllsai_r_freq = pllsai_vco_freq / pllsair;
  uint32_t ltdc_pixel_clock_freq = pllsai_r_freq / (ltdc_div == 0 ? 2 : (ltdc_div == 1 ? 4 : 8));
  return ltdc_pixel_clock_freq;
}

static void DISP_updateFsc() {
  // Init FSC
  // Default for ntsc: 569408543 0x21F07C1F

  // ntsc_sf_hz = 3579545
  // clkFreqHz = 27000000
  // totalWidth = 857
  // lineClkCycles = (totalWidth + 1) * 2 = 1716
  // lineClkFreq = clkFreqHz / lineClkCycles = 15734.26
  // lineSubcPeriods = ntsc_sf_hz / lineClkFreq = 227.5
  // register_value = (lineSubcPeriods / lineClkCycles) * (2^32) = 569408543

  // uint32_t currentFsc = ADV7393_readFsc();

  const uint32_t ntscFscHz = 3579545;

  uint32_t clkFreqHz = DISP_getLtdcPixelClockFreq() * 2;
  uint32_t totalWidth = ltdc->Init.TotalWidth;
  uint32_t lineClkCycles = (totalWidth + 1) * 2;

  double lineClkFreq = (double) clkFreqHz / (double) lineClkCycles;
  double lineSubcPeriods = (double) ntscFscHz / lineClkFreq;

  // have 569408471 there, but it must be 569408543
  uint32_t newFsc = (uint32_t)round((lineSubcPeriods * 4294967296.0) / lineClkCycles);

  ADV7393_writeFsc(newFsc);
}

void DISP_init(SDRAM_HandleTypeDef *hsdram, LTDC_HandleTypeDef *hltdc, SPI_HandleTypeDef *hspi, I2C_HandleTypeDef *hi2c) {
  ltdc = hltdc;

  IS42S16400J_Init(hsdram);
  ILI9341_init(hspi);
  adv7393_init(hi2c);

  DISP_updateFsc();

  HAL_LTDC_SetAddress(hltdc, FRAME_BUFFER_ADDR, LTDC_LAYER_1);
}

void DISP_reInit(DISP_LTDC_ConfigTypeDef *newCfg) {
  LTDC_LayerCfgTypeDef pLayerCfg = {0};

  ltdc->Init.HorizontalSync = newCfg->HorizontalSync;
  ltdc->Init.VerticalSync = newCfg->VerticalSync;
  ltdc->Init.AccumulatedHBP = newCfg->AccumulatedHBP;
  ltdc->Init.AccumulatedVBP = newCfg->AccumulatedVBP;
  ltdc->Init.AccumulatedActiveW = newCfg->AccumulatedActiveW;
  ltdc->Init.AccumulatedActiveH = newCfg->AccumulatedActiveH;
  ltdc->Init.TotalWidth = newCfg->TotalWidth;
  ltdc->Init.TotalHeigh = newCfg->TotalHeight;
  if (HAL_LTDC_Init(ltdc) != HAL_OK) {
    Error_Handler();
  }
  pLayerCfg.WindowX0 = ltdc->LayerCfg[0].WindowX0;
  pLayerCfg.WindowX1 = newCfg->ImageWidth;
  pLayerCfg.WindowY0 = ltdc->LayerCfg[0].WindowY0;
  pLayerCfg.WindowY1 = newCfg->ImageHeight;
  pLayerCfg.PixelFormat = ltdc->LayerCfg[0].PixelFormat;
  pLayerCfg.Alpha = ltdc->LayerCfg[0].Alpha;
  pLayerCfg.Alpha0 = ltdc->LayerCfg[0].Alpha0;
  pLayerCfg.BlendingFactor1 = ltdc->LayerCfg[0].BlendingFactor1;
  pLayerCfg.BlendingFactor2 = ltdc->LayerCfg[0].BlendingFactor2;
  pLayerCfg.FBStartAdress = ltdc->LayerCfg[0].FBStartAdress;
  pLayerCfg.ImageWidth = newCfg->ImageWidth;
  pLayerCfg.ImageHeight = newCfg->ImageHeight;
  pLayerCfg.Backcolor.Blue = ltdc->LayerCfg[0].Backcolor.Blue;
  pLayerCfg.Backcolor.Green = ltdc->LayerCfg[0].Backcolor.Green;
  pLayerCfg.Backcolor.Red = ltdc->LayerCfg[0].Backcolor.Red;
  if (HAL_LTDC_ConfigLayer(ltdc, &pLayerCfg, 0) != HAL_OK) {
    Error_Handler();
  }

  HAL_LTDC_SetAddress(ltdc, FRAME_BUFFER_ADDR, LTDC_LAYER_1);

  DISP_updateFsc();
}