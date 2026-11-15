import { Image } from '../Image.ts';
import type { Mask } from '../Mask.ts';
import type { ImageColorModel } from '../utils/constants/colorModels.ts';
import { getOutputImage, maskToOutputImage } from '../utils/getOutputImage.ts';

export interface ConvertColorOptions {
  /**
   * Image to which to output.
   */
  out?: Image;
}

/**
 * Convert image to a different color model.
 * @param image - Image to convert.
 * @param colorModel - New color model.
 * @param options - Convert color options.
 * @returns The converted image.
 */
export function convertColor(
  image: Image | Mask,
  colorModel: ImageColorModel,
  options: ConvertColorOptions = {},
): Image {
  const canConvert = new Map<ImageColorModel, ImageColorModel[]>([
    ['GREY', ['GREYA', 'RGB', 'RGBA']],
    ['GREYA', ['GREY', 'RGB', 'RGBA']],
    ['RGB', ['GREY', 'GREYA', 'RGBA', 'HSV', 'HSVA']],
    ['RGBA', ['GREY', 'GREYA', 'RGB', 'HSV', 'HSVA']],
    ['HSV', ['RGB', 'RGBA', 'HSVA']],
    ['HSVA', ['RGB', 'RGBA', 'HSV']],
    ['BINARY', ['GREY', 'RGB', 'RGBA']],
  ]);

  if (image.colorModel === colorModel && colorModel !== 'BINARY') {
    return getOutputImage(
      image as Image,
      { out: options.out },
      { clone: true },
    );
  }

  const canConvertTo = canConvert.get(image.colorModel);
  if (!canConvertTo?.includes(colorModel)) {
    throw new RangeError(
      `conversion from ${image.colorModel} to ${colorModel} not implemented`,
    );
  }

  if (image instanceof Image) {
    const output = getOutputImage(image, options, {
      newParameters: { colorModel },
    });

    if (image.colorModel === 'GREY' || image.colorModel === 'GREYA') {
      convertGreyToAny(image, output);
    }

    if (image.colorModel === 'RGB' || image.colorModel === 'RGBA') {
      if (colorModel === 'RGB' || colorModel === 'RGBA') {
        convertRgbToRgb(image, output);
      } else if (colorModel === 'HSV' || colorModel === 'HSVA') {
        convertRgbToHsv(image, output);
      } else {
        // GREYA or GREY
        convertRgbToGrey(image, output);
      }
    }

    if (image.colorModel === 'HSV' || image.colorModel === 'HSVA') {
      if (colorModel === 'RGB' || colorModel === 'RGBA') {
        convertHsvToRgb(image, output);
      } else {
        // HSVA or HSV
        convertHsvToHsv(image, output);
      }
    }

    if (!image.alpha && output.alpha) {
      output.fillAlpha(output.maxValue);
    }

    if (image.alpha && output.alpha) {
      copyAlpha(image, output);
    }
    return output;
  } else if (colorModel === 'GREY') {
    const output = maskToOutputImage(image, options);
    convertBinaryToGrey(image, output);
    return output;
  } else {
    const img = new Image(image.width, image.height, {
      colorModel,
    });
    convertBinaryToRgb(image, img);
    return img;
  }
}

/**
 * Copy alpha channel of source to dest.
 * @param source - Source image.
 * @param dest - Destination image.
 */
export function copyAlpha(source: Image, dest: Image): void {
  if (source.size !== dest.size) {
    throw new RangeError('source and destination have different sizes');
  }
  if (!source.alpha) {
    throw new RangeError('source image does not have alpha');
  }
  if (!dest.alpha) {
    throw new RangeError('destination does not have alpha');
  }

  for (let i = 0; i < dest.size; i++) {
    dest.setValueByIndex(
      i,
      dest.channels - 1,
      source.getValueByIndex(i, source.channels - 1),
    );
  }
}

/**
 * Convert grey image to other color model.
 * @param image - Image to convert.
 * @param newImage - Converted image.
 */
function convertGreyToAny(image: Image, newImage: Image): void {
  for (let i = 0; i < image.size; i++) {
    for (let j = 0; j < newImage.components; j++) {
      newImage.setValueByIndex(i, j, image.getValueByIndex(i, 0));
    }
  }
}

/**
 * Convert RGB image to RGB. Allows to use convert with an RGB target whatever the image color model is.
 * @param image - Image to convert.
 * @param newImage - Converted image.
 */
