// Create test images programmatically
const fs = require('fs');
const { createCanvas } = require('canvas');

// If canvas is not available, create simple placeholder files
function createSimpleImage(filename) {
    // Create a simple SVG-based placeholder
    const svg = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
  <rect width="500" height="500" fill="#0f5132"/>
  <text x="250" y="250" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
    Test Image
  </text>
</svg>`;
    
    // For now, just create a placeholder text file
    fs.writeFileSync(filename.replace('.jpg', '.txt'), 'Test image placeholder');
    return filename.replace('.jpg', '.txt');
}

async function createTestImages() {
    console.log('🖼️ Creating test images...');
    
    const images = [];
    
    for (let i = 1; i <= 3; i++) {
        const filename = `test_product_${i}.jpg`;
        
        try {
            // Create a simple bitmap manually
            const width = 500;
            const height = 500;
            const data = new Uint8Array(width * height * 3);
            
            // Fill with green color
            for (let j = 0; j < data.length; j += 3) {
                data[j] = 15;     // R
                data[j + 1] = 81;  // G
                data[j + 2] = 50; // B
            }
            
            // Create a simple BMP file
            const bmp = createBMP(width, height, data);
            fs.writeFileSync(filename, bmp);
            
            images.push(filename);
            console.log(`   ✅ Created: ${filename}`);
        } catch (error) {
            // Create a simple text file instead
            const txtFilename = `test_product_${i}.txt`;
            fs.writeFileSync(txtFilename, `Test product image ${i}`);
            images.push(txtFilename);
            console.log(`   ✅ Created placeholder: ${txtFilename}`);
        }
    }
    
    return images;
}

function createBMP(width, height, data) {
    const fileSize = 54 + data.length;
    const header = Buffer.alloc(54);
    
    // BMP header
    header.write('BM', 0, 2); // Signature
    header.writeUInt32LE(fileSize, 2); // File size
    header.writeUInt32LE(0, 6); // Reserved
    header.writeUInt32LE(54, 10); // Data offset
    header.writeUInt32LE(40, 14); // Header size
    header.writeInt32LE(width, 18); // Width
    header.writeInt32LE(-height, 22); // Height (negative = top-down)
    header.writeUInt16LE(1, 26); // Planes
    header.writeUInt16LE(24, 28); // Bits per pixel
    header.writeUInt32LE(0, 30); // Compression
    header.writeUInt32LE(data.length, 34); // Image size
    header.writeUInt32LE(0, 38); // X pixels per meter
    header.writeUInt32LE(0, 42); // Y pixels per meter
    header.writeUInt32LE(0, 46); // Colors used
    header.writeUInt32LE(0, 50); // Important colors
    
    return Buffer.concat([header, Buffer.from(data)]);
}

if (require.main === module) {
    createTestImages()
        .then(images => {
            console.log(`\n✅ Created ${images.length} test images`);
            console.log('\nImages ready for upload test!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error creating images:', error);
            process.exit(1);
        });
} else {
    module.exports = { createTestImages };
}
