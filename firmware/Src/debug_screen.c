#include "debug_screen.h"
#include "disp.h"
#include "nec_decode.h"

#include "philips_pm5544_320_240.h"
#include "smpte_color_bars_320_240.h"
#include "screen_mfd_single_317_186.h"
#include "screen_mfd_multi_317_185.h"
#include "picture.h"

#define SCREEN_INIT 0
#define SCREEN_MAX 12

#define NEC_ADDR 0x87
#define NEC_CMD_JC 0x1E
#define NEC_CMD_JR 0x0C
#define NEC_CMD_JL 0x0E
#define NEC_CMD_JT 0x0F
#define NEC_CMD_JB 0x0D
#define NEC_CMD_IR_T 0x0B
#define NEC_CMD_IR_B 0x06
#define NEC_CMD_1 0x1F
#define NEC_CMD_2 0x10
#define NEC_CMD_3 0x1A
#define NEC_CMD_4 0x1C
#define NEC_CMD_5 0x05
#define NEC_CMD_6 0x04
#define NEC_CMD_7 0x40

static RNG_HandleTypeDef *rngHandle;
static TIM_HandleTypeDef *htimHandle;
static NEC nec;
static uint8_t currentScreen = 0xFF;
static uint8_t nextScreen = SCREEN_INIT;

static volatile uint16_t nec_address;
static volatile uint8_t nec_cmd;
static volatile uint8_t nec_need_read = 0;
static volatile uint8_t nec_error = 0;
static volatile uint8_t nec_repeat = 0;
static uint32_t nec_time = 0;

void myNecDecodedCallback(uint16_t address, uint8_t cmd);
void myNecErrorCallback(void);
void myNecRepeatCallback();

void DEBUG_SCREEN_init(RNG_HandleTypeDef *h, TIM_HandleTypeDef *ht) {
  rngHandle = h;
  htimHandle = ht;

  init_philips_pm5544_320_240();
  init_smpte_color_bars_320_240();
  init_screen_mfd_single_317x186();
  init_screen_mfd_multi_317_185();
  init_fox_240x320();

  nec.timerHandle = ht;
  nec.timerChannel = TIM_CHANNEL_1;
  nec.timerChannelActive = HAL_TIM_ACTIVE_CHANNEL_1;
  nec.timingBitBoundary = 1680;
  nec.timingAgcBoundary = 12500;
  nec.type = NEC_EXTENDED;
  nec.NEC_DecodedCallback = myNecDecodedCallback;
  nec.NEC_ErrorCallback = myNecErrorCallback;
  nec.NEC_RepeatCallback = myNecRepeatCallback;
  NEC_Read(&nec);
}

static void necTick() {
  if (nec_need_read) {
    nec_need_read = 0;

    // TODO: handle with separate timer
    if (HAL_GetTick() - nec_time > 10) {
      nec_time = HAL_GetTick();

      if (nec_error) {
        // handle error
        nec_error = 0;
        HAL_Delay(10);
      } else if (nec_repeat) {
        // handle repeat
        nec_repeat = 0;
        HAL_Delay(10);
      } else if (nec_address == NEC_ADDR) {
        switch (nec_cmd) {
          case NEC_CMD_JR:
          case NEC_CMD_JB: {
            DEBUG_SCREEN_next();
            break;
          }
          case NEC_CMD_JL:
          case NEC_CMD_JT:{
            DEBUG_SCREEN_prev();
            break;
          }
          case NEC_CMD_1: {
            nextScreen = 0;
            break;
          }
          case NEC_CMD_2: {
            nextScreen = 1;
            break;
          }
          case NEC_CMD_3: {
            nextScreen = 2;
            break;
          }
          case NEC_CMD_4: {
            nextScreen = 3;
            break;
          }
          case NEC_CMD_5: {
            nextScreen = 4;
            break;
          }
          case NEC_CMD_6: {
            nextScreen = 5;
            break;
          }
          case NEC_CMD_7: {
            nextScreen = 6;
            break;
          }
          default: {
            break;
          }
        }
      }
    }

    NEC_Read(&nec);
  }
}

void DEBUG_SCREEN_tick() {
  necTick();

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
      case 4: {
        DISP_FillScreen(DISP_COLOR_GREEN);
        break;
      }
      case 5: {
        DISP_FillScreen(DISP_COLOR_BLUE);
        break;
      }
      case 6: {
        DISP_FillScreen(DISP_COLOR_BLUE);
        DISP_DrawBitmap(get_philips_pm5544_320_240(), 320, 240, 0, 1);
        break;
      }
      case 7: {
        DISP_FillScreen(DISP_COLOR_RED);
        DISP_DrawBitmap(get_smpte_color_bars_320_240(), 320, 240, 0, 1);
        break;
      }
      case 8: {
        DISP_FillScreen(DISP_COLOR_BLACK);
        DISP_DrawBitmap(get_screen_mfd_single_317x186(), 317, 186, 0, 1);
        break;
      }
      case 9: {
        DISP_FillScreen(DISP_COLOR_BLACK);
        DISP_DrawBitmap(get_screen_mfd_multi_317_185(), 317, 185, 0, 1);
        break;
      }
      case 10: {
        DISP_FillScreen(DISP_COLOR_RED);
        DISP_DrawBitmap(get_fox_240x320(), 240, 320, 1, 0);
        break;
      }
      case 11: {
        for (uint16_t i = 0; i < 100; i++) {
          DISP_FillRect(
              HAL_RNG_GetRandomNumber(rngHandle) % DISP_getScreenWidth(),
              HAL_RNG_GetRandomNumber(rngHandle) % DISP_getScreenHeight(),
              HAL_RNG_GetRandomNumber(rngHandle) % DISP_getScreenWidth(),
              HAL_RNG_GetRandomNumber(rngHandle) % DISP_getScreenHeight(),
              (uint16_t) HAL_RNG_GetRandomNumber(rngHandle)
          );

          // HAL_Delay(10);
        }
        break;
      }
      case SCREEN_MAX: {
        DISP_FillScreen((uint16_t) HAL_RNG_GetRandomNumber(rngHandle));
        break;
      }
      default: {
        break;
      }
    }

    currentScreen = nextScreen;
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

void DEBUG_SCREEN_reInit(void) {
  nextScreen = currentScreen;
  currentScreen = 0xFF;
}

void myNecDecodedCallback(uint16_t address, uint8_t cmd) {
  nec_address = address;
  nec_cmd = cmd;
  nec_need_read = 1;
}

void myNecErrorCallback() {
  nec_error = 1;
  nec_need_read = 1;
}

void myNecRepeatCallback() {
  nec_repeat = 1;
  nec_need_read = 1;
}

void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim) {
  if (htim == htimHandle) {
    NEC_TIM_IC_CaptureCallback(&nec);
  }
}
