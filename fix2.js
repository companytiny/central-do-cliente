const fs = require('fs');
const files = ['postagens.html', 'criativos.html'];

files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');
    
    // Remove playsinline
    code = code.replace(/\?playsinline=1/g, '');
    
    // Replace the mobile block height/aspect-ratio logic
    const oldMobileLogic = `ifr.style.aspectRatio = dynamicAspectRatio;
                            ifr.style.height = 'auto';`;
                            
    const newMobileLogic = `ifr.style.height = '100%';
                            carouselContainer.style.height = '100%';
                            wrapper.style.height = '100%';`;
                            
    code = code.replace(oldMobileLogic, newMobileLogic);
    
    fs.writeFileSync(f, code);
    console.log(f, 'patched');
});