function convertRgbToRgb(image: Image, newImage: Image): void {
  for (let i = 0; i < image.size; i++) {
    for (let j = 0; j < 3; j++) {
      newImage.setValueByIndex(i, j, image.getValueByIndex(i, j));
    }
  }
}

/**
 * Convert RGB image to GREY.
 * @param image - Image to convert.
 * @param newImage - Converted image.
 */
function convertRgbToGrey(image: Image, newImage: Image): void {
  for (let i = 0; i < image.size; i++) {
    const r = image.getValueByIndex(i, 0);
    const g = image.getValueByIndex(i, 1);
    const b = image.getValueByIndex(i, 2);
    newImage.setValueByIndex(
      i,
      0,
      Math.round(0.299 * r + 0.587 * g + 0.114 * b),
    );
  }
}

/**
 * Convert RGB image to HSV. Hue, saturation and value are all scaled
 * to the image bit depth (0-255 for 8-bit images).
 * @param image - Image to convert.
 * @param newImage - Converted image.
 */
function convertRgbToHsv(image: Image, newImage: Image): void {
  const maxValue = image.maxValue;
  for (let i = 0; i < image.size; i++) {
    const r = image.getValueByIndex(i, 0);
    const g = image.getValueByIndex(i, 1);
    const b = image.getValueByIndex(i, 2);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let hue = 0;
    if (delta !== 0) {
      if (max === r) {
        hue = 60 * (((g - b) / delta) % 6);
      } else if (max === g) {
        hue = 60 * ((b - r) / delta + 2);
      } else {
        hue = 60 * ((r - g) / delta + 4);
      }
      if (hue < 0) {
        hue += 360;
      }
    }

    const saturation = max === 0 ? 0 : Math.round((delta / max) * maxValue);

    newImage.setValueByIndex(i, 0, Math.floor((hue * maxValue) / 360));
    newImage.setValueByIndex(i, 1, saturation);
    newImage.setValueByIndex(i, 2, max);
  }
}

/**
 * Convert HSV image to RGB. Hue, saturation and value are expected to be
 * scaled to the image bit depth (0-255 for 8-bit images).
 * @param image - Image to convert.
 * @param newImage - Converted image.
 */
function convertHsvToRgb(image: Image, newImage: Image): void {
  const maxValue = image.maxValue;
  for (let i = 0; i < image.size; i++) {
    const hue = (image.getValueByIndex(i, 0) * 360) / maxValue;
    const saturation = image.getValueByIndex(i, 1) / maxValue;
    const value = image.getValueByIndex(i, 2) / maxValue;

    const c = value * saturation;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = value - c;

    let r, g, b;
    if (hue < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (hue < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (hue < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (hue < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (hue < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    newImage.setValueByIndex(i, 0, Math.round((r + m) * maxValue));
    newImage.setValueByIndex(i, 1, Math.round((g + m) * maxValue));
    newImage.setValueByIndex(i, 2, Math.round((b + m) * maxValue));
  }
}

/**
 * Convert HSV image to HSV. Allows to use convert with an HSV target whatever the image color model is.
 * @param image - Image to convert.
 * @param newImage - Converted image.
 */
function convertHsvToHsv(image: Image, newImage: Image): void {
  for (let i = 0; i < image.size; i++) {
    for (let j = 0; j < 3; j++) {
      newImage.setValueByIndex(i, j, image.getValueByIndex(i, j));
    }
  }
}

/**
 * Convert Mask to GREY.
 * @param mask - Mask to convert.
 * @param newImage - Converted image.
 */
export function convertBinaryToGrey(mask: Mask, newImage: Image): void {
  for (let i = 0; i < mask.size; i++) {
    newImage.setValueByIndex(
      i,
      0,
      mask.getBitByIndex(i) ? newImage.maxValue : 0,
    );
  }
}

/**
 * Convert mask to RGB or RGBA.
 * @param mask - Mask to convert.
 * @param newImage - Converted image.
 */
export function convertBinaryToRgb(mask: Mask, newImage: Image): void {
  const black = new Array(newImage.components).fill(0);
  const white = new Array(newImage.components).fill(newImage.maxValue);
  if (newImage.alpha) {
    black.push(newImage.maxValue);
    white.push(newImage.maxValue);
  }
  for (let i = 0; i < mask.size; i++) {
    newImage.setPixelByIndex(i, mask.getBitByIndex(i) ? white : black);
  }
}
