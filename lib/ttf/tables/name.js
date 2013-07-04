'use strict';

var _ = require('lodash');
var jDataView = require('jDataView');

var TTF_NAMES = {
  COPYRIGHT: 0,
  FONT_FAMILY: 1,
  ID: 3
};

function getBufSize(names) {
  var result = 6; // table header
  _.forEach(names, function (name) {
    result += 6 * 2 + name.data.length; //name header and data
  });
  return result;
}

function getStringAsByteArray(name) {
  var bytes = [];
  for (var i = 0; i < name.length; i++) {
    var char = name.charCodeAt(i);
    if (char < 256) {
      bytes.push(0);
      bytes.push(char);
    } else {
      /*jshint bitwise: false*/
      bytes.push(char >>> 8);
      bytes.push(char & 0xFF);
    }
  }
  return bytes;
}

// Collect font names
function getNames(font) {
  var result = [];
  if (font.copyright) {
    result.push({ data: getStringAsByteArray(font.copyright), id: TTF_NAMES.COPYRIGHT});
  }
  if (font.id) {
    result.push({ data: getStringAsByteArray(font.id), id: TTF_NAMES.ID});
  }
  if (font.familyName) {
    result.push({ data: getStringAsByteArray(font.familyName), id: TTF_NAMES.FONT_FAMILY});
  }
  return result;
}

function createNameTable(font) {

  var names = getNames(font);

  var bufSize = getBufSize(names);
  var buf = new jDataView(bufSize);

  buf.writeUint16(0); // formatSelector
  buf.writeUint16(names.length); // nameRecordsCount
  var offsetPosition = buf.tell();
  buf.writeUint16(0); // offset, will be filled later
  var nameOffset = 0;
  _.forEach(names, function (name) {
    buf.writeUint16(3); // platformID
    buf.writeUint16(1); // platEncID
    buf.writeUint16(0x0409); // languageID, English (USA)
    buf.writeUint16(name.id); // nameID
    buf.writeUint16(name.data.length); // reclength
    buf.writeUint16(nameOffset); // offset
    nameOffset += name.data.length;
  });
  var actualStringDataOffset = buf.tell();
  //Array of bytes with actual string data
  _.forEach(names, function (name) {
    buf.writeBytes(name.data);
  });

  //write actual string data offset
  buf.seek(offsetPosition);
  buf.writeUint16(actualStringDataOffset); // offset

  return buf;
}

module.exports = createNameTable;
