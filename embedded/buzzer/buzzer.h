#ifndef BUZZER_H_
#define BUZZER_H_

#include "hardware/pwm.h"

#define BUZZER_PIN ((uint)12)

void buzzer_pwm_init();
void buzzer_pwm_set_duty_cycle(uint8_t duty_cycle);
void buzzer_pwm_stop();

#endif