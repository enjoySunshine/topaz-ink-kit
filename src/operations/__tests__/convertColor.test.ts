import { expect, test } from 'vitest';

import { createImageFromData } from '../../../test/createImageFromData.ts';

test('GREY to GREYA', () => {
  const image = testUtils.createGreyImage([
    [10, 30],
    [50, 70],
  ]);

  const converted = image.convertColor('GREYA');

  expect(converted).toMatchImageData([
    [10, 255, 30, 255],
    [50, 255, 70, 255],
  ]);
});

test('GREYA to GREY', () => {
  const image = testUtils.createGreyaImage([
    [10, 100, 30, 100],
    [50, 100, 70, 100],
  ]);

  const converted = image.convertColor('GREY');

  expect(converted).toMatchImageData([
    [10, 30],
    [50, 70],
  ]);
});

test('GREY to RGB', () => {
  const image = testUtils.createGreyImage([
    [10, 30],
    [50, 70],
  ]);

  const converted = image.convertColor('RGB');

  expect(converted).toMatchImageData([
    [10, 10, 10, 30, 30, 30],
    [50, 50, 50, 70, 70, 70],
  ]);
});

test('GREYA to RGB', () => {
  const image = testUtils.createGreyaImage([
    [10, 100, 30, 100],
    [50, 100, 70, 100],
  ]);

  const converted = image.convertColor('RGB');

  expect(converted).toMatchImageData([
    [10, 10, 10, 30, 30, 30],
    [50, 50, 50, 70, 70, 70],
  ]);
});

test('GREY to RGBA', () => {
  const image = testUtils.createGreyImage([
    [10, 30],
    [50, 70],
  ]);

  const converted = image.convertColor('RGBA');

  expect(converted).toMatchImageData([
    [10, 10, 10, 255, 30, 30, 30, 255],
    [50, 50, 50, 255, 70, 70, 70, 255],
  ]);
});

test('GREYA to RGBA', () => {
  const image = testUtils.createGreyaImage([
    [10, 100, 30, 100],
    [50, 100, 70, 100],
  ]);

  const converted = image.convertColor('RGBA');

  expect(converted).toMatchImageData([
    [10, 10, 10, 100, 30, 30, 30, 100],
    [50, 50, 50, 100, 70, 70, 70, 100],
  ]);
});

test('RGB to RGBA', () => {
  const image = testUtils.createRgbImage([[10, 20, 30, 40, 60, 70]]);

  const converted = image.convertColor('RGBA');

  expect(converted).toMatchImageData([[10, 20, 30, 255, 40, 60, 70, 255]]);
});

test('RGBA to RGB', () => {
  const image = testUtils.createRgbaImage([[10, 20, 30, 100, 40, 60, 70, 100]]);

  const converted = image.convertColor('RGB');

  expect(converted).toMatchImageData([[10, 20, 30, 40, 60, 70]]);
});

test('Mask to GREY', () => {
  const mask = testUtils.createMask([
    [1, 1],
    [0, 0],
  ]);

  const img = mask.convertColor('GREY');

  expect(img).toMatchImageData([
    [255, 255],
    [0, 0],
  ]);
});

test('Mask to RGBA', () => {
  const mask = testUtils.createMask(`
    0 0
    1 0
    0 1
  `);

  const img = mask.convertColor('RGBA');

  expect(img).toMatchImageData([
    [0, 0, 0, 255, 0, 0, 0, 255],
    [255, 255, 255, 255, 0, 0, 0, 255],
    [0, 0, 0, 255, 255, 255, 255, 255],
  ]);
});

test('Mask to RGB', () => {
  const mask = testUtils.createMask(`
    0 0
    1 0
    0 1
  `);

  const img = mask.convertColor('RGB');

  expect(img).toMatchImageData([
    [0, 0, 0, 0, 0, 0],
    [255, 255, 255, 0, 0, 0],
    [0, 0, 0, 255, 255, 255],
  ]);
});

test('conversion not implemented', () => {
  const image = testUtils.createGreyImage([[0, 255, 0, 255, 0, 255]]);

  expect(() => image.convertColor('BINARY')).toThrow(
    /conversion from GREY to BINARY not implemented/,
  );
});

test('convert to same colorModel', () => {
  const image = testUtils.createRgbImage([[10, 20, 30, 40, 60, 70]]);
  const result = image.convertColor('RGB');

  expect(result).toStrictEqual(image);
});

test('GREY to RGBA 16-bit', () => {
  const image = testUtils.createGreyImage([[256, 512, 768, 1024]]);

  const converted = image.convertColor('RGBA');

  expect(converted).toMatchImageData([
    [
      256, 256, 256, 65535, 512, 512, 512, 65535, 768, 768, 768, 65535, 1024,
      1024, 1024, 65535,
    ],
  ]);
});

test('image to GREY', () => {
  const testImage = testUtils.load('opencv/test.png');
  const grey = testImage.convertColor('GREY');
  const expected = testUtils.createGreyImage([
    [255, 255, 255, 255, 255, 255, 255, 255],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 76, 76, 255, 255, 179, 179, 0],
    [0, 76, 76, 255, 255, 179, 179, 0],
    [0, 150, 150, 0, 0, 105, 105, 0],
    [0, 150, 150, 0, 0, 105, 105, 0],
    [0, 29, 29, 128, 128, 226, 226, 0],
    [0, 29, 29, 128, 128, 226, 226, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [255, 255, 255, 255, 255, 255, 255, 255],
  ]);

  expect(grey).toMatchImage(expected);
});

