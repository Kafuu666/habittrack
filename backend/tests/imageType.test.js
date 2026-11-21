const test = require('node:test');
const assert = require('node:assert/strict');
const { detectImageType } = require('../src/utils/imageType');

const pad = (...bytes) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(16)]);

test('mengenali JPEG dari byte awal', () => {
  assert.deepEqual(detectImageType(pad(0xff, 0xd8, 0xff, 0xe0)), { mime: 'image/jpeg', ext: 'jpg' });
});

test('mengenali PNG dari signature 8 byte', () => {
  const png = pad(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  assert.deepEqual(detectImageType(png), { mime: 'image/png', ext: 'png' });
});

test('mengenali WebP (RIFF....WEBP)', () => {
  const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([1, 2, 3, 4]), Buffer.from('WEBPVP8 '), Buffer.alloc(8)]);
  assert.deepEqual(detectImageType(webp), { mime: 'image/webp', ext: 'webp' });
});

test('menolak file yang bukan gambar walau diberi nama .jpg', () => {
  assert.equal(detectImageType(Buffer.from('<?php echo 1; ?> ini bukan gambar sama sekali')), null);
  assert.equal(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), null);
});

test('menolak GIF, buffer pendek, dan nilai bukan Buffer', () => {
  assert.equal(detectImageType(Buffer.from('GIF89a' + 'x'.repeat(20))), null);
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff])), null);
  assert.equal(detectImageType(null), null);
  assert.equal(detectImageType('string'), null);
});
