/*global it, describe*/
'use strict';


const assert   = require('assert');
var fs         = require('fs');
var path       = require('path');
const opentype = require('opentype.js');
const svg2ttf  = require('../');

const fixture = `
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg">
<metadata>Copyright (C) 2016 by original authors @ fontello.com</metadata>
<defs>
<font id="fontello" horiz-adv-x="1000" >
<font-face font-family="fontello" font-weight="400" font-stretch="normal" units-per-em="1000" ascent="850" descent="-150" />
<missing-glyph horiz-adv-x="1000" />
<glyph glyph-name="duckduckgo" unicode="&#xe807;" d="M0 349q0 215 141 355t355 141 356-141 140-355q0-182-103-313t-280-172q-9 17-33 52t-35 56q64-26 86-26 16 0 16 50 0 94-17 94-25 0-97-55 0 14-15 12l-5 0q-26 69-26 123 0 15 3 30 92-45 148-45 31 0 94 18t62 39q0 13-17 13-26 0-75-7t-75-7q-27 0-59 14t-33 38q0 5 2 7t4 3 6 0 8-1 9 0q9 0 26-3t25-2q31 0 127 36t96 57q0 12-18 17t-35 5q-14 0-42-8t-61-18-44-13q4 20 4 32 0 47-25 109t-58 93q-27 24-72 33-28 36-87 65t-106 30q-9 0-27-4t-24-4l-22-31 6-1q7 0 22 2t21 2q34 0 78-14-28-14-49-19-2-1-13-3t-18-3-14-6-7-11q56 6 84 6 38 0 60-7-77-9-118-53t-42-121q0-27 4-50 19-120 73-358 33-155 37-171l1-4q-160 50-251 186t-91 308z m283 124q0-6 3-12-1 16 18 28t36 12q8 0 20-5-10 13-29 13-17 0-32-10t-16-26z m33-75q0 13 11 23t23 11 24-11 10-23-10-24-24-10-23 10-11 24z m40 11q0-8 9-8t9 8q0 9-9 9t-9-9z m168 87q8 13 37 13 13 0 33-10-10 22-35 22-31 0-35-25z m23-78q0 12 9 20t20 9q12 0 21-9t8-20q0-11-8-20t-21-9q-11 0-20 9t-9 20z m35 10q0-8 7-8 8 0 8 8 0 7-8 7-7 0-7-7z" horiz-adv-x="992" />
<glyph glyph-name="github" unicode="&#xe809;" d="M1079 851c-33 1-110-11-239-97-70 18-145 26-219 26-83 0-166-10-243-31-185 126-267 100-267 100-53-133-20-232-10-256-63-68-101-154-101-260 0-80 9-151 31-214 2-4 1-3 3-8 5-12 11-25 17-37 2-4 4-8 4-8 62-116 185-191 404-215l331 0c233 23 345 98 397 216l3 7c5 12 9 24 21 66 12 41 17 113 17 193 0 115-43 207-113 276 12 40 28 128-17 240 0 0-6 2-19 2z m-261-421c54 0 100-9 135-46l0 0c43-45 69-100 69-159 0-277-178-285-398-285-219 0-397 39-397 285 0 58 25 113 68 158 71 76 192 36 329 36 71 0 137 11 194 11z m-408-82c-46 0-83-61-83-137 0-77 37-138 83-138 45 0 82 61 82 138 0 76-37 137-82 137z m443 0c-45 0-82-61-82-137 0-77 37-138 82-138 46 0 83 61 83 138 0 76-37 137-83 137z" horiz-adv-x="1228" />
</font>
</defs>
</svg>
`;


describe('svg2ttf', function () {
  describe('version', function () {
    it('should throw on bad version value', function () {
      assert.throws(() => svg2ttf(fixture, { version: 123 }));
      assert.throws(() => svg2ttf(fixture, { version: 'abc' }));
    });

    it('should set proper version', function () {
      let options, parsed;

      options = { version: '1.0' };
      parsed = opentype.parse(svg2ttf(fixture, options).buffer.buffer);
      assert.strictEqual(parsed.tables.name.version.en, 'Version 1.0');

      options = { version: 'Version 1.0' };
      parsed = opentype.parse(svg2ttf(fixture, options).buffer.buffer);
      assert.strictEqual(parsed.tables.name.version.en, 'Version 1.0');

      options = { version: 'version 2.0' };
      parsed = opentype.parse(svg2ttf(fixture, options).buffer.buffer);
      assert.strictEqual(parsed.tables.name.version.en, 'Version 2.0');
    });
  });


  describe('glyphs', function () {
    it('should return 3 glyphs', function () {
      let parsed = opentype.parse(svg2ttf(fixture).buffer.buffer);

      assert.strictEqual(parsed.glyphs.length, 3);
      assert.strictEqual(parsed.glyphs.glyphs[0].name, ''); // missing-glyph
      assert.strictEqual(parsed.glyphs.glyphs[1].name, 'duckduckgo');
      assert.strictEqual(parsed.glyphs.glyphs[2].name, 'github');
    });
  });


  describe('os/2 table', function () {
    it('winAscent + winDescent should include line gap', function () {
      // https://www.high-logic.com/font-editor/fontcreator/tutorials/font-metrics-vertical-line-spacing
      let parsed = opentype.parse(svg2ttf(fixture).buffer.buffer);
      let os2 = parsed.tables.os2;

      // always should be >=, but for this specific test they should be equal
      assert.strictEqual(
        os2.usWinAscent + os2.usWinDescent,
        os2.sTypoAscender - os2.sTypoDescender + os2.sTypoLineGap);
    });
  });

  describe('arrow.svg os/2 table', function () {
    const src = fs.readFileSync(path.join(__dirname, 'fixtures/arrow.svg'), 'utf-8');

    it('should be equal', function () {
      const parsed = opentype.parse(svg2ttf(src).buffer.buffer);
      const os2 = parsed.tables.os2;

      assert.strictEqual(os2.usWinAscent, 988);
      assert.strictEqual(os2.usWinDescent, 130);
    });
  });

  describe('kvm.svg os/2 table', function () {
    const src = fs.readFileSync(path.join(__dirname, 'fixtures/kvm.svg'), 'utf-8');

    it('should be equal', function () {
      const parsed = opentype.parse(svg2ttf(src).buffer.buffer);
      const os2 = parsed.tables.os2;

      assert.strictEqual(os2.usWinAscent, 988);
      assert.strictEqual(os2.usWinDescent, 52468);
    });
  });

  describe('yezi.svg os/2 table', function () {
    const src = fs.readFileSync(path.join(__dirname, 'fixtures/yezi.svg'), 'utf-8');

    it('should be equal', function () {
      const parsed = opentype.parse(svg2ttf(src).buffer.buffer);
      const os2 = parsed.tables.os2;

      assert.strictEqual(os2.usWinAscent, 56375);
      assert.strictEqual(os2.usWinDescent, 11936);
    });
  });
});
