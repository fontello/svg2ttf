'use strict';

var _ = require('lodash');
var DOMParser = require('xmldom').DOMParser;

var SVG = {

  getGlyphs: function (buf) {

    var result = []
      , fontHorizAdvX
      , ascent
      , descent
      , glyphSize = 1000;

    var doc = (new DOMParser()).parseFromString(buf, "application/xml");

    var font = doc.getElementsByTagName('font')[0];
    var fontFace = font.getElementsByTagName('font-face')[0];

    var fontHorizAdvX = + font.getAttribute('horiz-adv-x');
    var ascent = + fontFace.getAttribute('ascent');
    var descent = - fontFace.getAttribute('descent');

    _.each(font.getElementsByTagName('glyph'), function (glyph) {

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
      var height = ascent + descent;
      var scale = glyphSize / height;

      // vertical mirror
      var transform = 'translate(0 ' + (glyphSize / 2) + ') scale(1 -1) translate(0 ' + (- glyphSize / 2) + ')';

      if (scale !== 1) {
        // scale size, only when needed
        transform += ' scale(' + scale + ')';
        // recalculate width & height
        width = width * scale;
        height = height * scale;
      }
      // descent shift
      transform += ' translate(0 ' + descent + ')';


      result.push({
        d: d,
        transform: transform,
        character: character,
        unicode: character.charCodeAt(),
        name: name,
        width: width,
        height: height
      });

    });

    result.sort(function (a, b) { return a.unicode < b.unicode ? - 1 : 1; });
    return result;
  },

//create non-interruptable segments of unicode characters for filling table CMAP
  getGlyphSegments: function (glyphs) {
    var segments = [];
    var isFirstSegment = true;
    var prevGlyphUnicode = 0;
    var prevSegment = {};
    var segment = {};

    for (var i = 0; i < glyphs.length; i ++) {
      var glyph = glyphs[i];
      //initialize first segment or add new segment if code "hole" is found
      if (isFirstSegment || glyph.unicode != prevGlyphUnicode + 1) {
        if (! isFirstSegment) {
          segment.end = glyphs[i - 1];
          segments.push(segment);
          segment = {};
        }
        else
          isFirstSegment = false;
        segment.start = glyph;
      }
      prevGlyphUnicode = glyph.unicode;
    }

    //need to finish the last segment
    if (! isFirstSegment) {
      segment.end = glyphs[glyphs.length - 1];
      segments.push(segment);
    }
    return segments;
  }
}

exports.SVG = SVG;