/**
 * Main control logic for C-3PO head.
 * Integrates MP3 player, LEDs, accelerometer, and track selection.
 */

// Pin definitions (adjust according to your wiring)
var pins = {
  mp3Tx: A0,
  mp3Rx: A1,
  mp3Busy: P7,
  leftLed: P1,
  rightLed: P2,
  redLed: P3,
  shakeSensor: A2
};

// I2C for accelerometer
I2C1.setup({ sda: SDA, scl: SCL, bitrate: 400000 });

// Load modules
var dfplayer = require('dfplayer');
var leds = require('leds');
var accelerometer = require('accelerometer');
var trackSelector = require('trackSelector');

// Setup serial for DFPlayer
var serial = Serial4;
serial.setup(9600, { tx: pins.mp3Tx, rx: pins.mp3Rx });

// Create MP3 controller
var mp3 = dfplayer.createMP3(serial, { tx: pins.mp3Tx, rx: pins.mp3Rx });

// Create LED controller
var ledController = leds.createLEDs({
  left: pins.leftLed,
  right: pins.rightLed,
  red: pins.redLed
});

// Create accelerometer controller
var accel = accelerometer.createAccelerometer(I2C1, {
  axis: 'z',
  shakePin: pins.shakeSensor,
  shakeThreshold: 3,
  maxShakeInterval: 2
});

// Create track selector
var selector = trackSelector.createTrackSelector();

// Buffer for incoming serial data from DFPlayer
var buffer = '';

// Handle DFPlayer responses (to detect end of track for Terminator mode)
serial.on('data', function(data) {
  buffer += data;
  while (buffer.length >= 10) {
    var packet = buffer
      .slice(0, 10)
      .split('')
      .map(function(x) {
        return (256 + x.charCodeAt(0))
          .toString(16)
          .substr(-2)
          .toUpperCase();
      });
    // Specific packet, turn off Terminator mode
    if (packet[3] == '3D' && packet[4] == '00' && packet[6] == '15') {
      ledController.terminatorModeOff();
    }
    buffer = buffer.slice(10);
  }
});

// Play random track based on state
function playRandomTrack(state) {
  if (digitalRead(pins.mp3Busy) === 1) {
    var trackNumber = selector.getTrackNumber(state);
    if (trackNumber === 21) {
      // Easter egg: turn on Terminator mode, and then play track
      ledController.terminatorModeOn();
      setTimeout(function() {
        mp3.play(trackNumber);
      }, 300);
    } else {
      mp3.play(trackNumber);
    }
  }
}

// Connect accelerometer event handlers
accel.onShake(function() {
  playRandomTrack('SHAKE');
});
accel.onUp(function() {
  playRandomTrack('UP');
});
accel.onDown(function() {
  playRandomTrack('DOWN');
});

// Start accelerometer monitoring
accel.startMonitoring(1000);

// Run random LED effects
ledController.startRandomEffects();

// Periodic playback of tracks in NORMAL state
setInterval(function() {
  playRandomTrack('NORMAL');
}, getRandomNumber(40000, 90000));

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

print('C-3PO head initialized');