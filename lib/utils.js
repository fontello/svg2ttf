'use strict';

function getPosition(buf) {
  return buf.tell();
}

function setPosition(buf, pos) {
  return buf.seek(pos);
}

// write single value to buffer
function writeNum(buf, value, length, signed) {
  var position = getPosition(buf);
  if (value === undefined) {
    value = 0;
  }
  switch (length) {
  case 1:
    if (signed) {
      buf.writeInt8(value);
    } else {
      buf.writeUint8(value);
    }
    break;
  case 2:
    if (signed) {
      buf.writeInt16(value);
    } else {
      buf.writeUint16(value);
    }
    break;
  case 4:
    if (signed) {
      buf.writeInt32(value);
    } else {
      buf.writeUint32(value);
    }
    break;
  case 8:
    if (signed) {
      buf.writeInt64(value);
    } else {
      buf.writeUint64(value);
    }
    break;
  }
  return position;
}

function writeDate(buf, value) {
  // just a stub for now
  console.log(value);
  return writeNum(buf, 0, 8, false);
}

module.exports.getPosition = getPosition;
module.exports.setPosition = setPosition;
module.exports.writeNum = writeNum;
module.exports.writeDate = writeDate;