test.each([
  { rgb: [200, 80, 40], hsv: [10, 204, 200] },
  { rgb: [255, 0, 0], hsv: [0, 255, 255] },
  { rgb: [0, 255, 0], hsv: [85, 255, 255] },
  { rgb: [0, 0, 255], hsv: [170, 255, 255] },
  { rgb: [255, 255, 0], hsv: [42, 255, 255] },
  { rgb: [0, 255, 255], hsv: [127, 255, 255] },
  { rgb: [255, 0, 255], hsv: [212, 255, 255] },
  { rgb: [100, 60, 20], hsv: [21, 204, 100] },
  { rgb: [7, 1, 4], hsv: [233, 219, 7] },
  { rgb: [40, 40, 40], hsv: [0, 0, 40] },
  { rgb: [0, 0, 0], hsv: [0, 0, 0] },
  { rgb: [255, 255, 255], hsv: [0, 0, 255] },
])('RGB $rgb to HSV $hsv', ({ rgb, hsv }) => {
  const image = testUtils.createRgbImage([rgb]);

  const converted = image.convertColor('HSV');

  expect(converted).toMatchImageData([hsv]);
});

test.each([
  { hsv: [10, 204, 200], rgb: [200, 78, 40] },
  { hsv: [0, 255, 255], rgb: [255, 0, 0] },
  { hsv: [85, 255, 255], rgb: [0, 255, 0] },
  { hsv: [170, 255, 255], rgb: [0, 0, 255] },
  { hsv: [42, 255, 255], rgb: [255, 252, 0] },
  { hsv: [127, 255, 255], rgb: [0, 255, 252] },
  { hsv: [212, 255, 255], rgb: [252, 0, 255] },
  { hsv: [21, 204, 100], rgb: [100, 60, 20] },
  { hsv: [233, 219, 7], rgb: [7, 1, 4] },
  { hsv: [0, 0, 40], rgb: [40, 40, 40] },
  { hsv: [0, 0, 0], rgb: [0, 0, 0] },
  { hsv: [0, 0, 255], rgb: [255, 255, 255] },
])('HSV $hsv to RGB $rgb', ({ hsv, rgb }) => {
  const image = createImageFromData([hsv], 'HSV');

  const converted = image.convertColor('RGB');

  expect(converted).toMatchImageData([rgb]);
});

test('RGB to HSV and back', () => {
  const image = testUtils.createRgbImage([[200, 80, 40]]);

  const converted = image.convertColor('HSV').convertColor('RGB');

  expect(converted).toMatchImageData([[200, 78, 40]]);
});

test('RGBA to HSVA and back keeps alpha', () => {
  const image = testUtils.createRgbaImage([[200, 80, 40, 90]]);

  const hsva = image.convertColor('HSVA');

  expect(hsva).toMatchImageData([[10, 204, 200, 90]]);

  const rgba = hsva.convertColor('RGBA');

  expect(rgba).toMatchImageData([[200, 78, 40, 90]]);
});

test('RGB to HSVA adds opaque alpha', () => {
  const image = testUtils.createRgbImage([[200, 80, 40]]);

  const converted = image.convertColor('HSVA');

  expect(converted).toMatchImageData([[10, 204, 200, 255]]);
});

test('HSV to RGBA adds opaque alpha', () => {
  const image = createImageFromData([[10, 204, 200]], 'HSV');

  const converted = image.convertColor('RGBA');

  expect(converted).toMatchImageData([[200, 78, 40, 255]]);
});

test('HSV to HSVA and HSVA to HSV', () => {
  const image = createImageFromData([[10, 204, 200]], 'HSV');

  const hsva = image.convertColor('HSVA');

  expect(hsva).toMatchImageData([[10, 204, 200, 255]]);

  const hsv = hsva.convertColor('HSV');

  expect(hsv).toMatchImageData([[10, 204, 200]]);
});

test('HSV conversion does not modify the original image', () => {
  const image = testUtils.createRgbImage([[200, 80, 40]]);

  image.convertColor('HSV');

  expect(image).toMatchImageData([[200, 80, 40]]);
});

test('split HSV image into hue, saturation and value channels', () => {
  const image = testUtils.createRgbImage([[200, 80, 40, 255, 0, 0]]);

  const [hue, saturation, value] = image.convertColor('HSV').split();

  expect(hue).toMatchImageData([[10, 0]]);
  expect(saturation).toMatchImageData([[204, 255]]);
  expect(value).toMatchImageData([[200, 255]]);
});

test('RGB to GREY conversion is unchanged', () => {
  const image = testUtils.createRgbImage([[200, 80, 40]]);

  const converted = image.convertColor('GREY');

  expect(converted).toMatchImageData([[111]]);
});

test('RGBA to GREYA keeps alpha', () => {
  const image = testUtils.createRgbaImage([[200, 80, 40, 90]]);

  const converted = image.convertColor('GREYA');

  expect(converted).toMatchImageData([[111, 90]]);
});

test('HSV to GREY not implemented', () => {
  const image = createImageFromData([[10, 204, 200]], 'HSV');

  expect(() => image.convertColor('GREY')).toThrow(
    /conversion from HSV to GREY not implemented/,
  );
});
