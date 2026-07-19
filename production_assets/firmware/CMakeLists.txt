cmake_minimum_required(VERSION 3.13)

# Define project name and language
project(BlurBubbleBeacon C CXX ASM)

# Ensure proper compiler flags for ARM Cortex-M4 architecture with Hard Floating Point unit
set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR arm)

# Set targeting options for Nordic nRF52840 SoC
add_definitions(-DNRF52840_XXAA)
add_definitions(-DBOARD_PCA10056) # Nordic nRF52840 DK platform config
add_definitions(-DSOFTDEVICE_PRESENT)
add_definitions(-DS140)
add_definitions(-DNRF_SD_BLE_API_VERSION=7)

# Power optimization and optimization flags
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -mcpu=cortex-m4 -mthumb -mabi=aapcs -mfloat-abi=hard -mfpu=fpv4-sp-d16")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -ffunction-sections -fdata-sections -fno-strict-aliasing -fno-builtin -fshort-enums")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -g3") # Optimize for size/speed and enable debug info

# Linker flags targeting SoftDevice Flash sectors
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,--gc-sections -Wl,-Map=${PROJECT_BINARY_DIR}/${PROJECT_NAME}.map")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} --specs=nano.specs -lc -lnosys")

# Include paths for nRF5 SDK components
include_directories(
    ${NRF_SDK_DIR}/components/toolchain/cmsis/include
    ${NRF_SDK_DIR}/components/libraries/util
    ${NRF_SDK_DIR}/components/libraries/log
    ${NRF_SDK_DIR}/components/libraries/log/src
    ${NRF_SDK_DIR}/components/libraries/experimental_section_vars
    ${NRF_SDK_DIR}/components/libraries/pwr_mgmt
    ${NRF_SDK_DIR}/components/libraries/mutex
    ${NRF_SDK_DIR}/components/libraries/delay
    ${NRF_SDK_DIR}/components/softdevice/s140/headers
    ${NRF_SDK_DIR}/components/softdevice/s140/headers/nrf52
    ${NRF_SDK_DIR}/components/softdevice/common
    ${NRF_SDK_DIR}/modules/nrfx
    ${NRF_SDK_DIR}/modules/nrfx/hal
    ${NRF_SDK_DIR}/modules/nrfx/mdk
    ${NRF_SDK_DIR}/integration/nrfx
    ${NRF_SDK_DIR}/integration/nrfx/legacy
)

# Core source files definition
set(SRC_FILES
    nrf52840_beacon.cpp
    ${NRF_SDK_DIR}/modules/nrfx/mdk/gcc_startup_nrf52840.S
    ${NRF_SDK_DIR}/modules/nrfx/mdk/system_nrf52840.c
    ${NRF_SDK_DIR}/components/libraries/util/app_error.c
    ${NRF_SDK_DIR}/components/libraries/util/app_util_platform.c
    ${NRF_SDK_DIR}/components/libraries/pwr_mgmt/app_pwr_mgmt.c
    ${NRF_SDK_DIR}/components/softdevice/common/nrf_sdh.c
    ${NRF_SDK_DIR}/components/softdevice/common/nrf_sdh_ble.c
)

add_executable(blurbubble_beacon.elf ${SRC_FILES})

# Post-build rules to compile binary hex files for direct flashing via J-Link / nRF Connect Programmer
add_custom_command(TARGET blurbubble_beacon.elf POST_BUILD
    COMMAND arm-none-eabi-objcopy -O ihex blurbubble_beacon.elf blurbubble_beacon.hex
    COMMAND arm-none-eabi-objcopy -O binary blurbubble_beacon.elf blurbubble_beacon.bin
    COMMENT "Generating flashing formats (.hex and .bin) for SEGGER J-Link / nRF Command Line tools..."
)
