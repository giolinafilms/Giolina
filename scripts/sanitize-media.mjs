import {readFileSync,writeFileSync,readdirSync} from 'node:fs';

// Remove private EXIF/XMP/IPTC/comments without decoding or recompressing photos.
// Retain ICC profiles and other color information. Images must be upright first.
function jpeg(data){
 if(data[0]!==255||data[1]!==216)throw Error('Invalid JPEG');
 const parts=[data.subarray(0,2)];let pos=2;
 while(pos<data.length){
  const start=pos;if(data[pos++]!==255)throw Error('Invalid JPEG marker');
  while(data[pos]===255)pos++;
  const marker=data[pos++];
  if(marker===218||marker===217){parts.push(data.subarray(start));return Buffer.concat(parts);}
  const length=data.readUInt16BE(pos);if(length<2||pos+length>data.length)throw Error('Invalid JPEG segment');
  const end=pos+length;
  if(![225,237,254].includes(marker))parts.push(data.subarray(start,end));
  pos=end;
 }
 throw Error('Incomplete JPEG');
}
function png(data){
 const signature=Buffer.from([137,80,78,71,13,10,26,10]);
 if(!data.subarray(0,8).equals(signature))throw Error('Invalid PNG');
 const parts=[data.subarray(0,8)];let pos=8;
 while(pos<data.length){
  const length=data.readUInt32BE(pos),end=pos+length+12;
  if(end>data.length)throw Error('Invalid PNG chunk');
  const type=data.toString('ascii',pos+4,pos+8);
  if(!['eXIf','tEXt','iTXt','zTXt'].includes(type))parts.push(data.subarray(pos,end));
  pos=end;
 }
 return Buffer.concat(parts);
}
let count=0;
for(const name of readdirSync('public/assets')){
 const path='public/assets/'+name,extension=name.split('.').at(-1).toLowerCase();
 if(!['jpg','jpeg','png'].includes(extension))continue;
 const input=readFileSync(path),output=extension==='png'?png(input):jpeg(input);
 if(!input.equals(output)){writeFileSync(path,output);count++;}
}
console.log(`Removed private metadata from ${count} images; compressed image data retained.`);
