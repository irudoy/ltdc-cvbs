#include "adv7393.h"

#define COLOR_BARS 0
#define I2C_TIMEOUT_MAX 0x3000
#define MB(byte, val, pos, len) (((byte) & ~(((1U << (len)) - 1) << (pos))) | (((val) & ((1U << (len)) - 1)) << (pos)))

static I2C_HandleTypeDef *hi2c;

static uint8_t read(uint8_t reg) {
  uint8_t value = 0;
  HAL_I2C_Mem_Read(hi2c, ADV7393_I2C_ADDR_R, (uint16_t) reg, I2C_MEMADD_SIZE_8BIT, &value, 1, I2C_TIMEOUT_MAX);
  return value;
}

static HAL_StatusTypeDef write(uint8_t reg, uint8_t value) {
  return HAL_I2C_Mem_Write(hi2c, ADV7393_I2C_ADDR_W, (uint16_t) reg, I2C_MEMADD_SIZE_8BIT, &value, 1, I2C_TIMEOUT_MAX);
}

void adv7393_init(I2C_HandleTypeDef *h) {
  hi2c = h;

  /**
   * b0 - Reserved
   * b1 - Software reset - Writing a 1 resets the device; this is a self-clearing bit.
   * b[2:7] - Reserved
   */
  write(ADV7393_SW_RESET_REG, MB(ADV7393_SW_RESET_RST, 0b1, 1, 1));

  /**
   * b0 - SD PrPb SSAF filter
   * b1 - SD DAC Output 1
   * b2 - Reserved
   * b3 - SD pedestal
   * b4 - SD square pixel mode
   * b5 - SD VCR FF/RW sync
   * b6 - SD pixel data valid
   * b7 - SD active video edge control
   */
  write(ADV7393_SD_MODE_REG_2, MB(ADV7393_SD_MODE_REG_2_RST, 0b1, 6, 1));

  /**
   * b0 - SD SFL/SCR/TR mode select
   * b[1:2] - SD active video length
   * b3 - SD active video length
   * b4 - SD chroma
   * b5 - SD burst
   * b6 - SD color bars
   * b7 - SD luma/chroma swap
   */
  write(ADV7393_SD_MODE_REG_4, COLOR_BARS == 1 ? MB(ADV7393_SD_MODE_REG_4_RST, 0b1, 6, 1) : ADV7393_SD_MODE_REG_4_RST);

  /**
   * b[0:1] - NTSC color subcarrier adjust
   * b2 - Reserved
   * b3 - SD EIA/CEA-861B synchronization compliance
   * b[4:5] - Reserved
   * b6 - SD horizontal/vertical counter mode (When set to 0, the horizontal/vertical counters automatically wrap around at the end of the line/field/frame of the selected standard. When set to 1, the horizontal/vertical counters are free running and wrap around when external sync signals indicate to do so.)
   * b7 - SD RGB color swap
   */
  //  write(ADV7393_SD_MODE_REG_5, MB(ADV7393_SD_MODE_REG_5_RST, 0b1, 6, 1));

  /**
   * b0 - SD luma and color scale control
   * b1 - SD luma scale saturation
   * b2 - SD hue adjust
   * b3 - SD brightness
   * b4 - SD luma SSAF gain
   * b5 - SD input standard auto-detection
   * b6 - Reserved
   * b7 - SD RGB input enable
   */
  write(ADV7393_SD_MODE_REG_6, MB(ADV7393_SD_MODE_REG_6_RST, 0b1, 7, 1));

  /**
   * b0 - Reserved
   * b1 - SD non-interlaced mode
   * b2 - SD double buffering
   * b[3:4] - SD input format (0b10 - 16-bit SD RGB input)
   * b5 - SD digital noise reduction
   * b6 - SD gamma correction enable
   * b7 - SD gamma correction curve select
   */
  write(ADV7393_SD_MODE_REG_7, MB(MB(ADV7393_SD_MODE_REG_7_RST, 0b10, 3, 2), 0b1, 1, 1));

  /**
   * b0 - SD slave/master mode (0b0 - slave, 0b1 - master)
   * b[1:2] - SD timing mode (0b10 - Mode 2)
   * b3 - Reserved
   * b[4:5] - SD luma delay
   * b6 - SD minimum luma value
   * b7 - SD timing reset
   */
  write(ADV7393_SD_TIMING_REG_0, MB(ADV7393_SD_TIMING_REG_0_RST, 0b10, 1, 2));

  /**
   * # Given custom parameters for 320x240p resolution
   * pixel_clock_mhz = 6.7e6  # Pixel clock in Hz
   * hsync = 55               # HSync duration in pixels
   * hbp = 64                 # Horizontal Back Porch in pixels
   * active_width = 320       # Active width in pixels
   * hfp = 18                 # Horizontal Front Porch in pixels
   * subcarrier_frequency_ntsc = 3.579545e6  # NTSC subcarrier frequency in Hz (3.579545 MHz)
   *
   * # Step 1: Calculate total horizontal pixels
   * total_horizontal_pixels_custom = hsync + hbp + active_width + hfp
   *
   * # Step 2: Calculate line frequency (f_h)
   * line_frequency_custom = pixel_clock_mhz / total_horizontal_pixels_custom
   *
   * # Step 3: Calculate the number of subcarrier periods per line
   * subcarrier_periods_per_line_custom = subcarrier_frequency_ntsc / line_frequency_custom
   *
   * # Step 4: Calculate the Fsc register value for the custom parameters
   * fsc_value_custom = (subcarrier_periods_per_line_custom / total_horizontal_pixels_custom) * (2 ** 32)
   *
   * # Round to the nearest integer and convert to hexadecimal registers
   * fsc_value_custom_rounded = round(fsc_value_custom)
   * fsc_registers_custom = [(fsc_value_custom_rounded >> (8 * i)) & 0xFF for i in range(4)]
   *
   * fsc_value_custom_rounded, fsc_registers_custom
   * 
   * Fsc=2294631151 (0x88C54AEF)
   *
   * // Modified : 4.43361875 / 29.5 * (2^32) = 645499916 -> 0x26798C0C
   * (3.57954 / (6.7 * 2)) * (2^32) = 1147313973 -> 0x44629F35
   */

}

uint32_t ADV7393_readFsc(void) {
  uint32_t fsc = 0;
  for (int i = 0; i < 4; i++) {
    fsc |= read(ADV7393_SD_FSC_REG_0 + i) << (i * 8);
  }
  return fsc;
}

void ADV7393_writeFsc(uint32_t fsc) {
  uint8_t fsc_bytes[4];
  for (int i = 0; i < 4; i++) {
    fsc_bytes[i] = (fsc >> (i * 8)) & 0xFF;
  }
  for (int i = 0; i < 4; i++) {
    write(ADV7393_SD_FSC_REG_0 + i, fsc_bytes[i]);
  }
}
