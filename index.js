/*
 Author: Sergey Batishchev <snb2003@rambler.ru>

 Written for fontello.com project.

 TTF file structure is based on https://developer.apple.com/fonts/TTRefMan/RM06/Chap6.html
 */

'use strict';

var _ = require('lodash');
var svg_font = require("./lib/svg_font");
var TTF = require("./lib/ttf");

//------------------table initialization---------------------



//----------------conversion-----------------------------

function getGlyphEndPtsOfContours(transform, numberOfContours) {
  return [0]; // just a stub for now
}

function getGlyphFlags(transform) {
  return [1]; // just a stub for now
}

function getGlyphXCoordinates(transform) {
  return [0, 100]; // just a stub for now
}

function getGlyphYCoordinates(transform) {
  return [0, 200]; // just a stub for now
}

function addGlyphElement(glyphTable, glyphObject) {
  // just a stub for now
  var numberOfContours = 1;
  var transform = glyphObject.transform;
  var glyph = glyphTable.glyfArray.createElement();
  glyph.numberOfContours = numberOfContours;
  glyph.xMin = 0;
  glyph.yMin = 0;
  glyph.xMax = glyphObject.width;
  glyph.yMax = glyphObject.height;
  glyph.endPtsOfContoursArray.add(getGlyphEndPtsOfContours(transform, numberOfContours));
  glyph.endPtsOfContoursArray.add(getGlyphEndPtsOfContours(transform, numberOfContours));
  glyph.flagsArray.add(getGlyphFlags(transform));
  glyph.xCoordinatesArray.add(getGlyphXCoordinates(transform));
  glyph.yCoordinatesArray.add(getGlyphYCoordinates(transform));
  glyphTable.glyfArray.add(glyph);
  return glyph;
}

function fillGlyphs(tables, font) {
  var glyphTable = tables.glyf;
  var locationTable = tables.location;
  //add misssed glyph
  locationTable.offsetsArray.add(0);
  var offset = addGlyphElement(glyphTable, font.missedGlyph).length;
  _.forEach(font.glyphs, function (glyph) {
    locationTable.offsetsArray.add(offset);
    offset += addGlyphElement(glyphTable, glyph).length;
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
    var prevDelta = -1;
    var segCount = 1;
    _.forEach(glyphSegments, function (glyphSegment) {
      if (glyphSegment.start.unicode <= 0xFFFF) {
        subTable4.startCountArray.add(glyphSegment.start.unicode);
        subTable4.endCountArray.add(glyphSegment.end.unicode < 0xFFFF ? glyphSegment.end.unicode : 0xFFFF);
        var delta = prevEndCode - glyphSegment.start.unicode + prevDelta + 1;
        subTable4.idDeltaArray.add(delta > 0x7FFF ? delta - 0x10000 : (delta < -0x7FFF ? delta + 0x10000 : delta));
        subTable4.idRangeOffsetArray.add(0);
        prevEndCode = glyphSegment.end.unicode;
        prevDelta = delta;
        segCount++;
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
      subTable4.glyphIdArray.add(i++)
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
  for (var i = 0; i < cmapTable.headers.value.length; i++) {
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


//------------------main---------------------------------

function svg2ttf(svg, options, callback) {
  var font = svg_font(svg);
  var ttf = new TTF();
  fillGlyphs(ttf.tables, font);
  fillCmap(ttf.tables.cmap, font.glyphs, font.segments);
  fillMaxp(ttf.tables.maxp, font.glyphs);
  callback(null, ttf.toBuffer());
}

module.exports = svg2ttf;
