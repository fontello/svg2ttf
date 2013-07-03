'use strict';

function getPosition(buf) {
  return buf.tell();
}

function setPosition(buf, pos) {
  return buf.seek(pos);
}

//write single value to buffer
function writeNum(buf, value, length, signed) {
  var position = getPosition(buf);
  if (value == undefined)
    value = 0;
  switch (length) {
    case 1:
      signed ? buf.writeInt8(value) : buf.writeUint8(value);
      break;
    case 2:
      signed ? buf.writeInt16(value) : buf.writeUint16(value);
      break;
    case 4:
      signed ? buf.writeInt32(value) : buf.writeUint32(value);
      break;
    case 8:
      signed ? buf.writeInt64(value) : buf.writeUint64(value);
      break;
  }
  return position;
}

function writeDate(buf, value) {
  //just a stub for now
  return writeNum(buf, 0, 8, false);
}

function writeString(buf, pascalMode) {

}

module.exports.write = write;