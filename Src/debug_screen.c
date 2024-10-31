#include "debug_screen.h"
#include "disp.h"

#include "philips_pm5544_320_240.h"
//#include "smpte_color_bars_320_240.h"
//#include "screen_mfd_single_317_186.h"
//#include "screen_mfd_multi_317_185.h"
//#include "picture.h"

#define SCREEN_MAX 12

static RNG_HandleTypeDef *rngHandle;
static uint8_t currentScreen = 254;
static uint8_t nextScreen = 0;

void DEBUG_SCREEN_init(RNG_HandleTypeDef *h) {
  rngHandle = h;
  init_philips_pm5544_320_240();
//  init_smpte_color_bars_320_240();
//  init_screen_mfd_single_317x186();
//  init_screen_mfd_multi_317_185();
//  init_fox_240x320();
}

void DEBUG_SCREEN_tick() {
  uint8_t shouldSkip = 0;

  if (currentScreen != nextScreen) {
    switch (nextScreen) {
      case 0: {
        DISP_drawRects(DISP_getScreenWidth(), DISP_getScreenHeight(), 10);
        break;
      }
      case 1: {
        DISP_drawRects(DISP_getScreenWidth(), DISP_getScreenHeight(), 4);
        break;
      }
      case 2: {
        DISP_drawRects(DISP_getScreenWidth(), DISP_getScreenHeight(), 1);
        break;
      }
      case 3: {
        DISP_FillScreen(DISP_COLOR_RED);
        break;
      }
//      case 4: {
//        DISP_FillScreen(DISP_COLOR_GREEN);
//        break;
//      }
      case 5: {
        DISP_FillScreen(DISP_COLOR_BLUE);
        break;
      }
      case 6: {
        DISP_FillScreen(DISP_COLOR_BLACK);
        DISP_DrawBitmap(get_philips_pm5544_320_240(), 320, 240, 0, 1);
        break;
      }
//      case 7: {
//        DISP_FillScreen(DISP_COLOR_BLACK);
//        DISP_DrawBitmap(get_smpte_color_bars_320_240(), 320, 240, 0, 1);
//        break;
//      }
//      case 8: {
//        DISP_FillScreen(DISP_COLOR_BLACK);
//        DISP_DrawBitmap(get_screen_mfd_single_317x186(), 317, 186, 0, 1);
//        break;
//      }
//      case 9: {
//        DISP_FillScreen(DISP_COLOR_BLACK);
//        DISP_DrawBitmap(get_screen_mfd_multi_317_185(), 317, 185, 0, 1);
//        break;
//      }
//      case 10: {
//        DISP_FillScreen(DISP_COLOR_BLACK);
//        DISP_DrawBitmap(get_fox_240x320(), 240, 320, 1, 0);
//        break;
//      }
      case 11: {
        for (uint16_t i = 0; i < 1000; i++) {
          DISP_FillRect(
              HAL_RNG_GetRandomNumber(rngHandle) % DISP_getScreenWidth(),
              HAL_RNG_GetRandomNumber(rngHandle) % DISP_getScreenHeight(),
              HAL_RNG_GetRandomNumber(rngHandle) % DISP_getScreenWidth(),
              HAL_RNG_GetRandomNumber(rngHandle) % DISP_getScreenHeight(),
              (uint16_t) HAL_RNG_GetRandomNumber(rngHandle)
          );

          HAL_Delay(10);
        }
        break;
      }
      case SCREEN_MAX: {
        for (uint16_t i = 0; i < 5; i++) {
          DISP_FillScreen((uint16_t) HAL_RNG_GetRandomNumber(rngHandle));
          HAL_Delay(750);
        }
        break;
      }
      default: {
        nextScreen++;
        shouldSkip = 1;
        break;
      }
    }

    if (!shouldSkip) {
      currentScreen = nextScreen;
    }
  }
}

void DEBUG_SCREEN_prev(void) {
  if (nextScreen == 0) {
    nextScreen = SCREEN_MAX;
  } else {
    nextScreen--;
  }
}

void DEBUG_SCREEN_next(void) {
  if (nextScreen == SCREEN_MAX) {
    nextScreen = 0;
  } else {
    nextScreen++;
  }
}
