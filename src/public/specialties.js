const input=(id,label,type='text',opts='')=>`<div><label>${label}</label><input id="sp_${id}" type="${type}" ${opts}></div>`;
const select=(id,label,values)=>`<div><label>${label}</label><select id="sp_${id}"><option></option>${values.map(v=>`<option>${v}</option>`).join('')}</select></div>`;
const text=(id,label)=>`<div class="span-2"><label>${label}</label><textarea id="sp_${id}"></textarea></div>`;
export const specialtyTemplates={
  Cataract:()=>[
    select('nucleusGrade','Nucleus / cataract grade',['1','2','3','4','5']),
    input('axialLength','Axial length, mm','number','step="0.01"'),
    input('acd','ACD, mm','number','step="0.01"'),
    select('pupil','Pupil',['Normal','Small','IFIS risk']),
    input('pupilDevice','Pupil expansion device'),
    select('zonules','Zonular status',['Normal','Weakness','Dialysis']),
    input('zonularDevice','Zonular support (CTR / segment / hooks)'),
    select('pxf','Pseudoexfoliation',['No','Yes']),
    select('priorVitrectomy','Previous vitrectomy',['No','Yes']),
    input('phacoPlatform','Phaco platform'),
    input('phacoTechnique','Phaco technique'),
    input('phacoEnergy','CDE / phaco energy','number','step="0.01"'),
    input('vacuum','Peak vacuum, mmHg','number','step="1"'),
    input('flow','Aspiration flow, mL/min','number','step="0.1"'),
    select('capsularSupport','Capsular support',['Intact','Compromised','Absent']),
    input('iolModel','IOL model'),input('iolPower','IOL power (D)','number','step="0.01"'),
    input('targetRefraction','Target refraction','number','step="0.01"'),input('postopSE','Post-op SE','number','step="0.01"'),
    select('pcr','PCR',['No','Yes']),select('vitreousLoss','Vitreous loss',['No','Yes']),select('droppedFragment','Dropped nucleus/fragment',['No','Yes'])
  ].join(''),
  Cornea:()=>[
    select('corneaProcedure','Procedure',['PKP','DALK','DMEK','DSAEK','KPro','Other']),input('indication','Indication'),
    input('vascularizationQuadrants','Corneal vascularization, quadrants','number','min="0" max="4"'),select('priorGraft','Previous graft',['No','Yes']),
    text('highRiskFeatures','High-risk local/systemic features'),input('microbiology','Microbiology / organism if relevant'),
    input('donorAge','Donor age','number'),input('donorEndothelialDensity','Donor endothelial density, cells/mm²','number','step="1"'),
    input('donorDiameter','Donor trephine, mm','number','step="0.1"'),input('recipientDiameter','Recipient trephine, mm','number','step="0.1"'),
    input('suture','Suture technique / material'),input('combinedProcedure','Combined procedure'),
    select('graftStatus','Latest graft status',['Clear','Rejection','Failure']),select('repeatKeratoplasty','Repeat keratoplasty',['No','Yes'])
  ].join(''),
  Glaucoma:()=>[
    input('glaucomaSubtype','Glaucoma subtype'),select('glaucomaProcedure','Procedure',['DALS / implant-free dual-outflow','Trabeculectomy','Drainage device','MIGS','Cyclodestruction','Combined','Other']),
    input('baselineIop','Baseline IOP','number','step="0.1"'),input('targetIop','Target IOP','number','step="0.1"'),input('baselineMeds','Baseline meds, n','number','min="0"'),
    input('priorGlaucomaSurgery','Previous glaucoma surgery'),text('dalsDetails','DALS / outflow technique details'),text('glaucomaTechnique','Other technique details'),
    input('postopIop','Latest postop IOP','number','step="0.1"'),input('postopMeds','Latest meds, n','number','min="0"'),
    select('glaucomaReintervention','Additional procedure',['No','Yes']),input('successDefinition','Success criterion')
  ].join(''),
  'IOL fixation / dislocation':()=>[
    input('dislocationType','Type / degree of dislocation'),select('capsularSupport','Capsular support',['Adequate','Partial','Absent']),select('vitreousInvolvement','Vitreous involvement',['No','Yes']),
    select('iolAction','Action',['Reposition','Fixation','Exchange','Explantation']),input('fixationTechnique','Fixation technique'),input('needleGauge','Needle / gauge'),input('sutureMaterial','Suture material'),input('iolModel','IOL model'),
    select('posteriorApproach','Posterior segment approach',['No','Anterior vitrectomy','PPV']),select('centration','Post-op centration',['Centered','Mild decentration','Significant decentration']),input('refractiveOutcome','Refractive outcome')
  ].join(''),
  Vitreoretinal:()=>[
    select('vrProcedure','VR procedure',['PPV','Scleral buckling','Pneumatic retinopexy','PPV + buckle','Silicone-oil removal','ERM peel','Macular-hole surgery','Vitreous haemorrhage surgery','Endophthalmitis PPV','Trauma / IOFB','Other']),
    select('lensStatus','Lens status',['Phakic','Pseudophakic','Aphakic']),select('detachmentType','Retinal detachment',['','RRD','TRD','Combined']),select('macula','Macula',['On','Off','Not applicable']),
    input('detachmentExtent','Detachment extent / quadrants'),input('pvr','PVR grade'),input('breaks','Breaks: number / clock hours'),input('duration','Duration if known'),
    select('gauge','PPV gauge',['23G','25G','27G','Not applicable']),select('pvdInduction','PVD induction',['No','Yes','Pre-existing']),select('peripheralVitrectomy','Peripheral vitrectomy',['No','Yes']),
    select('pfcl','PFCL',['No','Yes']),select('srfDrainage','SRF drainage',['No','Yes']),select('endolaser','Endolaser',['No','Yes']),input('laserExtent','Laser extent / rows / clock hours'),
    select('cryo','Cryotherapy',['No','Yes']),select('fluidAir','Fluid-air exchange',['No','Yes']),select('ermIlm','ERM / ILM peeling',['No','ERM','ILM','ERM + ILM']),
    select('retinotomy','Retinotomy',['No','Yes']),select('retinectomy','Retinectomy',['No','Yes']),select('tamponade','Tamponade',['Air','SF6','C3F8','Silicone oil','None']),input('tamponadeDetail','Gas concentration / oil viscosity'),
    select('buckleExtent','Buckle',['','Segmental','Circumferential']),input('buckleType','Buckle type / element'),select('externalDrainage','External SRF drainage',['','No','Yes']),input('pneumaticGas','Pneumatic retinopexy gas'),select('retinopexy','Retinopexy',['','Laser','Cryo','Laser + cryo'])
  ].join(''),
  Trauma:()=>[input('traumaType','Trauma type'),input('zone','Zone / classification'),input('betts','BETTS classification'),text('structures','Structures involved'),text('procedures','Procedures performed')].join(''),
  Combined:()=>[input('combinedProcedures','Procedures (semicolon-separated)'),text('combinedDetails','Combined-case details')].join(''),
  Other:()=>text('otherDetails','Procedure-specific details')
};
export function collectSpecialtyData(container){const out={};container.querySelectorAll('[id^="sp_"]').forEach(el=>{const k=el.id.slice(3);if(el.value!=='')out[k]=el.type==='number'&&el.value!==''?Number(el.value):el.value});return out}
