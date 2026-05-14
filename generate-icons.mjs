import sharp from "sharp";

async function makeIcon(size) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#003087" rx="${size * 0.15}"/>
    <text x="50%" y="55%" font-family="Arial" font-size="${size * 0.45}" font-weight="bold"
      fill="white" text-anchor="middle" dominant-baseline="middle">T</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`public/icon-${size}.png`);
  console.log(`Generated icon-${size}.png`);
}

await makeIcon(192);
await makeIcon(512);
