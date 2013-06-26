'use strict';

var _ = require('lodash');
var DOMParser = require('xmldom').DOMParser;

var SVG_PATH_PATTERN = new RegExp('[MmZzLlHhVvCcSsQqTtAa][^MmZzLlHhVvCcSsQqTtAa]*', 'g', 'm');
var SVG_COORDS_PATTERN = new RegExp('[\\S-][^\\s-]*', 'g', 'm');

var convertPoint;

var FLAGS = {
  START_NEW_CONTOUR: 1,
  ABSOLUTE: 2,
  CURVE: 4,
  CUBIC_BEZIER: 8,
  SMOOTH_CUBIC_BEZIER: 16,
  QUAD_BEZIER: 32,
  SMOOTH_QUAD_BEZIER: 64,
  ARC: 128,
  CLOSE_PATH: 256
}

var TTF_FLAGS = {
  CURVE: 1
}

var SVG_COMMAND_TYPES = {
  //Start a new sub-path at the given (x,y) coordinate.
  M: { flags: FLAGS.START_NEW_CONTOUR | FLAGS.ABSOLUTE },
  m: { flags: FLAGS.START_NEW_CONTOUR },
  //Close the current subpath by drawing a straight line from the current point to current subpath's initial point.
  Z: { coordLength: 0, flags: FLAGS.CLOSE_PATH },
  z: { coordLength: 0, flags: FLAGS.CLOSE_PATH },
  //Draw a line from the current point to the given (x,y) coordinate which becomes the new current point.
  L: { flags: FLAGS.ABSOLUTE },
  l: { },
  //Draws a horizontal line from the current point (cpx, cpy) to (x, cpy).
  H: { coordLength: 1, yIndex: - 1, flags: FLAGS.ABSOLUTE },
  h: { coordLength: 1, yIndex: - 1 },
  //Draws a vertical line from the current point (cpx, cpy) to (cpx, y).
  V: { coordLength: 1, xIndex: - 1, yIndex: 0, flags: FLAGS.ABSOLUTE },
  v: { coordLength: 1, xIndex: - 1, yIndex: 0},
  //Draws a cubic Bézier curve from the current point to (x,y) using (x1,y1) as the control point at the beginning of the curve and (x2,y2) as the control point at the end of the curve.
  C: { coordLength: 6, xIndex: 4, yIndex: 5, flags: FLAGS.CURVE | FLAGS.CUBIC_BEZIER | FLAGS.ABSOLUTE },
  c: { coordLength: 6, xIndex: 4, yIndex: 5, flags: FLAGS.CURVE | FLAGS.CUBIC_BEZIER },
  //Draws a cubic Bézier curve from the current point to (x,y).
  S: { coordLength: 4, xIndex: 2, yIndex: 3, flags: FLAGS.CURVE | FLAGS.SMOOTH_CUBIC_BEZIER | FLAGS.ABSOLUTE },
  s: { coordLength: 4, xIndex: 2, yIndex: 3, flags: FLAGS.CURVE | FLAGS.SMOOTH_CUBIC_BEZIER },
  //Draws a quadratic Bézier curve from the current point to (x,y) using (x1,y1) as the control point.
  Q: { coordLength: 4, xIndex: 2, yIndex: 3, flags: FLAGS.CURVE | FLAGS.QUAD_BEZIER | FLAGS.ABSOLUTE },
  q: { coordLength: 4, xIndex: 2, yIndex: 3, flags: FLAGS.CURVE | FLAGS.QUAD_BEZIER },
  //Draws a quadratic Bézier curve from the current point to (x,y).
  T: { flags: FLAGS.CURVE | FLAGS.SMOOTH_QUAD_BEZIER | FLAGS.ABSOLUTE },
  t: { flags: FLAGS.CURVE | FLAGS.SMOOTH_QUAD_BEZIER },
  //Draws an elliptical arc from the current point to (x, y).
  A: { flags: FLAGS.CURVE | FLAGS.ARC | FLAGS.ABSOLUTE },
  a: { coordLength: 7, xIndex: 5, yIndex: 7, flags: FLAGS.CURVE | FLAGS.ARC }
}

