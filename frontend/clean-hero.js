const sharp = require('sharp');
const path = require('path');

async function processHeroImage() {
  const inputPath = path.join(__dirname, 'public', 'hero-bg.jpg');
  const outputPath = path.join(__dirname, 'public', 'hero-bg-clean.jpg');

  const width = 460;
  const height = 120;

  // Extract clean cloud region from x: 500, y: 0
  const rawPatch = await sharp(inputPath)
    .extract({ left: 500, top: 0, width, height })
    .blur(14)
    .toBuffer();

  // Create alpha gradient mask SVG
  const maskSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="gX" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="gY" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <mask id="m">
          <rect width="${width}" height="${height}" fill="url(#gX)" />
          <rect width="${width}" height="${height}" fill="url(#gY)" style="mix-blend-mode: multiply;" />
        </mask>
      </defs>
      <rect width="${width}" height="${height}" fill="#ffffff" mask="url(#m)"/>
    </svg>
  `);

  const alphaMask = await sharp(maskSvg).toColourspace('b-w').toBuffer();

  const maskedPatch = await sharp(rawPatch)
    .ensureAlpha()
    .joinChannel(alphaMask)
    .toBuffer();

  await sharp(inputPath)
    .composite([{ input: maskedPatch, left: 0, top: 0 }])
    .toFile(outputPath);

  console.log("SUCCESS: hero-bg-clean.jpg created!");
}

processHeroImage().catch(console.error);
