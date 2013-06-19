'use strict';

var _ = require('lodash');
var DOMParser = require('xmldom').DOMParser;

//create non-interruptable segments of unicode characters for filling table CMAP
function fillGlyphSegments(font) {
  var segments = [];
  var prevGlyph = null;
  var prevGlyphUnicode = 0;
  var segment = {};
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

function getGlyph(elem, font, isMissed) {

  if (! isMissed) {
    // Ignore empty glyphs (with empty code or path)
    if (! elem.hasAttribute('d')) {
      return null;
    }
    if (! elem.hasAttribute('unicode')) {
      return null;
    }
  }

  var glyph = {};

  glyph.d = elem.getAttribute('d') || 0;
  glyph.character = elem.getAttribute('unicode') || String.fromCharCode(0);
  glyph.unicode = glyph.character.charCodeAt();
  glyph.name = elem.getAttribute('item-name') || ('item' + glyph.character);

  //
  // Rescale & Transform from scg fomt to svg image coordinates
  // !!! Transforms go in back order !!!
  //

  glyph.width = elem.getAttribute('horiz-adv-x') || font.fontHorizAdvX;
  glyph.height = font.ascent + font.descent;
  glyph.scale = font.glyphSize / font.height;

  // vertical mirror
  glyph.transform = 'translate(0 ' + (glyph.glyphSize / 2) + ') scale(1 -1) translate(0 ' + (- glyph.glyphSize / 2) + ')';

  if (glyph.scale !== 1) {
    // scale size, only when needed
    glyph.transform += ' scale(' + glyph.scale + ')';
    // recalculate width & height
    glyph.width = glyph.width * glyph.scale;
    glyph.height = glyph.height * glyph.scale;
  }
  // descent shift
  glyph.transform += ' translate(0 ' + font.descent + ')';

  return glyph;
}

//create SVG font object from string
function svgFont(str) {

  var doc = (new DOMParser()).parseFromString(str, "application/xml");

  var fontElem = doc.getElementsByTagName('font')[0];
  var fontFaceElem = fontElem.getElementsByTagName('font-face')[0];

  var font = {
    glyphs: [],
    segments: [],
    missedGlyph: [],
    fontHorizAdvX: fontElem.getAttribute('horiz-adv-x'),
    ascent: fontFaceElem.getAttribute('ascent'),
    descent: - fontFaceElem.getAttribute('descent'),
    glyphSize: 1000
  };

  _.forEach(fontElem.getElementsByTagName('missing-glyph'), function (glyphElem) {
    font.missedGlyph = getGlyph(glyphElem, font, true);
    //only single instance of missed glyph is allowed
    return;
  });

  _.forEach(fontElem.getElementsByTagName('glyph'), function (glyphElem) {
    var glyph = getGlyph(glyphElem, font);
    if (glyph)
      font.glyphs.push(glyph);
  });

  font.glyphs.sort(function (a, b) { return a.unicode < b.unicode ? - 1 : 1; });
  fillGlyphSegments(font);
  return font;
}

module.exports = svgFont;
