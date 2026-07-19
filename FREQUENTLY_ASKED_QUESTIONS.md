# 💬 BlurBubble Frequently Asked Questions (FAQ)

Welcome to the BlurBubble Help Center. Below, we answer common questions about spatial privacy, battery usage, and device compatibility in simple, non-technical language to help you understand how BlurBubble protects you, your family, and your business.

---

## 🔒 Privacy & General Protection

### 1. Does the BlurBubble app or tag track my physical location?
**No. Absolutely not.**  
Unlike traditional GPS tracking apps, BlurBubble does not collect, log, or transmit your physical coordinates. Your phone or wearable tag acts solely as a **passive broadcaster**—it simply announces your "do not record me" preference to the immediate surrounding area (about 25 meters). All custom profiles, settings, and historical logs are stored strictly inside your phone’s private storage (`localStorage`) and never leave your device.

### 2. Can strangers or stalkers track me using my BlurBubble signal?
**No. We use rotating security shields.**  
To prevent anyone from tracing your movements, BlurBubble rotates your beacon's digital identifier every 30 seconds. To an outside observer, your tag looks like a brand-new, anonymous device every time it changes, keeping you secure from tracking or profiling.

### 3. How does BlurBubble protect my children at school?
**Through automated School Geofences.**  
You can link a cheap, durable Bluetooth tag (such as a Pebblebee or Tile) to your child’s school bag or uniform. When the child enters a registered school boundary, the school’s static BlurBubble beacon establishes an automated protection zone. Nearby compliant devices (like visitor smart glasses or smartphones) instantly catch the signal at the school gates and automatically blur the kids' faces in real-time.

### 4. What happens if someone uses an old camera or a "jailbroken" device that doesn't comply?
**Our AI Streaming Crawler has you covered.**  
While compliant hardware (from brands like Apple, Meta, Google, Snap, DJI, and GoPro) blurs your face instantly inside the device, some rogue users might capture raw footage. To protect you, BlurBubble includes an automated web crawler that sweeps popular social media (TikTok, Instagram, YouTube) and audio streaming directories (Spotify, Apple Podcasts, SoundCloud). If it detects your registered biometrics, school uniform hashes, or voiceprints in a public upload, it automatically issues a legally compliant takedown and retroactive blurring demand.

---

## 🔋 Battery Usage & Efficiency

### 5. Will running BlurBubble on my phone drain my battery?
**No. It uses less than 1% of your daily battery.**  
The protocol operates on **Bluetooth Low Energy (BLE)**—the same ultra-efficient wireless standard used by wireless earbuds and fitness trackers. It runs silently in the background and is highly optimized to conserve your smartphone's battery life.

### 6. How long do physical smart tags last?
**Between 6 months to over a year on a single watch battery.**  
Because standard BLE tags only transmit tiny, short packets of data every few seconds, they consume almost zero battery power. You do not need to recharge them; simply swap out the standard coin cell battery once a year.

---

## 📱 Device Compatibility & Hardware Support

### 7. Do I have to buy expensive, proprietary BlurBubble hardware?
**No! BlurBubble is open and hardware-agnostic.**  
The protocol is designed to run on existing, off-the-shelf consumer devices. You can use:
*   **Your existing smartphone or smartwatch** (Apple Watch, WearOS, Garmin).
*   **Common key finders** (Apple AirTags, Pebblebee, Tile, Chipolo).
*   **Custom maker boards** (ESP32-S3, nRF52840, Raspberry Pi) if you like to build your own electronics.

*For an exhaustive list of devices and integration details, please check out our **[HARDWARE_ROADMAP.md](./HARDWARE_ROADMAP.md)**.*

### 8. Does the blur layer make the camera footage look glitchy or slow?
**No, the blurring is smooth and instantaneous.**  
On compliant hardware, the dynamic blur is applied directly inside the camera's Image Signal Processor (ISP) chip. Because the chip is built specifically to process video frames at lighting speed, adding the blur takes microseconds and has zero impact on the recording's frame rate or video quality for the person filming.

---

## ⚖️ Open Source & Project Status

### 9. Is BlurBubble a real commercial product?
**It is currently an Open Beta Sandbox and learning project.**  
This repository is an educational space designed to demonstrate and visualize the future of spatial privacy protocols (aligning with draft standards like RFC-9402). While the simulators, cryptographic designs, and web crawlers in the interface are fully functional mockups, the project is a work-in-progress to help developers, schools, and companies understand how spatial opt-out networks can be built.

### 10. Can I modify the code or build my own version?
**Yes! The project is licensed under the GNU GPLv3.**  
We believe privacy belongs to everyone, which is why we retired all restrictive, closed-source agreements (NDAs) in favor of the **GNU General Public License v3 (GPLv3)**. You are free to copy, modify, and share this codebase, provided that any improvements you publish also remain open-source for the rest of the community.

*To review our licensing terms or commercial options for large tech manufacturers, please read our **[OWNERSHIP_VESTING_DECLARATION.md](./OWNERSHIP_VESTING_DECLARATION.md)**.*
