import zlib from 'zlib';
import { createHash } from 'crypto';

function createChunk(type: string, data: Buffer): Buffer {
  const length = data.length;
  const chunk = Buffer.alloc(length + 12);

  // Length
  chunk.writeUInt32BE(length, 0);

  // Type
  chunk.write(type, 4);

  // Data
  data.copy(chunk, 8);

  // CRC
  const crc = createHash('crc32').update(chunk.slice(4, length + 8)).digest();
  crc.copy(chunk, length + 8);

  return chunk;
}

function generatePNGFile(filename: string): Buffer {
  // PNG header
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const width = 1;
  const height = 1;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk - generate different pixel data based on filename
  let pixelData: Buffer;
  if (filename.includes('similar')) {
    // For similar images, use a slightly off-white pixel
    pixelData = Buffer.from([0xFF, 0xFE, 0xFE, 0xFF]); // Very slightly pink
  } else if (filename.includes('different')) {
    // For different images, use a blue pixel
    pixelData = Buffer.from([0x00, 0x00, 0xFF, 0xFF]); // Blue
  } else {
    // Default to white pixel
    pixelData = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]); // White
  }

  const idatData = zlib.deflateSync(pixelData);
  const idatChunk = createChunk('IDAT', idatData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  // Combine all chunks
  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

export { generatePNGFile }; 