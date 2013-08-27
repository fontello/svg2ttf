'use strict';

var _ = require('lodash');
var DOMParser = require('xmldom').DOMParser;

// supports multibyte characters
function getUnicode(character) {
  if (character.length === 1) {
    // 2 bytes
    return character.charCodeAt(0);
  } else if (character.length === 2) {
    // 4 bytes
    var surrogate1 = character.charCodeAt(0);
    var surrogate2 = character.charCodeAt(1);
    /*jshint bitwise: false*/
    return ((surrogate1 & 0x3FF) << 10) + (surrogate2 & 0x3FF) + 0x10000;
  }
}

function getGlyph(elem, font, num, isMissed) {

  if (!isMissed) {
    // Ignore empty glyphs (with empty code or path)
    if (!elem.hasAttribute('d')) {
      return null;
    }
  }

  var glyph = {};

  glyph.isMissed = isMissed;
  glyph.d = elem.getAttribute('d') || '';
  glyph.character = elem.getAttribute('unicode') || String.fromCharCode(0);
  glyph.unicode = getUnicode(glyph.character) || num;
  glyph.name = elem.getAttribute('glyph-name') || ('item' + glyph.unicode);

  if (elem.getAttribute('horiz-adv-x')) {
    glyph.width = _.parseInt(+elem.getAttribute('horiz-adv-x'));
  }

  return glyph;
}

function load(str) {
  var doc = (new DOMParser()).parseFromString(str, "application/xml");

  var metadata = doc.getElementsByTagName('metadata')[0];
  var fontElem = doc.getElementsByTagName('font')[0];
  var fontFaceElem = fontElem.getElementsByTagName('font-face')[0];

  var font = {
    id: fontElem.getAttribute('id') || 'fontello',
    familyName: fontFaceElem.getAttribute('font-family') || 'fontello',
    glyphs: [],
    segments: [],
    missedGlyph: [],
    stretch: fontFaceElem.getAttribute('font-stretch') || 'normal'
  };
  
  if (metadata) {
    font.metadata = metadata.firstChild.data;
  }

  if (fontFaceElem.getAttribute('ascent')) {
    font.ascent = _.parseInt(+fontFaceElem.getAttribute('ascent'));
  }

  if (fontFaceElem.getAttribute('descent')) {
    font.descent = _.parseInt(+fontFaceElem.getAttribute('descent'));
  }

  if (fontFaceElem.getAttribute('horiz-adv-x')) {
    font.width = _.parseInt(+fontFaceElem.getAttribute('horiz-adv-x'));
  }

  if (fontFaceElem.getAttribute('units-per-em')) {
    font.unitsPerEm = _.parseInt(+fontFaceElem.getAttribute('units-per-em'));
  }

  if (fontFaceElem.getAttribute('font-weight')) {
    font.weightClass = fontFaceElem.getAttribute('font-weight');
  }


  _.forEach(fontElem.getElementsByTagName('missing-glyph'), function (glyphElem) {
    font.glyphs.push(getGlyph(glyphElem, font, 0, true));
  });

  var i = 1;
  _.forEach(fontElem.getElementsByTagName('glyph'), function (glyphElem) {
    var glyph = getGlyph(glyphElem, font, i, false);
    if (glyph) {
      font.glyphs.push(glyph);
      i++;
    }
  });

  font.glyphs.sort(function (a, b) {
    return a.unicode < b.unicode ? -1 : 1;
  });

  // Add IDs, they are equal to glyph index in array
  var id = 0;
  _.forEach(font.glyphs, function (glyph) {
    glyph.id = id++;
  });

  return font;
}

module.exports.load = load;
module.exports.pathParse = require("./svg/path_parse");
module.exports.cubicToQuad = require("./svg/cubic_to_quad");
module.exports.toSfntCoutours = require("./svg/to_sfnt_contours");
