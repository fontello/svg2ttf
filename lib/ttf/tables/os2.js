'use strict';

//get first glyph unicode
function getFirstCharIndex(font) {
  return (font.glyphs.length > 0 && font.glyphs[0].unicode <= 0xFFFF) ? font.glyphs[0].unicode : 0;
}

//get last glyph unicode
function getLastCharIndex(font) {
  return (font.glyphs.length > 0 && font.glyphs[font.glyphs.length - 1].unicode <= 0xFFFF) ? font.glyphs[font.glyphs.length - 1].unicode : 0;
}

function createOS2Table(buf, font) {

  buf.writeUInt16(1); //version
  buf.writeInt16(1031); // xAvgCharWidth
  buf.writeUInt16(400); // usWeightClass
  buf.writeUInt16(5); // usWidthClass
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
  buf.writeUInt8(2); // panose.bFamilyType
  buf.writeUInt8(2); // panose.bSerifStyle
  buf.writeUInt8(5); // panose.bWeight
  buf.writeUInt8(3); // panose.bProportion
  buf.writeUInt8(0); // panose.bContrast
  buf.writeUInt8(0); // panose.bStrokeVariation
  buf.writeUInt8(0); // panose.bArmStyle
  buf.writeUInt8(0); // panose.bLetterform
  buf.writeUInt8(0); // panose.bMidline
  buf.writeUInt8(0); // panose.bXHeight
  buf.writeUInt32(0); // ulUnicodeRange1
  buf.writeUInt32(0); // ulUnicodeRange2
  buf.writeUInt32(0); // ulUnicodeRange3
  buf.writeUInt32(0); // ulUnicodeRange4
  buf.writeUInt32(0x506645644); // achVendID, equal to PfEd
  buf.writeUInt16(0x40); // fsSelection
  buf.writeUInt16(getFirstCharIndex(font)); // usFirstCharIndex
  buf.writeUInt16(getLastCharIndex(font)); // usLastCharIndex
  buf.writeInt16(font.ascent || 850); // sTypoAscender
  buf.writeInt16(font.descent || -151); // sTypoDescender
  buf.writeInt16(font.lineGap || -90); // lineGap
  buf.writeInt16(850); // usWinAscent
  buf.writeInt16(151); // usWinDescent
  buf.writeInt32(1); // ulCodePageRange1
  buf.writeInt32(0); // ulCodePageRange2
}

module.exports = createOS2Table;