'use strict';

var _ = require('lodash');
var DOMParser = require('xmldom').DOMParser;

//create non-interruptable segments of unicode characters for filling table CMAP
function fillGlyphSegments(glyphs) {
  var segments = [];
  var prevGlyph = null;
  var prevGlyphUnicode = 0;
  var segment = {};
  _.forEach(glyphs.items, function (glyph) {
    //initialize first segment or add new segment if code "hole" is found
    if (prevGlyph == null || glyph.unicode != prevGlyph.unicode + 1) {
      if (prevGlyph != null) {
        segment.end = prevGlyph;
        glyphs.segments.push(segment);
        segment = {};
      }
      segment.start = glyph;
    }
    prevGlyph = glyph;
  });

  //need to finish the last segment
  if (prevGlyph != null) {
    segment.end = prevGlyph;
    glyphs.segments.push(segment);
  }
}

//create SVG font object from string
function svgFont(str) {

  var doc = (new DOMParser()).parseFromString(str, "application/xml");

  var font = doc.getElementsByTagName('font')[0];
  var fontFace = font.getElementsByTagName('font-face')[0];

  var result = {
    items: [],
    segments: [],
    fontHorizAdvX: font.getAttribute('horiz-adv-x'),
    ascent: fontFace.getAttribute('ascent'),
    descent: - fontFace.getAttribute('descent'),
    glyphSize: 1000
  };

  _.forEach(font.getElementsByTagName('glyph'), function (glyph) {

    // Ignore empty glyphs (with empty code or path)
    if (! glyph.hasAttribute('d')) {
      return;
    }
    if (! glyph.hasAttribute('unicode')) {
      return;
    }

    var d = glyph.getAttribute('d');

    var character = glyph.getAttribute('unicode');

    var name = glyph.getAttribute('glyph-name') || ('glyph' + character);

    //
    // Rescale & Transform from scg fomt to svg image coordinates
    // !!! Transforms go in back order !!!
    //

    var width = glyph.getAttribute('horiz-adv-x') || fontHorizAdvX;
    var height = result.ascent + result.descent;
    var scale = result.glyphSize / height;

    // vertical mirror
    var transform = 'translate(0 ' + (result.glyphSize / 2) + ') scale(1 -1) translate(0 ' + (- result.glyphSize / 2) + ')';

    if (scale !== 1) {
      // scale size, only when needed
      transform += ' scale(' + scale + ')';
      // recalculate width & height
      width = width * scale;
      height = height * scale;
    }
    // descent shift
    transform += ' translate(0 ' + result.descent + ')';


    result.items.push({
      d: d,
      transform: transform,
      character: character,
      unicode: character.charCodeAt(),
      name: name,
      width: width,
      height: height
    });
  });

  result.items.sort(function (a, b) { return a.unicode < b.unicode ? - 1 : 1; });
  fillGlyphSegments(result);
  return result;
}

module.exports = svgFont;
