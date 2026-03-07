/**
 * Accelerometer module for detecting orientation (UP/DOWN) and shakes.
 * Uses Amperka accelerometer module and Arduino tilt sensor.
 */

function createAccelerometer(i2c, options) {
  var accel = require('@amperka/accelerometer').connect(i2c);
  accel.init();

  var axis = options.axis || 'z';
  var prevAxisValue = NaN;
  var shakeCallbacks = [];
  var upCallbacks = [];
  var downCallbacks = [];

  // Shake detection vars
  var lastSensorVal = 0;
  var lastShakeTime = 0;
  var shakeCount = 0;
  var shakeThreshold = options.shakeThreshold || 3;
  var maxShakeInterval = options.maxShakeInterval || 2;
  var shakePin = options.shakePin;

  function onShake(callback) {
    shakeCallbacks.push(callback);
  }
  function onUp(callback) {
    upCallbacks.push(callback);
  }
  function onDown(callback) {
    downCallbacks.push(callback);
  }

  // Read shake sensor
  function readShake() {
    if (shakePin === undefined) return;
    var sensorVal = digitalRead(shakePin);
    if (sensorVal !== lastSensorVal) {
      var currentTime = getTime();
      if (currentTime - lastShakeTime < maxShakeInterval) {
        shakeCount++;
      } else {
        shakeCount = 1;
      }
      if (shakeCount >= shakeThreshold) {
        // Trigger shake
        shakeCallbacks.forEach(function(cb) { cb(); });
        shakeCount = 0;
      }
      lastShakeTime = currentTime;
      lastSensorVal = sensorVal;
    }
  }

  // Check orientation
  function checkOrientation() {
    var currAxisValue = accel.read('G')[axis];
    if (currAxisValue > 0 && prevAxisValue <= 0) {
      upCallbacks.forEach(function(cb) { cb(); });
    } else if (currAxisValue <= 0 && prevAxisValue > 0) {
      downCallbacks.forEach(function(cb) { cb(); });
    }
    prevAxisValue = currAxisValue;
  }

  // Start periodic checks
  function startMonitoring(interval) {
    setInterval(readShake, interval || 1000);
    setInterval(checkOrientation, interval || 1000);
  }

  return {
    onShake: onShake,
    onUp: onUp,
    onDown: onDown,
    startMonitoring: startMonitoring,
    readShake: readShake,
    checkOrientation: checkOrientation
  };
}

exports.createAccelerometer = createAccelerometer;