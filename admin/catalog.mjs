import catalog from './data/catalog.json' with {type:'json'};
export const catalogCategories=['Weddings / Cinematography','Weddings / Photography','Weddings / Add-ons','Weddings / Micro Weddings','Sweet Sixteen / Cinematography','Sweet Sixteen / Photography','Sweet Sixteen / Add-ons','Events & Corporate / Photography','Events & Corporate / Cinematography','Events & Corporate / Other','General / Add-ons & Fees','Needs classification'];
const originals=new Map(catalog.map(r=>[r.id,r]));
function category(row){
 const n=row.name.toLowerCase();
 if(/travel|overtime|special rates|additional location/.test(n))return 'General / Add-ons & Fees';
 const base=(row.category||'').startsWith('Wedding')?'Weddings':(row.category||'').startsWith('Sweet')?'Sweet Sixteen':null;
 if(base){if(n.includes('micro wedding'))return base+' / Micro Weddings';if(/add-on|highlight reel/.test(n))return base+' / Add-ons';return base+' / '+(/photo/.test(n)?'Photography':'Cinematography');}
 if(/corporate|small event|veterinary/.test(n))return 'Events & Corporate / '+(/photo/.test(n)?'Photography':/video|cinematic/.test(n)?'Cinematography':'Other');
 if(/micro wedding/.test(n))return 'Weddings / Micro Weddings';
 if(/add-on|candid photographer|gallery|presentation/.test(n))return 'General / Add-ons & Fees';
 return 'Needs classification';
}
export function catalogRecord(row){
 const source=originals.get(row.id);return {...row,active:row.active!==false,catalogCategory:row.catalogCategory||category(source||row),...(source?{sourceName:source.name,sourceDescription:source.description,sourcePriceCents:source.priceCents,sourceCoverageHours:source.coverageHours,sourceCategory:source.category,source:source.source,sourcePages:source.sourcePages}:{})};
}
export const catalogSeed=catalog.map(catalogRecord);