function splitByPattern(str, pattern) {
  var result = [];
  var match;
  while (match = pattern.exec(str)) {
    result.push(match[0]);
  }
  return result;
}

//parses coordinates depenging of command type
function parseCoords(coords, svgCommandType) {
  var result = [];
  var point = {};
  var coordLength = svgCommandType.coordLength != undefined ? svgCommandType.coordLength : 2; //default coords length is 2
  var xIndex = svgCommandType.xIndex != undefined ? svgCommandType.xIndex : 0; //default x index is 0
  var yIndex = svgCommandType.yIndex != undefined ? svgCommandType.yIndex : 1; //default y index is 1
  var i = 0;
  _.forEach(coords, function (coord) {
    if (i == 0)
      point = { x: 0, y: 0, other: [] };
    if (i == xIndex)
      point.x = coord;
    else if (i == yIndex)
      point.y = coord;
    else
      point.other.push(coord);
    i ++;
    if (i == coordLength) {
      result.push(point);
      i = 0;
    }
  });
  return result;
}

//splits command to command name and array of coordinates
function parseSvgCommand(svgCommandRaw, coordFlags) {
  if (svgCommandRaw.length == 0)
    return null;
  else {
    return {
      type: svgCommandRaw[0],
      coords: splitByPattern(svgCommandRaw.substr(1), SVG_COORDS_PATTERN)
    }
  }
}

//TTF coordinates are always relative, we need to convert absolute coorditanes to relative ones
function getCoord(font, glyph, path, property, value, convertToRelative) {
  var result;
  if (path.length > 0 && convertToRelative)
    result = + value - path[path.length - 1][property];
  else
    result = + value;
  return result;
}

function addTTFCommands(font, glyph, path, svgCommandRaw) {
  var svgCommand = parseSvgCommand(svgCommandRaw);
  var svgCommandType = SVG_COMMAND_TYPES[svgCommand.type];
  if (! svgCommandType) //unknown command type
    return;
  var coords = parseCoords(svgCommand.coords, svgCommandType);
  var startNewContour = svgCommandType.flags & FLAGS.START_NEW_CONTOUR ? true : false;
  var convertToRelative = svgCommandType.flags & FLAGS.ABSOLUTE ? true : false;
  var ttfFlags = 1;
  //TODO: support curve commands. Currently all commands are treated as lines. So 2 lines below are commented now.
  //if (svgCommandType.flags & FLAGS.CURVE)
  //  ttfFlags = 0;
  _.forEach(coords, function (point) {
    path.push({
      x: getCoord(font, glyph, path, 'x', point.x, convertToRelative),
      y: getCoord(font, glyph, path, 'y', point.y, convertToRelative),
      startNewContour: startNewContour,
      flags: ttfFlags});
  });

}

//converts path to the set of TTF commands
function toTTFPath(font, glyph) {
  var path = [];
  if (glyph.d) {
    var commands = splitByPattern(glyph.d, SVG_PATH_PATTERN);
    _.forEach(commands, function (command) {
      addTTFCommands(font, glyph, path, command);
    });
  }
  return path;
}

//create non-interruptable segments of unicode characters for filling table CMAP
function fillGlyphSegments(font) {
  var prevGlyph = null;
  var segment = {};

  //add missed glyph as first segment
  font.segments.push({
    start: font.missedGlyph,
    end: font.missedGlyph});

  _.forEach(font.glyphs, function (glyph) {
    //initialize first segment or add new segment if code "hole" is found
    if (prevGlyph == null || glyph.unicode != prevGlyph.unicode + 1) {
      if (prevGlyph != null) {
        segment.end = prevGlyph;
        font.segments.push(segment);
        segment = {};
      }
      segment.start = glyph;
    }
    prevGlyph = glyph;
  });

  //need to finish the last segment
  if (prevGlyph != null) {
    segment.end = prevGlyph;
    font.segments.push(segment);
  }
}

