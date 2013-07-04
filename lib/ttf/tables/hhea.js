'use strict';

var jDataView = require('jDataView');

function createHHeadTable(font) {

  var buf = new jDataView(12 * 2 + 3 * 4); // fixed table length

  buf.writeInt32(0x10000); // version
  buf.writeInt16(font.ascent || 850); // ascent
  buf.writeInt16(font.descend || -151); // descend
  buf.writeInt16(font.lineGap || 90); // lineGap
  buf.writeUint16(font.advanceWidthMax || 1063); // advanceWidthMax
  buf.writeInt16(font.minLeftSideBearing || 0); // minLeftSideBearing
  buf.writeInt16(font.minRightSideBearing || -1); // minRightSideBearing
  buf.writeInt16(font.xMaxExtent || 1064); // xMaxExtent
  //TODO: dump value used, check correct value
  buf.writeInt16(1); // caretSlopeRise
  //TODO: dump value used, check correct value
  buf.writeInt16(0); // caretSlopeRun
  buf.writeUint32(0); // reserved1
  buf.writeUint32(0); // reserved2
  buf.writeUint16(0); // reserved3
  buf.writeInt16(0); // metricDataFormat
  buf.writeUint16(font.glyphs.length); // numberOfHMetrics

  return buf;
}

module.exports = createHHeadTable;
