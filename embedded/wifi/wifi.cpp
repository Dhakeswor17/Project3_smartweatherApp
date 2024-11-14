#include "wifi.h"

int connectWifi(){
    if (cyw43_arch_init_with_country(CYW43_COUNTRY_FINLAND)) {
		printf("failed to initialise\n");
		return 0;
	}
	printf("initialised\n");

	cyw43_arch_enable_sta_mode();

	if (cyw43_arch_wifi_connect_timeout_ms(SSID, PASSWORD, CYW43_AUTH_WPA2_AES_PSK, 10000)) {
		printf("failed to connect\n");
		return 0;
	}

    return 1;
}