//supports multibyte characters
function getUnicode(character) {
  if (character.length == 1)
  // 2 bytes
    return character.charCodeAt(0);
  else if (character.length == 2) {
    // 4 bytes
    var surrogate1 = character.charCodeAt(0);
    var surrogate2 = character.charCodeAt(1);
    return ((surrogate1 & 0x3FF) << 10) + (surrogate2 & 0x3FF) + 0x10000;
  }
  return result;
}

function getGlyph(elem, font, num, isMissed) {

  if (! isMissed) {
    // Ignore empty glyphs (with empty code or path)
    if (! elem.hasAttribute('d')) {
      return null;
    }
  }

  var glyph = {};

  glyph.d = elem.getAttribute('d') || 'M0 0';
  glyph.character = elem.getAttribute('unicode') || String.fromCharCode(0);
  glyph.unicode = getUnicode(glyph.character) || num;
  glyph.name = elem.getAttribute('glyph-name') || ('item' + glyph.unicode);

  //
  // Rescale & Transform from scg fomt to svg image coordinates
  // !!! Transforms go in back order !!!
  //

  glyph.width = _.parseInt(+ elem.getAttribute('horiz-adv-x') || font.fontHorizAdvX);
  glyph.height = _.parseInt(font.ascent + font.descent);
  glyph.scale = font.glyphSize / glyph.height;
  glyph.size = 1000; //TODO: check if it is correct value

  // vertical mirror
  glyph.transform = 'translate(0 ' + (glyph.size / 2) + ') scale(1 -1) translate(0 ' + (- glyph.size / 2) + ')';

  if (glyph.scale !== 1) {
    // scale size, only when needed
    glyph.transform += ' scale(' + glyph.scale + ')';
    // recalculate width & height
    glyph.width = _.parseInt(glyph.width * glyph.scale);
    glyph.height = _.parseInt(glyph.height * glyph.scale);
  }
  // descent shift
  glyph.transform += ' translate(0 ' + font.descent + ')';

  glyph.__defineGetter__('ttfPath', function () {
    return toTTFPath(font, this);
  });

  return glyph;
}

//create SVG font object from string
function svgFont(str) {

  var doc = (new DOMParser()).parseFromString(str, "application/xml");

  var metadata = doc.getElementsByTagName('metadata')[0];
  var fontElem = doc.getElementsByTagName('font')[0];
  var fontFaceElem = fontElem.getElementsByTagName('font-face')[0];

  var font = {
    copyright: metadata.firstChild.data,
    id: fontElem.getAttribute('id') || 'fontello',
    family: fontFaceElem.getAttribute('font-family') || 'fontello',
    glyphs: [],
    segments: [],
    missedGlyph: [],
    fontHorizAdvX: _.parseInt(+ fontElem.getAttribute('horiz-adv-x')),
    ascent: _.parseInt(+ fontFaceElem.getAttribute('ascent')),
    descent: _.parseInt(- fontFaceElem.getAttribute('descent')),
    glyphSize: 1000
  };

  _.forEach(fontElem.getElementsByTagName('missing-glyph'), function (glyphElem) {
    font.missedGlyph = getGlyph(glyphElem, font, 0, true);
    //only single instance of missed glyph is allowed
    return;
  });

  var i = 1;
  _.forEach(fontElem.getElementsByTagName('glyph'), function (glyphElem) {
    var glyph = getGlyph(glyphElem, font, i);
    if (glyph) {
      font.glyphs.push(glyph);
      i++;
    }
  });

  font.glyphs.sort(function (a, b) { return a.unicode < b.unicode ? - 1 : 1; });
  fillGlyphSegments(font);
  return font;
}

module.exports = svgFont;
