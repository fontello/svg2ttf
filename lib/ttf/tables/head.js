'use strict';

var jDataView = require('jDataView');

function dateToUInt64(date) {
  var startDate = new Date(1904, 1, 1);
  return date - startDate;
}

function createHeadTable(font) {

  var buf = new jDataView(11 * 2 + 4 * 4 + 2 * 8); // fixed table length

  buf.writeInt32(0x10000); // version
  buf.writeInt32(0); // fontRevision
  buf.writeUint32(0); // checkSumAdjustment
  buf.writeUint32(0x5F0F3CF5); // magicNumber
  buf.writeUint16(0x1011); // flags
  buf.writeUint16(font.unitsPerEm || 1000); // unitsPerEm
  buf.writeUint64(dateToUInt64(font.createdDate || new Date())); // created
  buf.writeUint64(dateToUInt64(font.modifiedDate || new Date())); // modified
  buf.writeInt16(font.xMin || 0); // xMin
  buf.writeInt16(font.yMin || -151); // yMin
  buf.writeInt16(font.xMax || 1064); // xMax
  buf.writeInt16(font.yMax || 850); // yMax
  buf.writeUint16(font.macStyle || 0); //macStyle
  buf.writeUint16(font.lowestRecPPEM || 1); // lowestRecPPEM
  // TODO: check correct value
  buf.writeInt16(2); // fontDirectionHint
  buf.writeInt16(1); // indexToLocFormat
  buf.writeInt16(0); // glyphDataFormat

  return buf;
}

module.exports = createHeadTable;
