import {catalogSeed,corporateSourceServices} from './catalog.mjs';
import {validate} from './model.mjs';
export const baselineSpecs=[
 ['wedding-cinema','hb-0-01',['hb-0-02','hb-0-04','hb-0-05']],
 ['wedding-photo','hb-0-06',['hb-0-08','hb-0-09']],
 ['wedding-micro-cinema','hb-0-03',[]],['wedding-micro-photo','hb-0-07',[]],
 ['sweet-photo','hb-1-13',['hb-1-15','hb-1-16']],
 ['sweet-cinema','hb-1-17',['hb-1-18','hb-1-19','hb-1-21']],
 ['sweet-four-photo','hb-1-14',[]],['sweet-four-cinema','hb-1-20',[]],
 ['corporate-photo','corporate-2025-preferred-photo',['corporate-2025-preferred-candid']],
 ['corporate-video','corporate-2025-preferred-video',[]]
];
export function baselinePackages(){return baselineSpecs.map(([id,serviceId,options],i)=>{const source=catalogSeed.find(r=>r.id===serviceId);return {id:'baseline-'+id,...validate('packages',{name:source.sourceName,catalogCategory:source.catalogCategory,description:source.sourceDescription,clientDescription:source.sourceDescription,serviceIds:[serviceId],optionalServiceIds:options,priceCents:source.sourcePriceCents,active:true,sortOrder:i,rules:'Source baseline: '+source.sourceCategory+'. Confirm this historical offering before real client delivery.'}),baseline:true,sourceCategory:source.sourceCategory};});}
export async function initializeBaselines(db,org,user){
 const now=new Date().toISOString(),rows=baselinePackages();
 const existing=await db.prepare("SELECT id FROM records WHERE organization_id=? AND kind='services' AND id IN (SELECT value FROM json_each(?))").bind(org,JSON.stringify(baselineSpecs.flatMap(s=>[s[1],...s[2]]).filter(id=>!id.startsWith('corporate-2025-')))).all();
 if(new Set(existing.results.map(r=>r.id)).size!==new Set(baselineSpecs.flatMap(s=>[s[1],...s[2]]).filter(id=>!id.startsWith('corporate-2025-'))).size)throw new Error('Source catalog must already be available; no catalog reseeding was attempted.');
 await db.batch([db.prepare("INSERT OR IGNORE INTO records(organization_id,kind,id,data,created_at,updated_at) SELECT ?,'services',json_extract(value,'$.id'),json_remove(value,'$.id'),?,? FROM json_each(?)").bind(org,now,now,JSON.stringify(corporateSourceServices)),db.prepare("INSERT OR IGNORE INTO records(organization_id,kind,id,data,created_at,updated_at) SELECT ?,'packages',json_extract(value,'$.id'),json_remove(value,'$.id'),?,? FROM json_each(?)").bind(org,now,now,JSON.stringify(rows)),db.prepare('INSERT INTO audit_events VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),org,user.email,'source-baselines-initialized','packages','source-baselines',now,'{}')]);
 return {message:'Ten original PDF offerings are available as baseline templates. Existing packages preserved. Duplicate a baseline to create an editable version.'};
}
