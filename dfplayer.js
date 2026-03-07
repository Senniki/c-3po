/**
 * DFPlayer Mini control library for Espruino
 * Based on https://github.com/programbo/dfplayer/blob/master/index.js
 * Original work Copyright (c) 2019 John Lombardo
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Constants
const START_BYTE = 0x7e;
const END_BYTE = 0xef;
const VERSION_BYTE = 0xff;
const DATA_LENGTH = 0x06;

// Command set
const Command = {
  Next: 1,
  Previous: 2,
  SetTrack: 3,
  IncreaseVolume: 4,
  DecreaseVolume: 5,
  SetVolume: 6,
  SetEQ: 7,
  SetMode: 8,
  SetSource: 9,
  Standby: 10,
  Resume: 11,
  Reset: 12,
  Play: 13,
  Pause: 14,
  SetFolder: 15,
  SetGain: 16,
  RepeatPlay: 17,
  QueryStatus: 66,
  QueryVolume: 67,
  QueryEQ: 68,
  QueryMode: 69,
  QuerySoftwareVersion: 70,
  QueryTotalFilesOnTFCard: 71,
  QueryTotalFilesOnUDisk: 72,
  QueryTotalFilesOnFlash: 73,
  QueryCurrentTrackOnTFCard: 75,
  QueryCurrentTrackOnUDisk: 76,
  QueryCurrentTrackOnFlash: 77
};

// EQ modes
const EQ = {
  Normal: 0,
  Pop: 1,
  Rock: 2,
  Jazz: 3,
  Classic: 4,
  Bass: 5
};

// Play modes
const Mode = {
  Repeat: 0,
  FolderRepeat: 1,
  SingleRepeat: 2,
  Random: 3
};

// Sources
const Source = {
  U: 0,
  TF: 1,
  AUX: 2,
  Sleep: 3,
  Flash: 4
};

function getHighByte(checksum) { return checksum >> 8; }
function getLowByte(checksum) { return checksum & 0xff; }
function toBytes(value) { return [getHighByte(value), getLowByte(value)]; }
function calculateChecksum(command, p1, p2, ack) {
  return -(VERSION_BYTE + DATA_LENGTH + command + ack + p1 + p2);
}
function parseByte(byte) {
  var value = parseInt(byte, 16);
  return byte + " (" + value + ")";
}

// Create MP3 controller instance
function createMP3(serial, options) {
  var ack = options.rx ? 0x01 : 0x00; // ACK enabled if RX pin is used

  function sendCommand(command, value) {
    if (value === undefined) value = 0;
    var _a = toBytes(value), p1 = _a[0], p2 = _a[1];
    var checksum = calculateChecksum(command, p1, p2, ack);
    var payload = [
      START_BYTE,
      VERSION_BYTE,
      DATA_LENGTH,
      command,
      ack,
      p1,
      p2,
      getHighByte(checksum),
      getLowByte(checksum),
      END_BYTE,
    ];
    serial.write(payload);
  }

  var mp3 = {
    playNext: function() { sendCommand(Command.Next); },
    playPrevious: function() { sendCommand(Command.Previous); },
    increaseVolume: function() { sendCommand(Command.IncreaseVolume); },
    decreaseVolume: function() { sendCommand(Command.DecreaseVolume); },
    volume: function(volume) {
      if (typeof volume !== 'undefined') {
        sendCommand(Command.SetVolume, volume);
      } else {
        sendCommand(Command.QueryVolume);
      }
    },
    eq: function(genre) {
      if (typeof genre !== 'undefined') {
        sendCommand(Command.SetEQ, genre);
      } else {
        sendCommand(Command.QueryEQ);
      }
      // Extra call preserved from original code
      if (typeof genre !== 'undefined') {
        sendCommand(Command.SetEQ, genre);
      }
    },
    mode: function(mode) {
      if (typeof mode !== 'undefined') {
        sendCommand(Command.SetMode, mode);
      } else {
        sendCommand(Command.QueryMode);
      }
    },
    setSource: function(source) { sendCommand(Command.SetSource, source); },
    standby: function() { sendCommand(Command.Standby); },
    resume: function() { sendCommand(Command.Resume); },
    reset: function() { sendCommand(Command.Reset); },
    play: function(trackNumber) {
      if (typeof trackNumber !== 'undefined') {
        sendCommand(Command.SetTrack, trackNumber);
      } else {
        sendCommand(Command.Play);
      }
    },
    pause: function() { sendCommand(Command.Pause); },
    setPlaybackFolder: function(folder) {
      var f = Math.max(1, Math.min(10, folder));
      sendCommand(Command.SetFolder, f);
    },
    setGain: function(gain) {
      var g = Math.max(0, Math.min(31, gain));
      sendCommand(Command.SetGain, g);
    },
    setRepeat: function(repeat) {
      if (repeat === undefined) repeat = false;
      sendCommand(Command.RepeatPlay, Number(repeat));
    },
    getStatus: function() { sendCommand(Command.QueryStatus); },
    getSoftwareVersion: function() { sendCommand(Command.QuerySoftwareVersion); },
    getTotalFilesOnTFCard: function() { sendCommand(Command.QueryTotalFilesOnTFCard); },
    getTotalFilesOnUDisk: function() { sendCommand(Command.QueryTotalFilesOnUDisk); },
    getTotalFilesOnFlash: function() { sendCommand(Command.QueryTotalFilesOnFlash); },
    getCurrentTrackOnTFCard: function() { sendCommand(Command.QueryCurrentTrackOnTFCard); },
    getCurrentTrackOnUDisk: function() { sendCommand(Command.QueryCurrentTrackOnUDisk); },
    getCurrentTrackOnFlash: function() { sendCommand(Command.QueryCurrentTrackOnFlash); }
  };

  return mp3;
}

// Exports
exports.createMP3 = createMP3;
exports.Command = Command;
exports.EQ = EQ;
exports.Mode = Mode;
exports.Source = Source;
exports.parseByte = parseByte;