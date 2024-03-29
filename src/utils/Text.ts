import {
  FontData,
  TextAlign,
  _Text,
  _TextLine,
  TextBufferAttributes,
  FontChar,
} from "@types";

export interface TextProps {
  fontData: FontData;
  text: string;
  size?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  wordBreak?: boolean;
  lineWidth?: number;
  align?: TextAlign;
  lineHeight?: number;
}

export class Text implements _Text {
  fontData: FontData;
  text: string;
  size: number;
  letterSpacing: number;
  wordSpacing: number;
  wordBreak: boolean;
  lineWidth: number;
  align: TextAlign;
  lineHeight: number;
  newline = /\n/;
  whitespace = /\s/;
  buffers: Record<TextBufferAttributes, Float32Array | Uint16Array>;
  glyphs: Record<string, FontChar>;
  scale: number;
  lines: Array<_TextLine>;
  numLines: number;
  height: number;
  width: number;
  constructor(props: TextProps) {
    this.fontData = props.fontData;
    this.text = props.text;
    this.size = props.size || 1;
    this.letterSpacing = props.letterSpacing || 0;
    this.wordSpacing = props.wordSpacing || 0;
    this.wordBreak = props.wordBreak || false;
    this.lineWidth = props.lineWidth || Infinity;
    this.align = props.align || TextAlign.Left;
    this.lineHeight = props.lineHeight || 1.4;

    this.parseFont();
    this.createGeometry();
    this.layout();
    this.populateBuffers();
  }

  parseFont() {
    this.glyphs = {};
    this.fontData.chars.forEach((d) => (this.glyphs[d.char] = d));
  }

  createGeometry() {
    const fontHeight = this.fontData.common.lineHeight;
    const baseline = this.fontData.common.base;
    const heightA = this.glyphs["A"].height;

    // Use baseline so that actual text height is as close to 'size' value as possible
    // this.scale = this.size / baseline;
    this.scale = this.size / heightA;
    // this.scale = 1;

    // Strip spaces and newlines to get actual character length for buffers
    const chars = this.text.replace(/[ \n]/g, "");
    const numChars = chars.length;

    // Create output buffers
    this.buffers = {
      position: new Float32Array(numChars * 4 * 3),
      uv: new Float32Array(numChars * 4 * 2),
      id: new Float32Array(numChars * 4),
      index: new Uint16Array(numChars * 6),
    };

    // Set values for buffers that don't require calculation
    for (let i = 0; i < numChars; i++) {
      this.buffers.id.set([i, i, i, i], i * 4);
      this.buffers.index.set(
        [i * 4, i * 4 + 2, i * 4 + 1, i * 4 + 1, i * 4 + 2, i * 4 + 3],
        i * 6
      );
    }
  }

  layout() {
    this.lines = [];

    let cursor = 0;

    let wordCursor = 0;
    let wordWidth = 0;
    let line = new TextLine();

    this.lines.push(line);

    let maxTimes = 100;
    let count = 0;
    while (cursor < this.text.length && count < maxTimes) {
      count++;

      const char = this.text[cursor];

      // Skip whitespace at start of line
      if (!line.width && this.whitespace.test(char)) {
        cursor++;
        wordCursor = cursor;
        wordWidth = 0;
        continue;
      }

      // If newline char, skip to next line
      if (this.newline.test(char)) {
        cursor++;
        line = new TextLine();
        this.lines.push(line);
        wordCursor = cursor;
        wordWidth = 0;
        continue;
      }

      const glyph = this.glyphs[char] || this.glyphs[" "];

      // Find any applicable kern pairs
      if (line.glyphs.length) {
        const prevGlyph = line.glyphs[line.glyphs.length - 1][0];
        let kern = this.getKernPairOffset(glyph.id, prevGlyph.id) * this.scale;
        line.width += kern;
        wordWidth += kern;
      }

      // add char to line
      line.glyphs.push([glyph, line.width]);

      // calculate advance for next glyph
      let advance = 0;

      // If whitespace, update location of current word for line breaks
      if (this.whitespace.test(char)) {
        wordCursor = cursor;
        wordWidth = 0;

        // Add wordspacing
        advance += this.wordSpacing * this.size;
      } else {
        // Add letterspacing
        advance += this.letterSpacing * this.size;
      }

      advance += glyph.xadvance * this.scale;

      line.width += advance;
      wordWidth += advance;

      // If width defined
      if (line.width > this.lineWidth) {
        // If can break words, undo latest glyph if line not empty and create new line
        if (this.wordBreak && line.glyphs.length > 1) {
          line.width -= advance;
          line.glyphs.pop();
          line = new TextLine();
          this.lines.push(line);
          wordCursor = cursor;
          wordWidth = 0;
          continue;

          // If not first word, undo current word and cursor and create new line
        } else if (!this.wordBreak && wordWidth !== line.width) {
          let numGlyphs = cursor - wordCursor + 1;
          line.glyphs.splice(-numGlyphs, numGlyphs);
          cursor = wordCursor;
          line.width -= wordWidth;
          line = new TextLine();
          this.lines.push(line);
          wordCursor = cursor;
          wordWidth = 0;
          continue;
        }
      }

      cursor++;
      // Reset infinite loop catch
      count = 0;
    }

    // Remove last line if empty
    if (!line.width) this.lines.pop();
  }

