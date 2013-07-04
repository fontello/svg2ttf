'use strict';

var _ = require('lodash');
var jDataView = require('jDataView');
var createCMapTable = require('ttf/tables/cmap.js');
var createGlyfTable = require('ttf/tables/glyf.js');
var createHeadTable = require('ttf/tables/head.js');
var createHHeadTable = require('ttf/tables/hhea.js');
var createHtmxTable = require('ttf/tables/hmtx.js');
var createLocaTable = require('ttf/tables/loca.js');
var createMaxpTable = require('ttf/tables/maxp.js');
var createNameTable = require('ttf/tables/name.js');
var createPostTable = require('ttf/tables/post.js');
var createOS2Table = require('ttf/tables/os2.js');

// Tables
var TABLES = [
  { name: 'cmap', create: createCMapTable },
  { name: 'glyf', create: createGlyfTable },
  { name: 'head', create: createHeadTable },
  { name: 'hhea', create: createHHeadTable },
  { name: 'hmtx', create: createHtmxTable },
  { name: 'loca', create: createLocaTable },
  { name: 'maxp', create: createMaxpTable },
  { name: 'name', create: createNameTable },
  { name: 'post', create: createPostTable },
  { name: 'OS/2', create: createOS2Table }
];

// Various constants
var CONST = {
  VERSION: 0x10000,
  TABLE_COUNT: 10
};

//encodes 4-byte string to long integer
function getInnerName(name) {
  return name[3] * 0x1000000 + name[2] * 0x10000 + name[1] * 0x100 + name[0];
}

function writeTableHeader(buf, name, checkSum, offset, length) {
  buf.writeUInt32(getInnerName(name)); //inner name
  buf.writeUInt32(checkSum || 0); //checksum
  buf.writeUInt32(offset || 0); //offset
  buf.writeUInt32(length || 0); //length
}

function getBufSize(font) {
  console.log(font);
  return 0;
}

function createTTF(font) {

  var bufSize = getBufSize(font);
  var buf = new jDataView(bufSize);

  var entrySelector = Math.floor(Math.log(CONST.TABLE_COUNT, 2));
  var searchRange = Math.pow(2, entrySelector) * 16;
  var rangeShift = CONST.TABLE_COUNT * 16;
  // Add TTF header
  buf.writeUInt32(CONST.VERSION);
  buf.writeUInt16(CONST.TABLE_COUNT);
  buf.writeUInt16(searchRange);
  buf.writeUInt16(entrySelector);
  buf.writeUInt16(rangeShift);

  // Add table headers
  var tableHeaderOffset = buf.tell();
  _.forEach(TABLES, function(table) {
    writeTableHeader(buf, table.name);
  });

  // Add tables
  var tableOffsets = [];
  _.forEach(TABLES, function(table) {
    tableOffsets.push(buf.tell());
    table.create(buf, font);
  });

  // Fill headers again with actual info
  var i = 0;
  buf.seek(tableHeaderOffset);
  _.forEach(TABLES, function(table) {
    writeTableHeader(buf, table, 0, tableOffsets[i], tableOffsets[i + 1] - tableOffsets[i]);
  });

  return buf.buffer;
}

module.exports = createTTF;
