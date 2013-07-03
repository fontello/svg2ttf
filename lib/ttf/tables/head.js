'use strict';

var utils = require('../../utils');

function fill(buf, font) {
  var position = utils.getPosition(buf);
  utils.writeNum(buf, 0x10000, 4, true); //version
  utils.writeNum(buf, 0, 4, true); //fontRevision
  utils.writeNum(buf, 0, 4, true);
  utils.writeNum(buf, 0x5F0F3CF5, 4); //magicNumber
  utils.writeNum(buf, 0x1011, 2); //flags
  utils.writeNum(buf, font.unitsPerEm || 1000, 2); //unitsPerEm
  utils.writeDate(buf, font.createdDate || new Date()); //created
  utils.writeDate(buf, font.modifiedDate || new Date()); //modified
  utils.writeNum(buf, font.xMin || 0, 2, true); //xMin
  utils.writeNum(buf, font.yMin || -151, 2, true); //yMin
  utils.writeNum(buf, font.xMax || 1064, 2, true); //xMax
  utils.writeNum(buf, font.yMax || 850, 2, true); //yMax
  utils.writeNum(buf, font.macStyle || 0, 2); //macStyle
  utils.writeNum(buf, font.lowestRecPPEM || 1, 2); //lowestRecPPEM
  utils.writeNum(buf, 2, 2, true); //fontDirectionHint
  utils.writeNum(buf, 1, 2, true); //indexToLocFormat
  utils.writeNum(buf, 0, 2, true); //glyphDataFormat
  console.log("Head is filled");
  return {pos: position, length: utils.getPosition(buf) - position};
}

module.exports.fillHead = fill;