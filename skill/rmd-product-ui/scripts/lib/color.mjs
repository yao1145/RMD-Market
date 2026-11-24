const HEX = /^#([0-9a-f]{3,8})$/i;
const RGB = /^rgba?\(([^)]+)\)$/i;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseHex(value) {
  const match = HEX.exec(value.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3 || hex.length === 4) {
    hex = [...hex].map((char) => char + char).join('');
  }
  if (hex.length !== 6 && hex.length !== 8) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function parseRgb(value) {
  const match = RGB.exec(value.trim());
  if (!match) return null;
  const body = match[1].replace(/\s*\/\s*/g, ' / ');
  const [rgbPart, alphaPart] = body.split('/').map((part) => part.trim());
  const parts = rgbPart.includes(',')
    ? rgbPart.split(',').map((part) => part.trim())
    : rgbPart.split(/\s+/);
  if (parts.length < 3) return null;
  const channel = (part) => {
    if (part.endsWith('%')) return Math.round((parseFloat(part) / 100) * 255);
    return parseFloat(part);
  };
  const r = channel(parts[0]);
  const g = channel(parts[1]);
  const b = channel(parts[2]);
  let a = 1;
  if (alphaPart !== undefined) {
    a = alphaPart.endsWith('%') ? parseFloat(alphaPart) / 100 : parseFloat(alphaPart);
  } else if (parts[3] !== undefined) {
    a = parseFloat(parts[3]);
  }
  if (![r, g, b, a].every(Number.isFinite)) return null;
  return { r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255), a: clamp(a, 0, 1) };
}

export function parseColor(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text) return null;
  if (text.startsWith('#')) return parseHex(text);
  if (/^rgba?\(/i.test(text)) return parseRgb(text);
  return null;
}

export function normalizeHex(value) {
  const parsed = parseColor(value);
  if (!parsed) return null;
  const hex = (channel) => Math.round(channel).toString(16).padStart(2, '0');
  return `#${hex(parsed.r)}${hex(parsed.g)}${hex(parsed.b)}`;
}

export function toRgbString(value) {
  const parsed = parseColor(value);
  if (!parsed) return null;
  return `rgb(${Math.round(parsed.r)} ${Math.round(parsed.g)} ${Math.round(parsed.b)})`;
}

function linearChannel(channel) {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(value) {
  const parsed = typeof value === 'string' ? parseColor(value) : value;
  if (!parsed) throw new Error(`Cannot parse color: ${value}`);
  const r = linearChannel(parsed.r);
  const g = linearChannel(parsed.g);
  const b = linearChannel(parsed.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground, background) {
  const fg = typeof foreground === 'string' ? parseColor(foreground) : foreground;
  const bg = typeof background === 'string' ? parseColor(background) : background;
  if (!fg || !bg) throw new Error(`Cannot parse colors: ${foreground} / ${background}`);
  if (fg.a < 1 || bg.a < 1) {
    throw new Error('Contrast requires opaque colors; composite translucent colors first.');
  }
  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

export function formatRatio(ratio) {
  return `${ratio.toFixed(2)}:1`;
}

export function contrastGrade(ratio, large = false) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return large ? 'AAA' : 'AA';
  if (ratio >= 3) return large ? 'AA' : 'AA-large';
  return 'fail';
}