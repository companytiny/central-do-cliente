const fs = require('fs');

['postagens.html', 'criativos.html'].forEach(f => {
    try {
        const content = fs.readFileSync(f, 'utf8');
        // Extract script content
        let startIndex = 0;
        let scriptCount = 0;
        while(true) {
            const start = content.indexOf('<script', startIndex);
            if(start === -1) break;
            const endStart = content.indexOf('>', start);
            const end = content.indexOf('</script>', endStart);
            if(end === -1) break;
            
            const scriptContent = content.substring(endStart + 1, end);
            try {
                new Function(scriptContent);
                console.log(f, 'Script', scriptCount, 'OK');
            } catch(e) {
                console.log(f, 'Script', scriptCount, 'ERROR:', e.message);
                const lines = scriptContent.split('\n');
                // find the line
                const stack = e.stack.split('\n');
                console.log(stack[0]);
            }
            scriptCount++;
            startIndex = end + 9;
        }
    } catch(e) {
        console.log(f, 'Read ERROR:', e.message);
    }
});
