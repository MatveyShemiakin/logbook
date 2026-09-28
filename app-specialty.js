const input=(id,label,type='text',opts='')=>`<div><label>${label}</label><input id="sp_${id}" type="${type}" ${opts}></div>`;
const select=(id,label,values)=>`<div><label>${label}</label><select id="sp_${id}"><option></option>${values.map(v=>`<option>${v}</option>`).join('')}</select></div>`;
const text=(id,label)=>`<div class="span-2"><label>${label}</label><textarea id="sp_${id}"></textarea></div>`;
const specialtyTemplates={
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
function collectSpecialtyData(container){const out={};container.querySelectorAll('[id^="sp_"]').forEach(el=>{const k=el.id.slice(3);if(el.value!=='')out[k]=el.type==='number'&&el.value!==''?Number(el.value):el.value});return out}


function toBytes(value){
  const s=String(value).replace(/-/g,'+').replace(/_/g,'/');
  const padded=s+'='.repeat((4-s.length%4)%4);const raw=atob(padded);return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
function toB64u(value){let s='';for(const b of new Uint8Array(value))s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function authActionUrl(base,action){const u=new URL(base);u.searchParams.set('action',action);return u.toString()}
async function api(base,action,{body={},headers={}}={}){const r=await fetch(authActionUrl(base,action),{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||`HTTP ${r.status}`);return data}
function passkeySupported(){return Boolean(window.PublicKeyCredential&&navigator.credentials?.create&&navigator.credentials?.get)}
async function registerPasskey(apiUrl,bootstrapToken){
  if(!passkeySupported())throw new Error('Passkey/WebAuthn не поддерживается этим браузером');
  if(!bootstrapToken)throw new Error('Для первичной регистрации нужен bootstrap sync token');
  const origin=location.origin;
  const o=await api(apiUrl,'auth-register-options',{body:{origin},headers:{'X-Logbook-Token':bootstrapToken}});
  const credential=await navigator.credentials.create({publicKey:{challenge:toBytes(o.challenge),rp:{name:'Surgical Logbook',id:o.rpId},user:{id:toBytes(o.userId),name:o.userName||'Matvey Shemyakin',displayName:o.userName||'Matvey Shemyakin'},pubKeyCredParams:[{type:'public-key',alg:-7}],timeout:60000,attestation:'none',authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'preferred',userVerification:'required'}}});
  if(!credential)throw new Error('Регистрация passkey отменена');
  const r=credential.response;if(typeof r.getPublicKey!=='function'||typeof r.getAuthenticatorData!=='function')throw new Error('Браузер не предоставляет WebAuthn public key API');
  const publicKey=r.getPublicKey();if(!publicKey)throw new Error('Не удалось получить public key passkey');
  return api(apiUrl,'auth-register-verify',{headers:{'X-Logbook-Token':bootstrapToken},body:{challengeId:o.challengeId,credentialId:toB64u(credential.rawId),publicKeySpki:toB64u(publicKey),algorithm:r.getPublicKeyAlgorithm?.()??-7,clientDataJSON:toB64u(r.clientDataJSON),authenticatorData:toB64u(r.getAuthenticatorData())}});
}
async function loginPasskey(apiUrl){
  if(!passkeySupported())throw new Error('Passkey/WebAuthn не поддерживается этим браузером');
  const origin=location.origin;
  const o=await api(apiUrl,'auth-login-options',{body:{origin}});
  const credential=await navigator.credentials.get({publicKey:{challenge:toBytes(o.challenge),rpId:o.rpId,allowCredentials:[{type:'public-key',id:toBytes(o.credentialId),transports:['internal','hybrid']}],timeout:60000,userVerification:'required'}});
  if(!credential)throw new Error('Вход по passkey отменён');
  const r=credential.response;
  return api(apiUrl,'auth-login-verify',{body:{challengeId:o.challengeId,credentialId:toB64u(credential.rawId),clientDataJSON:toB64u(r.clientDataJSON),authenticatorData:toB64u(r.authenticatorData),signature:toB64u(r.signature)}});
}
