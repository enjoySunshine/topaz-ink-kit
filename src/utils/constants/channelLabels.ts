import type { ImageColorModel } from './colorModels.ts';

export const channelLabels = {
  GREY: ['Grey'],
  GREYA: ['Grey', 'Alpha'],
  RGB: ['Red', 'Green', 'Blue'],
  RGBA: ['Red', 'Green', 'Blue', 'Alpha'],
  HSV: ['Hue', 'Saturation', 'Value'],
  HSVA: ['Hue', 'Saturation', 'Value', 'Alpha'],
  BINARY: ['Mask'],
} as const satisfies Record<ImageColorModel, readonly string[]>;
