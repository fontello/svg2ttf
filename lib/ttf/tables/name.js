'use strict';

var _ = require('lodash');

var TTF_NAMES = {
  COPYRIGHT: 0,
  FONT_FAMILY: 1,
  ID: 3
};

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
    result.push({ data: getStringAsByteArray(font.copyRight), id: TTF_NAMES.COPYRIGHT});
  }
  if (font.id) {
    result.push({ data: getStringAsByteArray(font.id), id: TTF_NAMES.ID});
  }
  if (font.fontFamily) {
    result.push({ data: getStringAsByteArray(font.copyRight), id: TTF_NAMES.FONT_FAMILY});
  }
}

function fill(buf, font) {
  var names = getNames(font);
  buf.writeUInt16(0); // formatSelector
  buf.writeUInt16(names.length); // nameRecordsCount
  var offsetPosition = buf.tell();
  buf.writeUInt16(0); // offset, will be filled later
  var nameOffset = 0;
  _.forEach(names, function (name) {
    buf.writeUInt16(3); // platformID
    buf.writeUInt16(1); // platEncID
    buf.writeUInt16(0x0409); // languageID, English (USA)
    buf.writeUInt16(name.id); // nameID
    buf.writeUInt16(name.data.length); // reclength
    buf.writeUInt16(nameOffset); // offset
    nameOffset += name.data.length;
  });
  var actualStringDataOffset = buf.tell();
  //Array of bytes with actual string data
  _.forEach(names, function (name) {
    buf.writeBytes(name.data);
  });

  var savedPosition = buf.tell(); //save position to restore it later

  //write actual string data offset
  buf.seek(offsetPosition);
  buf.writeUInt16(actualStringDataOffset); // offset

  buf.seek(savedPosition); //restore previously saved position
}

module.exports.fillName = fill;