/**
 * Track selection module for C-3PO head.
 * Manages random track numbers with repeat avoidance and Easter egg logic.
 */

function createTrackSelector() {
  var previousNumbers = {};
  var repeatsCount = 0;

  function getNumberFor(type, min, max) {
    if (!previousNumbers[type]) {
      previousNumbers[type] = NaN;
    }
    return function() {
      var value = Math.floor(Math.random() * (max - min + 1)) + min;
      while (value === previousNumbers[type] && repeatsCount < 2) {
        if (type === 'SHAKE') {
          repeatsCount++;
        }
        value = Math.floor(Math.random() * (max - min + 1)) + min;
      }
      if (repeatsCount === 2 && type === 'SHAKE') {
        previousNumbers[type] = NaN;
        repeatsCount = 0;
        // Return Easter egg number
        return getNumberFor('EASTER', 21, 25)();
      } else {
        previousNumbers[type] = value;
      }
      return value;
    };
  }

  var getNumberForNormal = getNumberFor('NORMAL', 1, 5);
  var getNumberForUp = getNumberFor('UP', 6, 10);
  var getNumberForDown = getNumberFor('DOWN', 11, 15);
  var getNumberForShake = getNumberFor('SHAKE', 16, 20);
  var getNumberForEaster = getNumberFor('EASTER', 21, 25);

  function getTrackNumber(state) {
    switch (state) {
      case 'UP': return getNumberForUp();
      case 'DOWN': return getNumberForDown();
      case 'SHAKE': return getNumberForShake();
      case 'EASTER': return getNumberForEaster();
      default: return getNumberForNormal();
    }
  }

  return {
    getTrackNumber: getTrackNumber
  };
}

exports.createTrackSelector = createTrackSelector;