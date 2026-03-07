/**
 * LED control module for C-3PO head
 * Manages left, right, and red LEDs with random blinking and brightness changes.
 */

function createLEDs(pins) {
  var leftLed = require('@amperka/led').connect(pins.left);
  var rightLed = require('@amperka/led').connect(pins.right);
  var redLed = require('@amperka/led').connect(pins.red);

  var blinkRandom = null;
  var rightBrightnessTimer = null;
  var leftBrightnessTimer = null;

  function blinkRightRandomly() {
    var rand = Math.random();
    if (rand > 0.5) {
      var onTime = Math.random() * 1.4;
      var offTime = Math.random() * 0.8;
      rightLed.blink(onTime, offTime);
    }
    blinkRandom = setTimeout(blinkRightRandomly, Math.random() * 1000);
  }

  function changeRightBrightnessRandomly() {
    var rand = Math.random();
    if (rand > 0.5) {
      var brightness = Math.random() * (0.9 - 0.4) + 0.4;
      rightLed.brightness(brightness);
    }
    rightBrightnessTimer = setTimeout(changeRightBrightnessRandomly, Math.random() * 2000);
  }

  function changeLeftBrightnessRandomly() {
    var rand = Math.random();
    if (rand > 0.5) {
      var brightness = Math.random() * (0.9 - 0.4) + 0.4;
      leftLed.brightness(brightness);
    }
    leftBrightnessTimer = setTimeout(changeLeftBrightnessRandomly, Math.random() * 5000);
  }

  function terminatorModeOn() {
    clearTimeout(blinkRandom);
    clearTimeout(rightBrightnessTimer);
    clearTimeout(leftBrightnessTimer);
    rightLed.turnOff();
    leftLed.turnOff();
    redLed.turnOn();
  }

  function terminatorModeOff() {
    setTimeout(function() {
      redLed.turnOff();
      leftLed.turnOn();
      rightLed.turnOn();
      leftLed.brightness(1);
      rightLed.brightness(1);
      blinkRightRandomly();
      changeRightBrightnessRandomly();
      changeLeftBrightnessRandomly();
    }, 400);
  }

  function startRandomEffects() {
    // Initial state
    redLed.turnOff();
    rightLed.turnOn();
    leftLed.turnOn();
    rightLed.brightness(1);
    leftLed.brightness(1);
    // Start loops
    blinkRightRandomly();
    changeRightBrightnessRandomly();
    changeLeftBrightnessRandomly();
  }

  return {
    terminatorModeOn: terminatorModeOn,
    terminatorModeOff: terminatorModeOff,
    startRandomEffects: startRandomEffects
  };
}

exports.createLEDs = createLEDs;