  getKernPairOffset(id1: number, id2: number) {
    for (let i = 0; i < this.fontData.kernings.length; i++) {
      let k = this.fontData.kernings[i];
      if (k.first < id1) continue;
      if (k.second < id2) continue;
      if (k.first > id1) return 0;
      if (k.first === id1 && k.second > id2) return 0;
      return k.amount;
    }
    return 0;
  }

  populateBuffers() {
    const texW = this.fontData.common.scaleW;
    const texH = this.fontData.common.scaleH;

    // For all fonts tested, a little offset was needed to be right on the baseline, hence 0.07.
    let xOffset = 0;
    let y = 0.93 * this.size;
    let j = 0;

    for (let lineIndex = 0; lineIndex < this.lines.length; lineIndex++) {
      let line = this.lines[lineIndex];

      for (let i = 0; i < line.glyphs.length; i++) {
        const glyph = line.glyphs[i][0];
        let x = line.glyphs[i][1] + xOffset;

        if (this.align === "center") {
          x -= line.width * 0.5;
        } else if (this.align === "right") {
          x -= line.width;
        }

        // If space, don't add to geometry
        if (this.whitespace.test(glyph.char)) continue;

        // Apply char sprite offsets
        x += glyph.xoffset * this.scale;
        y -= glyph.yoffset * this.scale;

        // each letter is a quad. axis bottom left
        let w = glyph.width * this.scale;
        let h = glyph.height * this.scale;

        this.buffers.position.set(
          [x, y - h, 0, x, y, 0, x + w, y - h, 0, x + w, y, 0],
          j * 4 * 3
        );

        let u = glyph.x / texW;
        let uw = glyph.width / texW;
        let v = 1.0 - glyph.y / texH;
        let vh = glyph.height / texH;
        this.buffers.uv.set(
          [u, v - vh, u, v, u + uw, v - vh, u + uw, v],
          j * 4 * 2
        );

        // Reset cursor to baseline
        y += glyph.yoffset * this.scale;

        j++;
      }

      y -= this.size * this.lineHeight;
    }

    // plublic properties
    // _this.buffers = buffers;
    this.numLines = this.lines.length;
    this.height = this.numLines * this.size * this.lineHeight;
    this.width = Math.max(...this.lines.map((line) => line.width));
  }

  onResize() {
    // this.width = width;
    this.layout();
    this.populateBuffers();
  }

  update(text: string) {
    this.text = text;
    this.createGeometry();
    this.layout();
    this.populateBuffers();
  }

  updateSize(size: number, lineHeight = this.lineHeight, lineWidth?: number) {
    if (lineWidth) this.lineWidth = lineWidth;
    this.lineHeight = lineHeight;
    this.size = size;
    const heightA = this.glyphs["A"].height;
    this.scale = this.size / heightA;
    this.layout();
    this.populateBuffers();
  }
}

class TextLine implements _TextLine {
  width = 0;
  glyphs: Array<[FontChar, number]> = [];
}
