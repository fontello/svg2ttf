'use strict';

var _ = require('lodash');

var TTF_NAMES = {
  COPYRIGHT: 0,
  FONT_FAMILY: 1,
  ID: 3
};

// TODO: should we process non-ascii names?
function getStringAsByteArray(name, isPascalFormat) {
  var bytes = [];
  if (isPascalFormat) {
    bytes.push(name.length);
  }
  for (var i = 0; i < name.length; i ++) {
    if (! isPascalFormat) {
      bytes.push(0);
    }
    bytes.push(name.charCodeAt(i));
  }
  return bytes;
}

// -------------------add glyph----------------------

function addCmapInfo(glyph, cmapTable) {

  function encodeDelta(delta) {
    return delta < -0x7FFF ? delta + 0x10000 : delta;
  }

  function decodeDelta(delta) {
    return delta > 0x7FFF ? delta - 0x10000 : delta;
  }

  // fill table 0
  if (glyph.unicode < 256) {
    var subTable0 = cmapTable.subTable0.value[0];
    subTable0.glyphIdArray.value[glyph.unicode] = glyph.id;
  }

  // fill table 4
  if (glyph.unicode <= 0xFFFF) {
    var subTable4 = cmapTable.subTable4.value[0];
    var prevEndCode = _.last(subTable4.endCountArray.value) || 0;
    if (prevEndCode === 0 || glyph.unicode - prevEndCode > 1) {
      // there is a "hole" between last and currect glyph unicodes, we should create new segment
      var prevDelta = decodeDelta(_.last(subTable4.idDeltaArray.value)) || 0;
      subTable4.startCountArray.add(glyph.unicode);
      subTable4.endCountArray.add(glyph.unicode);
      subTable4.idDeltaArray.add(encodeDelta(prevEndCode - glyph.unicode + prevDelta + 1));
      subTable4.idRangeOffsetArray.add(0);
    } else {
      // increase value of last element in last segment
      _.last(subTable4.endCountArray.value, function (value, index, array) {
        array[index] = value + 1;
      });
    }
    subTable4.glyphIdArray.add(glyph.id);
  }

  // fill table 12
  var subTable12 = cmapTable.subTable12.value[0];
  var prevSegment = _.last(subTable12.groupsArray.value) || null;
  if (prevSegment === null || glyph.unicode - prevSegment.end.unicode > 1) {
    // there is a "hole" between last and currect glyph unicodes, we should create new segment
    var segment = subTable12.groupsArray.createElement();
    segment.startCharCode = glyph.start.unicode;
    segment.endCharCode = glyph.end.unicode;
    segment.startGlyphCode = 1;
    subTable12.groupsArray.add(segment);
  }
  else {
    prevSegment.endCharCode++;
  }
}

function addGlyphMetrics(glyph, font, svgGlyph) {
  // just a stub now, draws rectangle
  glyph.numberOfContours = 1;
  glyph.xMin = 0;
  glyph.yMin = 0;
  glyph.xMax = svgGlyph.width;
  glyph.yMax = svgGlyph.height;
  var endPtsOfContours = -1;
  var isFirstContour = true;
  _.forEach(svgGlyph.ttfPath, function (command) {
    if (command.startNewContour && ! isFirstContour) {
      glyph.endPtsOfContoursArray.add(endPtsOfContours);
      glyph.numberOfContours ++;
    }
    endPtsOfContours ++;
    isFirstContour = false;
    // each pair of coordinates is a vector from previous coordinate
    glyph.xCoordinatesArray.add(command.x);
    glyph.yCoordinatesArray.add(command.y);
    glyph.flagsArray.add(command.curve ? 1 : 0);
  });
  glyph.endPtsOfContoursArray.add(endPtsOfContours);
}

function addGlyphElement(glyphTable, font, svgGlyph) {
  // just a stub for now
  var glyph = glyphTable.glyfArray.createElement();
  addGlyphMetrics(glyph, font, svgGlyph);
  glyphTable.glyfArray.add(glyph);
  return glyph;
}

