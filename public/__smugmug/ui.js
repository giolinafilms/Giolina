// Private discovery session only; no credentials or OAuth tokens in exports/storage.
const base='/__smugmug/';
const status=document.querySelector('#status');
const csrf=document.querySelector('[name=csrf]').value;
let report=null;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function requestJson(path,options={}) {
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
 try {
  const response=await fetch(path,{...options,cache:'no-store',signal:controller.signal});
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('The authorization endpoint returned an unexpected page. No credentials were exposed.');
  return {response,data:await response.json()};
 } catch(error) {
  if(error.name==='AbortError')throw new Error('The connection request timed out. You can try again; no archive changes were made.');
  throw error;
 } finally {clearTimeout(timer);}
}
async function post(action,body={}) {
 for(let attempt=0;attempt<4;attempt++) {
  const {response,data}=await requestJson(base+action,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,csrf})});
  if(response.ok)return data;
  if(data.upstreamStatus===429 && attempt<3){status.textContent='SmugMug rate limit reached; waiting before another read…';await sleep(5000*(attempt+1));continue;}
  throw new Error(data.error==='runtime_credentials_identical'?'The API key and API secret bindings contain the same value. SmugMug requires the distinct API secret for that key. No values were exposed.':data.error==='smugmug_timeout'?'SmugMug did not respond within 20 seconds. You can try again.':data.error==='runtime_secrets_missing'?'The Worker cannot see both runtime secrets.':data.error==='session_expired'?'Session expired. Reload and authorize again.':data.error==='smugmug_request_failed'?`SmugMug did not accept this request${data.upstreamStatus?' (HTTP '+data.upstreamStatus+')':''}${data.stage?' — '+data.stage:''}${data.oauthProblem?' — '+data.oauthProblem:''}. No archive changes were made.`:data.error);
 }
}
const read=path=>post('read',{path});
function uri(value){return value?.Uri || value;}
function withPage(path,start=1,count=100){const target=new URL(path,'https://api.smugmug.com');target.searchParams.set('start',start);target.searchParams.set('count',count);return target.pathname+target.search;}
async function pages(path,key) {
 const items=[];let start=1;const seen=new Set();
 while(true){
  const response=(await read(withPage(path,start))).Response;
  if(!response)throw new Error('SmugMug returned no readable response.');
  const batch=response[key];
  if(!Array.isArray(batch))throw new Error('Unexpected '+key+' response.');
  for(const item of batch){const id=item.Uri || item.NodeID || item.AlbumKey || item.ImageKey;
   if(!id || !seen.has(id)){items.push(item);if(id)seen.add(id);}}
  if(!response.Pages?.NextPage || batch.length===0)break;
  const next=new URL(uri(response.Pages.NextPage),'https://api.smugmug.com');
  const nextStart=+next.searchParams.get('start');
  if(!Number.isInteger(nextStart) || nextStart<=start)throw new Error('Pagination stopped because the next page was invalid.');
  start=nextStart;
 }
 return items;
}
function fields(value,names){const output={};for(const name of names)if(value?.[name]!==undefined)output[name]=value[name];return output;}
const nodeFields=['NodeID','Type','Name','Description','Privacy','WebUri','DateAdded','DateModified','UrlName'];
const albumFields=['AlbumKey','Name','Description','Privacy','ImageCount','Date','ImagesLastUpdated','LastUpdated','WebUri','External','LargestSize','UrlName'];
const imageFields=['ImageKey','Serial','FileName','OriginalWidth','OriginalHeight','Title','Caption','Date','DateTimeOriginal','DateTimeCreated','LastUpdated','KeywordsArray','Hidden','IsVideo','WebUri','ThumbnailUrl','ArchivedUri'];
function message(){document.querySelector('#summary').textContent=JSON.stringify(report.summary,null,2);document.querySelector('#download').hidden=false;}
function recompute(){report.summary={folders:report.folders.length,galleries:report.albums.length,
 imagesReported:report.albums.reduce((total,a)=>total+(Number.isFinite(a.ImageCount)?a.ImageCount:0),0),
 galleriesWithoutImageCount:report.albums.filter(a=>!Number.isFinite(a.ImageCount)).length,
 privacy:report.albums.reduce((totals,a)=>{const p=a.Privacy || a.nodePrivacy || 'Not returned';totals[p]=(totals[p]||0)+1;return totals;},{}),
 imageMetadataRecords:report.albums.reduce((total,a)=>total+(a.images?.length||0),0),
 errors:report.errors.length,folderAndGalleryInventoryComplete:report.structureComplete,
 allImageMetadataComplete:report.imagesComplete};message();}
function connected(account){status.textContent='Connected read-only to '+(account.Name || account.NickName || 'your account')+'.';
 document.querySelector('#connect').hidden=true;document.querySelector('#authorize').hidden=true;document.querySelector('#discovery').hidden=false;}
