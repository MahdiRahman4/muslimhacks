const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
    table[i] = crc >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeU16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function writeU32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

export interface ZipEntry {
  name: string;
  content: string;
}

export interface ZipBinaryEntry {
  name: string;
  data: Uint8Array;
}

/**
 * Uncompressed ZIP. Fine for CSVs and PDFs, and it keeps the worker dependency-free.
 */
export function zipBinaryFiles(files: ZipBinaryEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const entries = files.map((file) => {
    const nameBytes = encoder.encode(file.name.replace(/[/\\]/g, "-"));
    return { nameBytes, data: file.data, crc: crc32(file.data) };
  });

  const localSize = entries.reduce(
    (sum, entry) => sum + 30 + entry.nameBytes.length + entry.data.length,
    0,
  );
  const centralSize = entries.reduce(
    (sum, entry) => sum + 46 + entry.nameBytes.length,
    0,
  );
  const buffer = new ArrayBuffer(localSize + centralSize + 22);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  let localOffset = 0;
  const localOffsets: number[] = [];

  for (const entry of entries) {
    localOffsets.push(localOffset);
    writeU32(view, localOffset, 0x04034b50);
    writeU16(view, localOffset + 4, 20);
    writeU16(view, localOffset + 6, 0);
    writeU16(view, localOffset + 8, 0);
    writeU16(view, localOffset + 10, 0);
    writeU16(view, localOffset + 12, 0);
    writeU32(view, localOffset + 14, entry.crc);
    writeU32(view, localOffset + 18, entry.data.length);
    writeU32(view, localOffset + 22, entry.data.length);
    writeU16(view, localOffset + 26, entry.nameBytes.length);
    writeU16(view, localOffset + 28, 0);
    bytes.set(entry.nameBytes, localOffset + 30);
    bytes.set(entry.data, localOffset + 30 + entry.nameBytes.length);
    localOffset += 30 + entry.nameBytes.length + entry.data.length;
  }

  let centralOffset = localOffset;
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    writeU32(view, centralOffset, 0x02014b50);
    writeU16(view, centralOffset + 4, 20);
    writeU16(view, centralOffset + 6, 20);
    writeU16(view, centralOffset + 8, 0);
    writeU16(view, centralOffset + 10, 0);
    writeU16(view, centralOffset + 12, 0);
    writeU16(view, centralOffset + 14, 0);
    writeU32(view, centralOffset + 16, entry.crc);
    writeU32(view, centralOffset + 20, entry.data.length);
    writeU32(view, centralOffset + 24, entry.data.length);
    writeU16(view, centralOffset + 28, entry.nameBytes.length);
    writeU16(view, centralOffset + 30, 0);
    writeU16(view, centralOffset + 32, 0);
    writeU16(view, centralOffset + 34, 0);
    writeU16(view, centralOffset + 36, 0);
    writeU32(view, centralOffset + 38, 0);
    writeU32(view, centralOffset + 42, localOffsets[i]);
    bytes.set(entry.nameBytes, centralOffset + 46);
    centralOffset += 46 + entry.nameBytes.length;
  }

  writeU32(view, centralOffset, 0x06054b50);
  writeU16(view, centralOffset + 4, 0);
  writeU16(view, centralOffset + 6, 0);
  writeU16(view, centralOffset + 8, entries.length);
  writeU16(view, centralOffset + 10, entries.length);
  writeU32(view, centralOffset + 12, centralOffset - localOffset);
  writeU32(view, centralOffset + 16, localOffset);
  writeU16(view, centralOffset + 20, 0);

  return bytes;
}

export function zipTextFiles(files: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  return zipBinaryFiles(
    files.map((file) => ({
      name: file.name,
      data: encoder.encode(file.content),
    })),
  );
}
