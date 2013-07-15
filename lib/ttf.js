'use strict';

var _         = require('lodash');
var jDataView = require('jDataView');

var createCMapTable   = require('./ttf/tables/cmap');
var createGlyfTable   = require('./ttf/tables/glyf');
var createHeadTable   = require('./ttf/tables/head');
var createHHeadTable  = require('./ttf/tables/hhea');
var createHtmxTable   = require('./ttf/tables/hmtx');
var createLocaTable   = require('./ttf/tables/loca');
var createMaxpTable   = require('./ttf/tables/maxp');
var createNameTable   = require('./ttf/tables/name');
var createPostTable   = require('./ttf/tables/post');
var createOS2Table    = require('./ttf/tables/os2');

var utils = require('./ttf/utils');

// Tables
var TABLES = [
  { innerName: 0x636d6170, create: createCMapTable }, // cmap
  { innerName: 0x676c7966, create: createGlyfTable }, // glyf
  { innerName: 0x68656164, create: createHeadTable }, // head
  { innerName: 0x68686561, create: createHHeadTable }, // hhea
  { innerName: 0x686d7478, create: createHtmxTable }, // hmtx
  { innerName: 0x6c6f6361, create: createLocaTable }, // loca
  { innerName: 0x6d617870, create: createMaxpTable }, // maxp
  { innerName: 0x6e616d65, create: createNameTable }, // name
  { innerName: 0x706f7374, create: createPostTable }, // post
  { innerName: 0x4f532f32, create: createOS2Table } //OS/2
];

// Various constants
var CONST = {
  VERSION: 0x10000,
  TABLE_COUNT: 10
};

function writeTableHeader(buf, innerName, checkSum, offset, length) {
  buf.writeUint32(innerName); //inner name
  buf.writeUint32(checkSum || 0); //checksum
  buf.writeUint32(offset || 0); //offset
  buf.writeUint32(length || 0); //length
}

function generateTTF(font) {

  // Prepare TTF contours objects. Note, that while sfnt countours are classes,
  // ttf contours are just plain arrays of points
  _.forEach(font.glyphs, function(glyph) {
    glyph.ttfContours = _.map(glyph.contours, function(contour) {
      return contour.points;
    });
  });

  // Process ttf contours data
  _.forEach(font.glyphs, function(glyph) {

    // 0.3px accuracy is ok. fo 1000x1000.
    glyph.ttfContours = utils.simplify(glyph.ttfContours, 0.3);
    glyph.ttfContours = utils.simplify(glyph.ttfContours, 0.3); // one pass is not enougth

    // Interpolated points can be removed. 1.1px is acceptable
    // measure - it will give us 1px error after coordinates rounding.
    glyph.ttfContours = utils.interpolate(glyph.ttfContours, 1.1);

    glyph.ttfContours = utils.roundPoints(glyph.ttfContours);
    glyph.ttfContours = utils.toRelative(glyph.ttfContours);
  });

  // Add tables
  var tableLengths = [];
  var tableBuffers = [];
  var fullTablesLength = 0;
  _.forEach(TABLES, function (table) {
    //store each table in its own buffer
    var tableBuffer = table.create(font);
    tableBuffers.push(tableBuffer);
    tableLengths.push(tableBuffer.byteLength);
    fullTablesLength += tableLengths[tableLengths.length - 1];
  });

  //create TTF buffer
  var tablesDataOffset = 4 * 2 + 4 + 4 * 4 * TABLES.length; // TTF header plus table headers
  var buf = new jDataView(tablesDataOffset + fullTablesLength);

  //special constants
  var entrySelector = Math.floor(Math.log(CONST.TABLE_COUNT, 2));
  var searchRange = Math.pow(2, entrySelector) * 16;
  var rangeShift = CONST.TABLE_COUNT * 16;

  // Add TTF header
  buf.writeUint32(CONST.VERSION);
  buf.writeUint16(CONST.TABLE_COUNT);
  buf.writeUint16(searchRange);
  buf.writeUint16(entrySelector);
  buf.writeUint16(rangeShift);

  var i = 0;
  var offset = 0;
  _.forEach(TABLES, function (table) {
    writeTableHeader(buf, table.innerName, 0, tablesDataOffset + offset, tableLengths[i]);
    offset += tableLengths[i];
    i++;
  });

  _.forEach(tableBuffers, function (tableBuffer) {
    buf.writeBytes(tableBuffer.buffer);
  });

  return buf;
}

module.exports = generateTTF;
