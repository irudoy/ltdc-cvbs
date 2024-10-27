#define DISPLAY_WIDTH   hltdc.LayerCfg[0].ImageWidth
#define DISPLAY_HEIGHT  hltdc.LayerCfg[0].ImageHeight
//#define BPP               3 // unused?

void ILI9341_init(void);
void ILI9341_set_window(int x, int y, int width, int height);
void ILI9341_clear_screen(void);
void ILI9341_push_color(unsigned char red, unsigned char green, unsigned char blue);
