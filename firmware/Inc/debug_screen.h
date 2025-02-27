#ifndef LTDC_0_DEBUG_SCREEN_H
#define LTDC_0_DEBUG_SCREEN_H

#include "main.h"

void DEBUG_SCREEN_init(RNG_HandleTypeDef *h, TIM_HandleTypeDef *ht);

void DEBUG_SCREEN_tick(void);

void DEBUG_SCREEN_prev(void);

void DEBUG_SCREEN_next(void);

void DEBUG_SCREEN_reInit(void);

#endif //LTDC_0_DEBUG_SCREEN_H
