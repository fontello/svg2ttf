'use strict';

function createHHeadTable(buf, font) {
  buf.writeInt32(0x10000); // version
  buf.writeInt16(font.ascent || 850); // ascent
  buf.writeInt16(font.descend || -151); // descend
  buf.writeInt16(font.lineGap || -90); // lineGap
  buf.writeUInt16(font.advanceWidthMax || -90); // advanceWidthMax
  buf.writeInt16(font.minLeftSideBearing || -90); // minLeftSideBearing
  buf.writeInt16(font.minRightSideBearing || -90); // minRightSideBearing
  buf.writeInt16(font.xMaxExtent || -90); // xMaxExtent
  //TODO: dump value used, check correct value
  buf.writeInt16(1); // caretSlopeRise
  //TODO: dump value used, check correct value
  buf.writeInt16(0); // caretSlopeRun
  buf.writeUInt32(0); // reserved1
  buf.writeUInt32(0); // reserved2
  buf.writeUInt16(0); // reserved3
  buf.writeInt16(0); // metricDataFormat
  buf.writeUInt16(1); // numberOfHMetrics
}

module.exports = createHHeadTable;
