#include "ili9341_mod.h"

static SPI_HandleTypeDef *hspi;

#define DISPLAY_WIDTH 240
#define DISPLAY_HEIGHT 320

#define SELECT()      HAL_GPIO_WritePin(GPIOC, GPIO_PIN_2, GPIO_PIN_RESET)
#define DESELECT()    HAL_GPIO_WritePin(GPIOC, GPIO_PIN_2, GPIO_PIN_SET)
#define COMMAND()     HAL_GPIO_WritePin(GPIOD, GPIO_PIN_13, GPIO_PIN_RESET)
#define DATA()        HAL_GPIO_WritePin(GPIOD, GPIO_PIN_13, GPIO_PIN_SET)

static void SPI_transmit(uint8_t *data, int length);

static void ILI9341_write_command(uint8_t command);

static void ILI9341_write_data(uint8_t data);

void ILI9341_init(SPI_HandleTypeDef *h) {
  hspi = h;

  /* select SPI5 */
  SELECT();     // only one SPI slave on bus (keep slave selected)

  /* ILI9341 initialization sequence */

  /* software reset */
  ILI9341_write_command(ILI9341_SOFTWARE_RESET);

  /* display out of sleep mode */
  ILI9341_write_command(ILI9341_SLEEP_OUT);

  /* set memory access control */
  ILI9341_write_command(ILI9341_MEMORY_ACCESS_CONTROL);
  ILI9341_write_data(0x00);

  /* set frame rate control */
  ILI9341_write_command(ILI9341_FRAME_RATE_CONTROL_1);
  ILI9341_write_data(0x00);
  ILI9341_write_data(0x1B);

  /* set display function control */
  ILI9341_write_command(ILI9341_DISPLAY_FUNCTION_CONTROL);
  ILI9341_write_data(0x0A);
  ILI9341_write_data(0xA7);
  ILI9341_write_data(0x27);
  ILI9341_write_data(0x04);

  ILI9341_write_command(ILI9341_PUMP_RATIO_CONTROL);  // Pump Ratio Control
  ILI9341_write_data(0x20);

  ILI9341_write_command(ILI9341_NORMAL_MODE_ON);

  /* select pixel data format*/
  ILI9341_write_command(ILI9341_PIXEL_FORMAT_SET);
  ILI9341_write_data(0x55); // 0x55 - 16 bit Format; 0x66 - 18 bit Format

  ILI9341_write_command(ILI9341_3GAMMA_ENABLE); // 3Gamma Function Disable
  ILI9341_write_data(0x00);

  ILI9341_write_command(ILI9341_GAMMA_REGISTER); // Gamma Curve selected
  ILI9341_write_data(0x01);

  ILI9341_write_command(ILI9341_POSITIVE_GAMMA_CORRECTION); // Positive Gamma Correction
  ILI9341_write_data(0x0F);
  ILI9341_write_data(0x31);
  ILI9341_write_data(0x2B);
  ILI9341_write_data(0x0C);
  ILI9341_write_data(0x0E);
  ILI9341_write_data(0x08);
  ILI9341_write_data(0x4E);
  ILI9341_write_data(0xF1);
  ILI9341_write_data(0x37);
  ILI9341_write_data(0x07);
  ILI9341_write_data(0x10);
  ILI9341_write_data(0x03);
  ILI9341_write_data(0x0E);
  ILI9341_write_data(0x09);
  ILI9341_write_data(0x00);

  ILI9341_write_command(ILI9341_NEGATIVE_GAMMA_CORRECTION); // Negative Gamma Correction
  ILI9341_write_data(0x00);
  ILI9341_write_data(0x0E);
  ILI9341_write_data(0x14);
  ILI9341_write_data(0x03);
  ILI9341_write_data(0x11);
  ILI9341_write_data(0x07);
  ILI9341_write_data(0x31);
  ILI9341_write_data(0xC1);
  ILI9341_write_data(0x48);
  ILI9341_write_data(0x08);
  ILI9341_write_data(0x0F);
  ILI9341_write_data(0x0C);
  ILI9341_write_data(0x31);
  ILI9341_write_data(0x36);
  ILI9341_write_data(0x0F);

  /* configure RGB interface */
  ILI9341_write_command(ILI9341_RGB_INTERFACE_CONTROL);
  ILI9341_write_data(0xC2);

  /* enable display */
  ILI9341_write_command(ILI9341_DISPLAY_ON);

  /* delay */
  HAL_Delay(120);

  /* select RGB interface */
  ILI9341_write_command(ILI9341_INTERFACE_CONTROL);
  ILI9341_write_data(0x01);
  ILI9341_write_data(0x00);
  ILI9341_write_data(0x06);

  DESELECT();

  /* clear display */
  //ILI9341_clear_screen();
}

void ILI9341_set_window(int x, int y, int width, int height) {
  int end_column = x + width - 1;
  ILI9341_write_command(ILI9341_COLUMN_ADDRESS_SET);
  uint8_t caset[] = {(unsigned int) x >> 8, x, (unsigned int) end_column >> 8, end_column};
  for (int i = 0; i < sizeof caset; i++) {
    ILI9341_write_data(caset[i]);
  }

  int end_page = y + height - 1;
  COMMAND();
  ILI9341_write_command(ILI9341_PAGE_ADDRESS_SET);
  uint8_t raset[] = {(unsigned int) y >> 8, y, (unsigned int) end_page >> 8, end_page};
  for (int i = 0; i < sizeof raset; i++) {
    ILI9341_write_data(raset[i]);
  }

  ILI9341_write_command(ILI9341_GRAM_WRITE);
}

void ILI9341_push_color(unsigned char red, unsigned char green, unsigned char blue) {
  ILI9341_write_data(red);
  ILI9341_write_data(green);
  ILI9341_write_data(blue);
}

void ILI9341_draw_pixel(int x, int y, unsigned char red, unsigned char green, unsigned char blue) {
  ILI9341_set_window(x, y, 1, 1);
  ILI9341_push_color(red, green, blue);
}

void ILI9341_clear_screen(void) {
  ILI9341_set_window(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
  for (int i = 0; i < DISPLAY_WIDTH * DISPLAY_HEIGHT; i++) {
    ILI9341_push_color(0xFF, 0x00, 0x00);
  }
}

static void SPI_transmit(uint8_t *data, int length) {
  HAL_SPI_Transmit(hspi, data, length, 0);
}

static void ILI9341_write_command(uint8_t command) {
  COMMAND();
  SPI_transmit(&command, 1);
}

static void ILI9341_write_data(uint8_t data) {
  DATA();
  SPI_transmit(&data, 1);
}
