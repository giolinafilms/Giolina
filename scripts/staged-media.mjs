import {createHash} from 'node:crypto';
// Compare against release hashes recorded only after the derivative was decoded.
export function verifyStagedImage(bytes,expected){
 if(bytes.length<1000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||!expected||createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Staged image integrity check failed');
}
