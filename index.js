/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6.html
 */

'use strict';

var _ = require('lodash');
var svg_font = require("./lib/svg_font");
var TTF = require("./lib/ttf");

var TTF_NAMES = {
  COPYRIGHT: 0,
  FONT_FAMILY: 1,
  ID: 3
}

//----------------conversion-----------------------------

function addGlyphMetrics(glyph, font, svgGlyph) {
  //just a stub now, draws rectangle
  glyph.numberOfContours = 1;
  glyph.xMin = 0;
  glyph.yMin = 0;
  glyph.xMax = svgGlyph.width;
  glyph.yMax = svgGlyph.height;
  glyph.endPtsOfContoursArray.add([4]); //four points
  glyph.flagsArray.add([1, 1, 1, 1, 1]); //not curves
  //each pair of coordinates is a vector from previous coordinate
  glyph.xCoordinatesArray.add([0, 0, 800, 0, - 800]);
  glyph.yCoordinatesArray.add([0, 800, 0, - 800, 0]);
}

function addGlyphElement(glyphTable, font, svgGlyph) {
  // just a stub for now
  var numberOfContours = 1;
  var glyph = glyphTable.glyfArray.createElement();
  addGlyphMetrics(glyph, font, svgGlyph);
  glyphTable.glyfArray.add(glyph);
  return glyph;
}

//TODO: should we process non-ascii names?
function getStringAsByteArray(name, isPascalFormat) {
  var bytes = [];
  if (isPascalFormat)
    bytes.push(name.length);
  for (var i = 0; i < name.length; i ++) {
    if (!isPascalFormat)
      bytes.push(0);
    bytes.push(name.charCodeAt(i));
  }
  return bytes;
}

function fillGlyphs(tables, font) {
  var glyphTable = tables.glyf;
  var locationTable = tables.location;
  var postTable = tables.post;
  postTable.numberOfGlyphs = font.glyphs.length + 1;
  //add misssed glyph
  locationTable.offsetsArray.add(0);
  postTable.glyphNameIndex.add(0); //.notDef
  var nameOffset = 258; //index offset to custom names
  var offset = addGlyphElement(glyphTable, font, font.missedGlyph).length;

  _.forEach(font.glyphs, function (glyph) {
    //add offset
    locationTable.offsetsArray.add(offset);
    //add glyph
    offset += addGlyphElement(glyphTable, font, glyph).length;
    //add name
    postTable.names.add(getStringAsByteArray(glyph.name, true));
    postTable.glyphNameIndex.add(nameOffset ++);
  });
  locationTable.offsetsArray.add(offset);
}

function fillCmap(cmapTable, glyphs, glyphSegments) {
  //fill table 0
  var subTable0 = cmapTable.subTable0.value[0];
  if (glyphs.length > 0) {
    var i = 1;
    _.forEach(glyphs, function (glyph) {
      if (glyph.unicode < 256) {
        subTable0.glyphIdArray.value[glyph.unicode] = i;
        i ++;
      }
    });
  }
  //for all subtables we should serialize its length
  //it must be done after subtable is filled
  subTable0.stLength = subTable0.length;

  //fill table 4
  var subTable4 = cmapTable.subTable4.value[0];
  if (glyphSegments.length > 0) {
    //calculate segment offsets
    var prevEndCode = 0;
    var prevDelta = - 1;
    var segCount = 1;
    _.forEach(glyphSegments, function (glyphSegment) {
      if (glyphSegment.start.unicode <= 0xFFFF) {
        subTable4.startCountArray.add(glyphSegment.start.unicode);
        subTable4.endCountArray.add(glyphSegment.end.unicode < 0xFFFF ? glyphSegment.end.unicode : 0xFFFF);
        var delta = prevEndCode - glyphSegment.start.unicode + prevDelta + 1;
        subTable4.idDeltaArray.add(delta > 0x7FFF ? delta - 0x10000 : (delta < - 0x7FFF ? delta + 0x10000 : delta));
        subTable4.idRangeOffsetArray.add(0);
        prevEndCode = glyphSegment.end.unicode;
        prevDelta = delta;
        segCount ++;
      }
    });
    subTable4.startCountArray.add(0xFFFF);
    subTable4.endCountArray.add(0xFFFF);
    subTable4.idDeltaArray.add(1);
    subTable4.idRangeOffsetArray.add(0);

    subTable4.segCountX2 = segCount * 2;
    subTable4.searchRange = 2 * Math.floor(Math.log(segCount));
    subTable4.entrySelector = Math.round(Math.log(subTable4.searchRange / 2));
    subTable4.rangeShift = 2 * segCount - subTable4.searchRange;

    subTable4.glyphIdArray.add(0);
    var i = 1;
    _.forEach(glyphs, function (glyph) {
      if (glyph.unicode <= 0xFFFF) {
        subTable4.glyphIdArray.add(i ++)
      }
    });
  }
  //serialize length, must be after subtable is filled
  subTable4.stLength = subTable4.length;

  //fill table 12
  if (glyphSegments.length > 0) {
    var subTable12 = cmapTable.subTable12.value[0];
    subTable12.nGroups = glyphSegments.length;
    var startGlyphCode = 0;
    _.forEach(glyphSegments, function (glyphSegment) {
      var segment = subTable12.groupsArray.createElement();
      segment.startCharCode = glyphSegment.start.unicode;
      segment.endCharCode = glyphSegment.end.unicode;
      segment.startGlyphCode = startGlyphCode;
      subTable12.groupsArray.add(segment);
      startGlyphCode += segment.endCharCode - segment.startCharCode + 1;
    });
  }
  //serialize length, must be after subtable is filled
  subTable12.stLength = subTable12.length;

  //fill table headers
  var offset = 4 + cmapTable.headers.value[0].length * cmapTable.headers.value.length;
  for (var i = 0; i < cmapTable.headers.value.length; i ++) {
    cmapTable.headers.value[i].offset = offset;
    if (i == 0)
      offset += cmapTable.subTable0.value[0].stLength;
    else if (i == 1)
      offset += cmapTable.subTable4.value[0].stLength;
    else if (i == 2)
      offset += cmapTable.subTable12.value[0].stLength;
  }
}

function fillMaxp(maxpTable, glyphs) {
  //include missed glyph
  maxpTable.numGlyphs = glyphs.length + 1;
}

function addName(nameTable, value, nameID) {
  var nameRecord = nameTable.nameRecordsArray.createElement();
  nameRecord.nameID = nameID;
  var bytes = getStringAsByteArray(value);
  nameRecord.reclength = bytes.length;
  nameRecord.offset = nameTable.actualStringData.value.length;
  nameTable.actualStringData.add(bytes);
  nameTable.nameRecordsCount ++;
  nameTable.nameRecordsArray.add(nameRecord);
  return nameRecord.length;
}

function fillNames(nameTable, font) {
  var length = 6; //initial offset
  length += addName(nameTable, font.copyright, TTF_NAMES.COPYRIGHT);
  length += addName(nameTable, font.id, TTF_NAMES.ID);
  length += addName(nameTable, font.family, TTF_NAMES.FONT_FAMILY);
  nameTable.offset = length;
}

//------------------main---------------------------------

function svg2ttf(svg, options, callback) {
  var font = svg_font(svg);
  var ttf = new TTF();
  fillGlyphs(ttf.tables, font);
  fillCmap(ttf.tables.cmap, font.glyphs, font.segments);
  fillMaxp(ttf.tables.maxp, font.glyphs);
  fillNames(ttf.tables.name, font);
  callback(null, ttf.toBuffer());
}

module.exports = svg2ttf;