function addGlyphInfo(glyph, font, tables) {
  var glyphTable = tables.glyf;
  var locationTable = tables.location;
  var postTable = tables.post;
  var hmtxTable = tables.hmtx;
  var lastOffset = _.last(locationTable.offsetsArray.value) || 0;
  var length = addGlyphElement(glyphTable, font, glyph).length;

  // add location
  if (lastOffset === 0) { // first glyph
    locationTable.offsetsArray.add(0);
    locationTable.offsetsArray.add(lastOffset + length);
  }

  // add name
  if (glyph.isMissed) {
    postTable.glyphNameIndex.add(0); // .notDef
  } else {
    postTable.names.add(getStringAsByteArray(glyph.name, true));
    var lastnameOffset = _.last(postTable.glyphNameIndex.value) || 257;
    postTable.glyphNameIndex.add(lastnameOffset + 1);
  }

  // add width
  var hmtxElement = hmtxTable.hMetrics.createElement();
  hmtxElement.advanceWidth = glyph.width;
  hmtxTable.hMetrics.add(hmtxElement);
}

function addGlyph(glyph, font, ttf) {
  addCmapInfo(glyph, ttf.tables.cmap);
  addGlyphInfo(glyph, font, ttf.tables);
}

// ---------------finalization code-------------------

function finalizeCMap(cmapTable) {
  // add required info to CMAP table
  var subTable4 = cmapTable.subTable4.value[0];
  var segCount = subTable4.startCountArray.value.length;

  subTable4.segCountX2 = segCount * 2;
  subTable4.searchRange = 2 * Math.floor(Math.log(segCount));
  subTable4.entrySelector = Math.round(Math.log(subTable4.searchRange / 2));
  subTable4.rangeShift = 2 * segCount - subTable4.searchRange;

  subTable4.startCountArray.add(0xFFFF);
  subTable4.endCountArray.add(0xFFFF);
  subTable4.idDeltaArray.add(1);
  subTable4.idRangeOffsetArray.add(0);

  var subTable12 = cmapTable.subTable4.value[0];
  subTable12.nGroups = subTable12.groupsArray.value.length;

  // for all CMAP subtables we should serialize its length
  // it must be done after subtable is filled
  cmapTable.subTable0.value[0].stLength = cmapTable.subTable0.value[0].length;
  subTable4.stLength = subTable4.length;
  subTable12.stLength = subTable12.length;

  // fill table headers
  var offset = 4 + cmapTable.headers.value[0].length * cmapTable.headers.value.length;
  for (var i = 0; i < cmapTable.headers.value.length; i ++) {
    cmapTable.headers.value[i].offset = offset;
    if (i === 0) {
      offset += cmapTable.subTable0.value[0].stLength;
    } else if (i === 1) {
      offset += cmapTable.subTable4.value[0].stLength;
    } else if (i === 2) {
      offset += cmapTable.subTable12.value[0].stLength;
    }
  }

}

function fillHHeadTable(font, hheadTable) {
  hheadTable.numberOfHMetrics = font.glyphs.length;
}

function fillMaxpTable(maxpTable, glyphs) {
  maxpTable.numGlyphs = glyphs.length;
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

function fillNameTable(font, nameTable) {
  var length = 6; // initial offset
  length += addName(nameTable, font.copyright, TTF_NAMES.COPYRIGHT);
  length += addName(nameTable, font.id, TTF_NAMES.ID);
  length += addName(nameTable, font.family, TTF_NAMES.FONT_FAMILY);
  nameTable.offset = length;
}

function fillPostTable(font, postTable) {
  postTable.numberOfGlyphs = font.glyphs.length + 1;
}

function finalize(font, ttf) {
  finalizeCMap(ttf.tables.cmap);
  fillHHeadTable(font, ttf.tables.hHead);
  fillPostTable(font, ttf.tables.post);
  fillNameTable(font, ttf.tables.name);
  fillMaxpTable(font, ttf.tables.maxp);
}


module.exports.addGlyph = addGlyph;
module.exports.finalize = finalize;