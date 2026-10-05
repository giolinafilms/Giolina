"""Reproducible import from preserved PDF text; never fills missing source prices."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
sources=json.loads((root/'data/honeybook-source.json').read_text())
def page(source,n):
    return '\n'.join(l.strip() for l in sources[source]['pages'][n-1].splitlines() if not l.startswith(('10/4/26','https://app.honeybook.com'))).strip()
# (source, page(s), title marker, public/source title, cents or None, explicit hours, group)
rows=[
(0,[3,4],'Cinematography Package:','Cinematography Package: Feature Film & Edit Services',315000,8,'wedding-feature'),
(0,[5],'Cinematography Add-On: Cinematographer','Cinematography Add-On: Cinematographer',110000,8,'additional-cinematographer'),
(0,[6],'Micro Wedding Cinematography','Micro Wedding Cinematography : 4hrs: (Ceremony & reception at one location)',170000,4,'micro-cinema'),
(0,[6],'Cinematography Add-On: Drone','Cinematography Add-On: Drone',55000,None,'drone'),
(0,[7],'Cinematography Add-On: Same Day Edit','Cinematography Add-On: Same Day Edit',175000,None,'same-day-edit'),
(0,[10,11],'Premier','Premier 8-hour Wedding Photography',230000,8,'wedding-photo'),
(0,[11,12],'Micro Wedding Photo','Micro Wedding Photo package: 4hrs: (Ceremony & reception at one location)',150000,4,'micro-photo'),
(0,[12],'Photography Add-On: Candid','Photography Add-On: Candid Photographer (8 HRS)',100000,8,'candid-photo'),
(0,[12],'Photography Add-On: Engagement','Photography Add-On: Engagement Session',100000,3,'engagement-session'),
(0,[14],'Overtime','Overtime charge for additional coverage over contracted rate.',17500,None,'overtime'),
(0,[14],'Special Rates:','Special Rates:',None,None,'special-rates'),
(0,[14],'Extended Travel','Extended Travel Fee over 50 miles',20000,None,'travel'),
(1,[2],'Photography Essentials','Photography Essentials (6hr)',165000,6,'s16-photo'),
(1,[3],'Photo package:','Photo package: 4hrs: (reception hall location only)',82500,4,'s16-photo-basic'),
(1,[3],'Photography add-on: Online','Photography add-on: Online custom photo website gallery for viewing, sharing & downloading.',10000,None,'photo-gallery'),
(1,[3],'Photography Add-On: Candid','Photography Add-On: Candid Photographer',65000,6,'candid-photo'),
(1,[5],'Feature Film & Edit','Feature Film & Edit Services 6hrs',180000,6,'s16-feature'),
(1,[6],'Cinematography Add-On: Cinematographer','Cinematography Add-On: Cinematographer',70000,None,'additional-cinematographer'),
(1,[6],'Cinematography Add-On: Drone','Cinematography Add-On: Drone',35000,None,'drone'),
(1,[7],'Video Production Package','Video Production Package: 4hrs: (reception hall location only)',72500,4,'s16-cinema-basic'),
(1,[7],'Highlight reel','Highlight reel $175',17500,None,'highlight'),
(1,[8],'Overtime','Overtime charge for additional coverage over contracted rate.',12500,None,'overtime'),
]
saved=[
(1,'4hr Small Event Pro Photo pkg',None,4,'small-event-photo'),
(1,'5-Hour Corporate (Atlas healthcare) Video Package — 12/8/25 -$2,700',270000,5,'corporate-video-atlas'),
(1,'5-Hour Corporate (Preferred healthcare) Video Package — 12/9/25 $2,700',270000,5,'corporate-video-preferred'),
(1,'5-Hour Corporate Pro Photo Package (Atlas Healthcare) — 12/08/25: $1,500',150000,5,'corporate-photo-atlas'),
(1,'5-Hour Corporate Pro Photo Package (Preferred healthcare) — 12/09/25: $1,600',160000,5,'corporate-photo-preferred'),
(1,'6hr Pro Photo Package',None,6,'s16-photo'),
(1,'6hr Small Event Pro Cinematic Film/Edit Package',None,6,'small-event-cinema'),
(1,'8hr - One cam, Long Form Basic Edit',None,8,'long-form'),
(1,'Additional Location',None,None,'additional-location'),
(1,'Candid Photographer (6hrs)',None,6,'candid-photo'),
(1,'Cinematic Bliss Unleashed: Elevate Your Moments with our Online Presentation Extravaganza for Effortless Sharing w',None,None,'film-presentation'),
(2,'Cinematography Add-On: Cinematographer',None,10,'additional-cinematographer'),
(2,'Cinematography Add-On: Cinematographer ©',None,6,'additional-cinematographer'),
(2,'Cinematography Add-On: Drone',None,None,'drone'),
(2,'Cinematography Add-on: Raw Footage Dance Chapter',None,None,'raw-footage'),
(2,'Cinematography add-on: Rehearsal Dinner',None,3,'rehearsal-dinner'),
(2,'Cinematography Add-On: Rush Edit service',None,None,'rush-edit'),
(2,'Cinematography Add-On: Same Day Edit',None,None,'same-day-edit'),
(2,'Cinematography Package: Feature Film & Edit Services',None,8,'wedding-feature'),
(2,'Extended Travel',20000,None,'travel'),
(2,'Feature Film & Edit Services (5hr)',None,5,'s16-feature'),
(2,'Heart of Chelsea Veterinary Group',None,None,'heart-chelsea'),
(2,'Micro Wedding Photo package: 4hrs: (Ceremony & reception at one location)',None,4,'micro-photo'),
(2,'Micro Wedding Videography : 4hrs: (Ceremony & reception at one location)',None,4,'micro-cinema'),
(2,'Online custom photo website gallery for viewing, sharing & downloading.',None,None,'photo-gallery')]
rows += [(2,[p],marker, 'Extended Travel Fee over 50 miles' if marker=='Extended Travel' else marker,price,hours,group) for p,marker,price,hours,group in saved]
result=[]
for index,(s,pages,marker,title,price,hours,group) in enumerate(rows):
    text='\n\n'.join(page(s,p) for p in pages)
    # Keep the complete original service text through its next service boundary.
    start=0 if s==2 and group=='travel' else text.find(marker)
    if start<0: raise ValueError((s,pages,marker))
    text=text[start:]
    boundaries=[]
    for os,op,om,*_ in rows:
        if os==s and set(op)&set(pages) and om!=marker:
            pos=text.find(om,1)
            if pos>0: boundaries.append(pos)
    if boundaries:text=text[:min(boundaries)]
    if s<2:
        # Source price marks the end of the item, not the next item's price.
        money=re.search(r'(?m)^(?:Quantity:.*?\$[\d,]+(?:\.\d{2})?|\$[\d,]+(?:\.\d{2})?)\s*$',text)
        if money:text=text[:money.start()].strip()
    # Retain exact clipped saved-list wording. It is not represented as a complete description.
    note=('Historical 2024 Sweet Sixteen version. Confirm before quoting.' if s==1 else '2026 wedding service source.') if s<2 else 'Saved-services export: description/title may be clipped; unseen subitems and missing prices must be confirmed.'
    if price is None:note+=' Price not supplied as a usable quote; left unset.'
    if group=='special-rates':note+=' Source zero/quantity-zero is an inquiry placeholder, not a free service.'
    if s==2 and group=='travel': text='$200 per every 50 miles over. Note: some locations will require an overnight stay.'
    if s==2:text=re.sub(r'(?m)^(?:Templates|Finance|Tools|Automations|Reports|Resources|Settings)\s*$', '', text).strip()
    source=sources[s]['name']
    if s==2:source+='; duplicate snapshot '+sources[3]['name']
    result.append(dict(id=f'hb-{s}-{index+1:02d}',name=title,category=('Wedding 2026' if s==0 else 'Sweet Sixteen 2024' if s==1 else 'Saved services / review'),description=text.strip(),priceCents=price,currency='USD',coverageHours=hours,rules=note,source=source,sourcePages=', '.join(map(str,pages)),reviewRequired=s!=0 or price is None,conflictGroup=group,archived=False))
(root/'data/catalog.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f'{len(result)} source-backed versions; 25 of 44 saved entries visible; 19 not supplied in export.')
