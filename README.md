# C-3PO Head Controller for Espruino

This project controls a C-3PO head model with an Espruino board. It features:
- Randomly plays hardcoded sound clips from an SD card using a DFPlayer Mini module.
- Detects head orientation (UP/DOWN) via an accelerometer.
- Detects shaking via a vibration sensor.
- Controls LEDs (eyes and a red "terminator" LED) with random blinking and brightness changes.
- Includes Easter eggs (e.g., Terminator mode) triggered by specific sequences.

## Hardware
- Espruino board (ISKRA js)
- DFPlayer Mini MP3 module
- Accelerometer (using Amperka library)
- Vibration sensor (connected to a digital pin)
- LEDs (left eye, right eye, red LED)
- Speaker

## Pin Connections
Adjust the pin definitions in `main.js` according to your wiring. Example (for ISKRA js board):

| Component       | Pin  |
|-----------------|------|
| DFPlayer TX     | A0   |
| DFPlayer RX     | A1   |
| DFPlayer Busy   | P7   |
| Left LED        | P1   |
| Right LED       | P2   |
| Red LED         | P3   |
| Shake sensor    | A2   |
| I2C SDA         | SDA  |
| I2C SCL         | SCL  |

## File Structure
- `main.js` – Main logic, ties everything together.
- `dfplayer.js` – Library for DFPlayer Mini (based on [programbo/dfplayer](https://github.com/programbo/dfplayer)).
- `leds.js` – LED control with random effects.
- `accelerometer.js` – Accelerometer handling (orientation and shake detection).
- `trackSelector.js` – Random track selection with repeat avoidance and Easter eggs.

## License
The DFPlayer library in `dfplayer.js` is based on [programbo/dfplayer](https://github.com/programbo/dfplayer) 
original work Copyright (c) 2019 John Lombardo and is used under the MIT License.
The rest of the code is provided under the MIT license (see LICENSE file).

## Usage
1. Upload all `.js` files to your Espruino board (e.g., using the Espruino Web IDE).
2. Run `main.js`.
3. The head will play random sounds at intervals and react to movements.

## Easter Eggs
- After two repeated shakes, a special Easter egg track (#21-25) is played.
- Track #21 activates "Terminator mode" (red LED on, eyes off) until the track finishes.
