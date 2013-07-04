'use strict';

var jDataView = require('jDataView');

//get first glyph unicode
function getFirstCharIndex(font) {
  return (font.glyphs.length > 0 && font.glyphs[0].unicode <= 0xFFFF) ? font.glyphs[0].unicode : 0;
}

//get last glyph unicode
function getLastCharIndex(font) {
  return (font.glyphs.length > 0 && font.glyphs[font.glyphs.length - 1].unicode <= 0xFFFF) ? font.glyphs[font.glyphs.length - 1].unicode : 0;
}

function createOS2Table(font) {

  var buf = new jDataView(10 + 24 * 2 + 7 * 4); // fixed table length

  buf.writeUint16(1); //version
  buf.writeInt16(1031); // xAvgCharWidth
  buf.writeUint16(400); // usWeightClass
  buf.writeUint16(5); // usWidthClass
  buf.writeInt16(8); // fsType
  buf.writeInt16(650); // ySubscriptXSize
  buf.writeInt16(700); //ySubscriptYSize
  buf.writeInt16(0); // ySubscriptXOffset
  buf.writeInt16(140); // ySubscriptYOffset
  buf.writeInt16(650); // ySuperscriptXSize
  buf.writeInt16(700); // ySuperscriptYSize
  buf.writeInt16(0); // ySuperscriptXOffset
  buf.writeInt16(480); // ySuperscriptYOffset
  buf.writeInt16(49); // yStrikeoutSize
  buf.writeInt16(258); // yStrikeoutPosition
  buf.writeInt16(0); // sFamilyClass
  buf.writeUint8(2); // panose.bFamilyType
  buf.writeUint8(2); // panose.bSerifStyle
  buf.writeUint8(5); // panose.bWeight
  buf.writeUint8(3); // panose.bProportion
  buf.writeUint8(0); // panose.bContrast
  buf.writeUint8(0); // panose.bStrokeVariation
  buf.writeUint8(0); // panose.bArmStyle
  buf.writeUint8(0); // panose.bLetterform
  buf.writeUint8(0); // panose.bMidline
  buf.writeUint8(0); // panose.bXHeight
  buf.writeUint32(0); // ulUnicodeRange1
  buf.writeUint32(0); // ulUnicodeRange2
  buf.writeUint32(0); // ulUnicodeRange3
  buf.writeUint32(0); // ulUnicodeRange4
  buf.writeUint32(0x50664564); // achVendID, equal to PfEd
  buf.writeUint16(0x40); // fsSelection
  buf.writeUint16(getFirstCharIndex(font)); // usFirstCharIndex
  buf.writeUint16(getLastCharIndex(font)); // usLastCharIndex
  buf.writeInt16(font.ascent || 850); // sTypoAscender
  buf.writeInt16(font.descent || -151); // sTypoDescender
  buf.writeInt16(font.lineGap || -90); // lineGap
  buf.writeInt16(850); // usWinAscent
  buf.writeInt16(151); // usWinDescent
  buf.writeInt32(1); // ulCodePageRange1
  buf.writeInt32(0); // ulCodePageRange2

  return buf;
}

module.exports = createOS2Table;
