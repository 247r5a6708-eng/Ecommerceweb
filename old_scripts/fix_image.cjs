const fs = require('fs');
let code = fs.readFileSync('src/components/SafeProductImage.tsx', 'utf8');

code = code.replace(
  `    if (imageObj && imageObj.verificationStatus !== 'verified') {
       setStatus('error');
       return;
    }
       // if we have an imageObj and it's not verified yet, or rejected
       // we might want to do something, but for now we'll just try to load
       if (imageObj.verificationStatus === 'rejected' || imageObj.verificationStatus === 'unavailable') {
         setStatus('error');
         return;
       }
    }`,
  `    if (imageObj && imageObj.verificationStatus !== 'verified') {
       setStatus('error');
       return;
    }`
);

fs.writeFileSync('src/components/SafeProductImage.tsx', code);
