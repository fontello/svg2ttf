'use strict';

function dateToUInt64(date) {
  console.log(date); // just a stub for now
  return 0;
}

function createHeadTable(buf, font) {
  buf.writeInt32(0x10000); // version
  buf.writeInt32(0); // fontRevision
  buf.writeUInt32(0); // checkSumAdjustment
  buf.writeUInt32(0x5F0F3CF5); // magicNumber
  buf.writeUInt16(0x1011); // flags
  buf.writeUInt16(font.unitsPerEm || 1000); // unitsPerEm
  buf.writeUInt64(dateToUInt64(font.createdDate || new Date())); // created
  buf.writeUInt64(dateToUInt64(font.modifiedDate || new Date())); // modified
  buf.writeInt16(font.xMin || 0); // xMin
  buf.writeInt16(font.yMin || -151); // yMin
  buf.writeInt16(font.xMax || 1064); // xMax
  buf.writeInt16(font.yMax || 850); // yMax
  buf.writeUInt16(font.macStyle || 0); //macStyle
  buf.writeUInt16(font.lowestRecPPEM || 1); // lowestRecPPEM
  // TODO: check correct value
  buf.writeUInt16(2); // fontDirectionHint
  buf.writeInt16(1); // indexToLocFormat
  buf.writeUInt16(0); // glyphDataFormat
}

module.exports = createHeadTable;