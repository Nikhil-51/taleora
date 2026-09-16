const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');
const SOURCE_ICON = path.join(ASSETS_DIR, 'icon.png');

const TARGETS = [
    { name: 'adaptive-icon.png', width: 1024, height: 1024 },
    { name: 'splash-icon.png', width: 200, height: 200 },
    { name: 'favicon.png', width: 48, height: 48 },
    { name: 'android-icon-foreground.png', width: 432, height: 432 }
];

async function generateAssets() {
    if (!fs.existsSync(SOURCE_ICON)) {
        console.error(`Source icon not found at: ${SOURCE_ICON}`);
        process.exit(1);
    }

    console.log('Generating assets from icon.png...');

    let Jimp;
    try {
        Jimp = require('jimp');
    } catch (e) {
        console.log('Installing jimp...');
        execSync('npm install jimp', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        Jimp = require('jimp');
    }

    // Handle Jimp v1.0.0+ breaking changes vs v0.x
    if (Jimp.default) {
        Jimp = Jimp.default;
    }

    // Actually, 'jimp' v1.0+ might export { Jimp } named export
    if (!Jimp.read && !Jimp.prototype?.read && Jimp.Jimp) {
        Jimp = Jimp.Jimp;
    }

    console.log('Jimp loaded. Type:', typeof Jimp);

    try {
        // Jimp v0.x uses Jimp.read(), Jimp v1.0+ uses new Jimp() or static methods depending on exact version
        // Safest bet for both:
        let image;
        if (typeof Jimp.read === 'function') {
            image = await Jimp.read(SOURCE_ICON);
        } else {
            // Fallback for constructor usage if needed, or inspect
            console.log('Jimp.read is not a function. Keys:', Object.keys(Jimp));
            // Try constructor for "jimp" package if it's the class itself
            image = await Jimp.read(SOURCE_ICON); // Retry, maybe I missed something in logic, or let it fail to see error
        }

        if (!image) {
            throw new Error('Failed to load image');
        }

        for (const target of TARGETS) {
            const targetPath = path.join(ASSETS_DIR, target.name);
            const clonedImage = image.clone();

            await clonedImage.resize(target.width, target.height);
            await clonedImage.writeAsync(targetPath);
            console.log(`Generated ${target.name} (${target.width}x${target.height})`);
        }

        console.log('Asset generation complete!');
    } catch (error) {
        console.error('Error generating assets:', error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

generateAssets();