document.querySelector('#connect').addEventListener('submit',async event=>{
 event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;button.textContent='Contacting SmugMug…';status.textContent='Preparing read-only approval link (up to 25 seconds)…';
 try{const data=await post('start');const anchor=document.querySelector('#authorization');anchor.href=data.authorizationUrl;
  document.querySelector('#authorize').hidden=false;status.textContent='Open the authorization link, approve Read access, and return within five minutes.';
 }catch(error){status.textContent=error.message;}finally{button.disabled=false;button.textContent='Prepare read-only authorization';}
});
document.querySelector('#verify').addEventListener('submit',async event=>{
 event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;
 try{const input=event.target.querySelector('input');const data=await post('complete',{verifier:input.value});input.value='';connected(data.account);}
 catch(error){status.textContent=error.message;}finally{button.disabled=false;}
});
document.querySelector('#inventory').addEventListener('click',async event=>{
 event.target.disabled=true;
 report={schema:'giolina-smugmug-discovery-v1',generatedAt:new Date().toISOString(),access:'Full',permissions:'Read',
  structureComplete:false,imagesComplete:false,folders:[],albums:[],errors:[],notes:[
  'Discovery only; no SmugMug or website imagery changes.',
  'Dates are API creation/upload/metadata dates, not inferred wedding dates.',
  'Private image URLs may require OAuth and are not assumed suitable for public embedding.',
  'Image counts are gallery entries; an image collected into multiple galleries may be counted more than once.',
  'No final images or named-couple matches have been selected.']};
 try{
  const account=(await fetch(base+'status',{cache:'no-store'}).then(r=>r.json())).account;
  if(!account)throw new Error('Account authorization required.');report.account=account;
  const root=(await read(account.rootNode)).Response.Node;
  const queue=[{node:root,parentPath:''}],visited=new Set();
  while(queue.length){
   const {node,parentPath}=queue.shift();const id=node.NodeID || node.Uri;if(visited.has(id))continue;visited.add(id);
   const path=parentPath+'/'+(node.Name || node.UrlName || id);status.textContent='Reading '+path;
   if(node.Type==='Folder'){
    report.folders.push({...fields(node,nodeFields),path});
    try{const children=await pages(uri(node.Uris?.ChildNodes)||node.Uri+'!children','Node');for(const child of children)queue.push({node:child,parentPath:path});}
    catch(error){report.errors.push({path,stage:'children',message:error.message});}
   }else if(node.Type==='Album'){
    try{
     const album=(await read(uri(node.Uris?.Album))).Response.Album;
     if(!album)throw new Error('Album details missing.');
     const entry={...fields(album,albumFields),path,nodePrivacy:node.Privacy,apiUri:album.Uri,
      imagesUri:uri(album.Uris?.AlbumImages)||album.Uri+'!images'};
     if(!Number.isFinite(entry.ImageCount)){
      const first=(await read(withPage(entry.imagesUri,1,1))).Response;
      if(Number.isFinite(first?.Pages?.Total))entry.ImageCount=first.Pages.Total;
     }
     report.albums.push(entry);
    }catch(error){report.errors.push({path,stage:'album',message:error.message});}
   }
   recompute();
  }
  report.structureComplete=report.errors.length===0;recompute();
  document.querySelector('#images').hidden=false;
  status.textContent=report.structureComplete?'Folder and gallery inventory finished. You can now inventory image metadata.':'Partial inventory finished. The export lists reads that need attention.';
 }catch(error){status.textContent=error.message;report.errors.push({stage:'inventory',message:error.message});recompute();}
 finally{event.target.disabled=false;}
});
document.querySelector('#images').addEventListener('click',async event=>{
 event.target.disabled=true;
 try{for(const album of report.albums){
  if(album.imageMetadataComplete)continue;
  status.textContent='Reading image metadata: '+album.path;
  try{
   const images=await pages(album.imagesUri,'AlbumImage');
   album.images=images.map(image=>({...fields(image,imageFields),apiUri:image.Uri,
    imageUri:uri(image.Uris?.Image),sizesUri:uri(image.Uris?.ImageSizeDetails),metadataUri:uri(image.Uris?.ImageMetadata)}));
   album.imageMetadataComplete=true;
   // One real-image size/metadata sample per gallery; all image metadata records
   // and any available source URLs from the list are retained, without downloads.
   const example=album.images.find(image=>image.sizesUri);
   if(example){try{example.availableSizes=(await read(example.sizesUri)).Response;}catch(error){report.errors.push({path:album.path,stage:'size-sample',message:error.message});}}
   const detail=album.images.find(image=>image.metadataUri);
   if(detail){try{detail.fileMetadata=(await read(detail.metadataUri)).Response;}catch(error){report.errors.push({path:album.path,stage:'metadata-sample',message:error.message});}}
  }catch(error){report.errors.push({path:album.path,stage:'images',message:error.message});}
  recompute();
 }
 report.imagesComplete=report.structureComplete&&report.albums.every(album=>album.imageMetadataComplete);
 recompute();status.textContent='Image metadata inventory finished. Download the JSON to review the results.';
 }catch(error){status.textContent=error.message;}finally{event.target.disabled=false;}
});
document.querySelector('#download').addEventListener('click',()=>{
 const file=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});const href=URL.createObjectURL(file);
 const anchor=document.createElement('a');anchor.href=href;anchor.download='GioLina_SmugMug_Inventory.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
});
document.querySelector('#disconnect').addEventListener('click',async()=>{await post('disconnect');location.reload();});
requestJson(base+'status').then(({data})=>{
 if(data.connected)connected(data.account);
 else {
  const missing=Object.keys(data.configured).filter(name=>!data.configured[name]);
  document.querySelector('#connect button').disabled=missing.length>0;
  status.textContent=missing.length?'Authorization cannot start: '+missing.join(', ')+' is not available to this deployment.':'Both runtime secrets are available. Ready for read-only authorization.';
 }
}).catch(()=>{ /* Keep the server-rendered runtime binding result visible. */ });
