/*
 * BlurBubble Physical Speech Privacy Shield - Ultrasonic Jammer Firmware
 * Target Platform: STM32F103 / ESP32 with external MOSFET Driver
 * Core Technology: High-Frequency Parametric Carrier Modulation (24kHz - 25.5kHz)
 * 
 * Description: Generates ultrasonic acoustic noise that saturates the non-linear 
 *              diaphragm response of standard MEMS microphones (smartphones, IoT, 
 *              spy recorders) without being audible to the human ear.
 * 
 * Circuit Schematic Outline:
 *                              [3.3V GPIO MCU]
 *                                     |
 *                                     v
 *                           [TC4427 Gate Driver]
 *                                     |
 *                     +---------------+---------------+
 *                     |                               |
 *               [N-Ch MOSFET]                   [P-Ch MOSFET]
 *                     |                               |
 *                     +---------------+---------------+
 *                                     |
 *                            [10uH Step-Up Inductor]
 *                                     |
 *                       [24kHz Transducer Array]
 *                                     |
 *                                   [GND]
 */

#include <stdint.h>
#include <stdbool.h>
#include <math.h>

// Core Hardware Configuration
#define TIM_PERIOD_40MHZ_CLK        1600   // Capped for 25.0kHz output PWM frequency
#define MIN_SWEEP_FREQ_HZ           24000  // Lower inaudibility boundary
#define MAX_SWEEP_FREQ_HZ           25500  // Upper ultrasonic efficiency boundary
#define TRANSDUCER_RESONANCE_HZ     25000  // Central peak response of Kobitone transducers

// Simple pseudo-random white noise generator
static uint32_t m_random_seed = 0xAA55AA55;

uint32_t hardware_random_generate(void) {
    m_random_seed ^= (m_random_seed << 13);
    m_random_seed ^= (m_random_seed >> 17);
    m_random_seed ^= (m_random_seed << 5);
    return m_random_seed;
}

/**
 * Configure Timer PWM parameters.
 * PWM outputs are routed via hardware channels to GPIO Pins (e.g. GPIO_PIN_8 / PA8 on STM32)
 */
void init_ultrasonic_pwm_timer(void) {
    // 1. Enable Clock for Port A and Timer 1 (Typical STM32 configuration)
    // RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOA | RCC_APB2Periph_TIM1, ENABLE);

    // 2. Configure Pin PA8 as Alternate Function Push-Pull
    // GPIO_InitStructure.GPIO_Pin = GPIO_Pin_8;
    // GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    // GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    // GPIO_Init(GPIOA, &GPIO_InitStructure);

    // 3. Configure Time Base
    // TIM_TimeBaseStructure.TIM_Period = TIM_PERIOD_40MHZ_CLK;
    // TIM_TimeBaseStructure.TIM_Prescaler = 0;
    // TIM_TimeBaseStructure.TIM_ClockDivision = 0;
    // TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_Up;
    // TIM_TimeBaseInit(TIM1, &TIM_TimeBaseStructure);

    // 4. Set Duty Cycle to 50% for maximum acoustic energy transfer
    // TIM_OCInitStructure.TIM_OCMode = TIM_OCMode_PWM1;
    // TIM_OCInitStructure.TIM_OutputState = TIM_OutputState_Enable;
    // TIM_OCInitStructure.TIM_Pulse = TIM_PERIOD_40MHZ_CLK / 2;
    // TIM_OC1Init(TIM1, &TIM_OCInitStructure);

    // 5. Fire up the Timer
    // TIM_Cmd(TIM1, ENABLE);
}

/**
 * Dynamic Frequency & Amplitude Modulator Loop.
 * To prevent smart recording algorithms from running spectral noise cancellation,
 * we modulate the ultrasonic carrier with a swept-sine wave and overlay a 
 * pseudo-random white noise AM envelope.
 */
void run_ultrasonic_jammer_loop(void) {
    uint32_t tick = 0;
    float sweep_angle = 0.0f;
    
    init_ultrasonic_pwm_timer();

    while (true) {
        tick++;

        // 1. Calculate Swept Frequency (Low-frequency LFO sweep)
        // Sweep oscillates between 24,000Hz and 25,500Hz at a 12Hz sweep rate
        sweep_angle += 0.002f; // Low-frequency phase accumulator step
        if (sweep_angle > 2.0f * M_PI) {
            sweep_angle -= 2.0f * M_PI;
        }
        
        float base_sweep = sinf(sweep_angle); // Ranges [-1.0, 1.0]
        float target_freq = TRANSDUCER_RESONANCE_HZ + (base_sweep * 750.0f); // Map to [24250Hz, 25750Hz]

        // 2. Generate White Noise AM Envelope
        // Creates sharp amplitude bursts resembling conversational human vocal patterns
        uint32_t random_val = hardware_random_generate();
        float noise_amplitude = (float)(random_val % 100) / 100.0f; // Range [0.0, 1.0]

        // 3. Translate modulated frequency to Timer Prescalers
        // Frequency Formula: F_pwm = System_Clock / (TIM_Period * TIM_Prescaler)
        // Assuming 72MHz internal PLL System Clock and Prescaler = 1:
        uint32_t calculated_period = (uint32_t)(72000000.0f / target_freq);

        // Apply AM duty-cycle modulation to distort microphone ADC quantizers
        // Duty cycles vary between 35% and 50% to simulate conversational speech peaks
        uint32_t target_duty = (uint32_t)((calculated_period / 2) * (0.7f + (0.3f * noise_amplitude)));

        // 4. Commit values directly to MCU Hardware Registers
        // TIM_SetAutoreload(TIM1, calculated_period);
        // TIM_SetCompare1(TIM1, target_duty);

        // Low-latency loop timing delay (~40 microseconds)
        for (volatile int d = 0; d < 400; d++) {
            __asm__("nop"); 
        }
    }
}
