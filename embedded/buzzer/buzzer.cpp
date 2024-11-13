#include "buzzer.h"

void buzzer_pwm_init() {
	// Set period of 255 cycles (0 to 255 inclusive)
    pwm_set_wrap(pwm_gpio_to_slice_num(BUZZER_PIN), 255);

    // Set channel A output high for 0 cycle before dropping
    pwm_set_chan_level(pwm_gpio_to_slice_num(BUZZER_PIN), PWM_CHAN_A, 0);

    // Set the PWM running
    pwm_set_enabled(pwm_gpio_to_slice_num(BUZZER_PIN), true);
}

void buzzer_pwm_set_duty_cycle(uint8_t duty_cycle) {
    pwm_set_chan_level(pwm_gpio_to_slice_num(BUZZER_PIN), PWM_CHAN_A, duty_cycle);
}

void buzzer_pwm_stop() {
    pwm_set_enabled(pwm_gpio_to_slice_num(BUZZER_PIN), false);
}