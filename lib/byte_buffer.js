//
// Light version of byte buffer
//

'use strict';

var ByteBuffer = function (length) {
  /*jshint bitwise:false*/
  /* global Uint8Array */

  // use Uint8Array if possible
  if (Uint8Array) {
    this.buffer = new Uint8Array(length);
  }
  else {
    this.buffer = new Array(length);
  }

  this.byteLength = length;
  this.offset = 0;

  // get current position
  //
  this.tell = function() {
    return this.offset;
  };

  // set current position
  //
  this.seek = function(pos) {
    this.offset = pos;
  };


  this.getUint8 = function(pos) {
    return this.buffer[pos];
  };


  this.getUint32 = function(pos) {
    var val = this.buffer[pos + 1] << 16;
    val |= this.buffer[pos + 2] << 8;
    val |= this.buffer[pos + 3];
    val = val + (this.buffer[pos] << 24 >>> 0);
    return val;
  };


  this.writeInt8 = function(value) {
    this.writeUint8((value < 0) ? 0xFF + value + 1 : value);
  };


  this.writeInt16 = function(value) {
    this.writeUint16((value < 0) ? 0xFFFF + value + 1 : value);
  };


  this.writeInt32 = function(value) {
    this.writeUint32((value < 0) ? 0xFFFFFFFF + value + 1 : value);
  };


  this.setUint32 = function(pos, value) {
    this.offset = pos;
    this.writeUint32(value);
  };


  this.writeUint8 = function(value) {
    this.buffer[this.offset] = value & 0xFF;
    this.offset++;
  };


  this.writeUint16 = function(value) {
    this.buffer[this.offset] = (value >>> 8) & 0xFF;
    this.buffer[this.offset + 1] = value & 0xFF;
    this.offset += 2;
  };


  this.writeUint32 = function(value) {
    this.buffer[this.offset] = (value >>> 24) & 0xFF;
    this.buffer[this.offset + 1] = (value >>> 16) & 0xFF;
    this.buffer[this.offset + 2] = (value >>> 8) & 0xFF;
    this.buffer[this.offset + 3] = value & 0xFF;
    this.offset += 4;
  };


  this.writeUint64 = function(value) {
    // we canot use bitwise operations for 64bit values because of JavaScript limitations,
    // instead we should divide it to 2 Int32 numbers
    // 2^32 = 4294967296
    var hi = Math.floor(value / 4294967296);
    var lo = value - hi * 4294967296;
    this.writeUint32(hi);
    this.writeUint32(lo);
  };

  this.writeBytes = function(data) {
    var buffer = this.buffer;
    var offset = this.offset;
    for (var i = 0; i < data.length; i++) {
      buffer[i + offset] = data[i];
    }
    this.offset += data.length;
  };
};

module.exports = ByteBuffer;