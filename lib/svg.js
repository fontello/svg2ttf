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

function getGlyph(glyphElem) {
  var glyph = {};

  glyph.d = glyphElem.getAttribute('d');

  if (glyphElem.getAttribute('unicode')) {
    glyph.character = glyphElem.getAttribute('unicode');
    glyph.unicode = getUnicode(glyph.character);
  }

  glyph.name = glyphElem.getAttribute('glyph-name');

  if (glyphElem.getAttribute('horiz-adv-x')) {
    glyph.width = parseInt(glyphElem.getAttribute('horiz-adv-x'), 10);
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
    stretch: fontFaceElem.getAttribute('font-stretch') || 'normal'
  };
  
  if (metadata) {
    font.metadata = metadata.firstChild.data;
  }

  if (fontFaceElem.getAttribute('ascent')) {
    font.ascent = parseInt(fontFaceElem.getAttribute('ascent'), 10);
  }

  if (fontFaceElem.getAttribute('descent')) {
    font.descent = parseInt(fontFaceElem.getAttribute('descent'), 10);
  }

  if (fontFaceElem.getAttribute('horiz-adv-x')) {
    font.width = parseInt(fontFaceElem.getAttribute('horiz-adv-x'), 10);
  }

  if (fontFaceElem.getAttribute('units-per-em')) {
    font.unitsPerEm = parseInt(fontFaceElem.getAttribute('units-per-em'), 10);
  }

  if (fontFaceElem.getAttribute('font-weight')) {
    font.weightClass = fontFaceElem.getAttribute('font-weight');
  }

  var missingGlyphElem = fontElem.getElementsByTagName('missing-glyph')[0];
  if (missingGlyphElem) {

    font.missingGlyph = {};
    font.missingGlyph.d = missingGlyphElem.getAttribute('d') || '';

    if (missingGlyphElem.getAttribute('horiz-adv-x')) {
      font.missingGlyph.width = parseInt(missingGlyphElem.getAttribute('horiz-adv-x'), 10);
    }
  }

  _.forEach(fontElem.getElementsByTagName('glyph'), function (glyphElem) {
    if (glyphElem.hasAttribute('d')) {
      font.glyphs.push(getGlyph(glyphElem));
    }
  });

  return font;
}

module.exports.load = load;
module.exports.pathParse = require("./svg/path_parse");
module.exports.cubicToQuad = require("./svg/cubic_to_quad");
module.exports.toSfntCoutours = require("./svg/to_sfnt_contours");
