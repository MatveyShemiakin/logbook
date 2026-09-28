const cryptoObj = globalThis.crypto;
const te = new TextEncoder();
const td = new TextDecoder();

function toB64(bytes) {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let s=''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s);
}
function fromB64(s) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(s,'base64'));
  const raw=atob(s); return Uint8Array.from(raw, c=>c.charCodeAt(0));
}
async function deriveKey(pin, salt) {
  const material = await cryptoObj.subtle.importKey('raw', te.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return cryptoObj.subtle.deriveKey(
    {name:'PBKDF2',salt,iterations:210000,hash:'SHA-256'},
    material,
    {name:'AES-GCM',length:256},
    false,
    ['encrypt','decrypt']
  );
}
async function encryptJson(value, pin) {
  if (!/^\d{6,}$/.test(String(pin))) throw new Error('PIN must be at least 6 digits');
  const salt = cryptoObj.getRandomValues(new Uint8Array(16));
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(String(pin), salt);
  const plain = te.encode(JSON.stringify(value));
  const cipher = new Uint8Array(await cryptoObj.subtle.encrypt({name:'AES-GCM',iv}, key, plain));
  return {version:1,kdf:'PBKDF2-SHA256-210000',cipher:'AES-256-GCM',salt:toB64(salt),iv:toB64(iv),ciphertext:toB64(cipher)};
}
async function decryptJson(envelope, pin) {
  if (!envelope || envelope.version !== 1) throw new Error('Unsupported vault format');
  const key = await deriveKey(String(pin), fromB64(envelope.salt));
  const plain = await cryptoObj.subtle.decrypt({name:'AES-GCM',iv:fromB64(envelope.iv)}, key, fromB64(envelope.ciphertext));
  return JSON.parse(td.decode(plain));
}



const DB='ophthalmic-logbook-v1', STORE='vault', KEY='primary';
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function idbGet(){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(KEY);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function idbPut(value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function idbDelete(){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function vaultExists(){return Boolean(await idbGet())}
async function createVault(pin){const state={version:1,cases:[],followups:[],pending:[],settings:{apiUrl:'',apiToken:''},deviceId:crypto.randomUUID(),verificationBatches:[]};await saveVault(state,pin);return state}
async function loadVault(pin){const env=await idbGet();if(!env)throw new Error('Vault not found');return decryptJson(env,pin)}
async function saveVault(state,pin){await idbPut(await encryptJson(state,pin))}
async function exportEnvelope(){return idbGet()}
async function importEnvelope(envelope,pin){if(!envelope||typeof envelope!=='object')throw new Error('Invalid backup file');await decryptJson(envelope,pin);await idbPut(envelope);return true}
async function wipeVault(){await idbDelete()}


const STATUSES = ['PRIVATE','RESEARCH','IP_HOLD','PUBLIC_READY'];
const SPECIALTIES = ['Cataract','Cornea','Glaucoma','IOL fixation / dislocation','Vitreoretinal','Trauma','Combined','Other'];
const ROLE_DEFAULT = 'Primary surgeon — independent';

function nextCaseId(year, existingIds = []) {
  const re = new RegExp(`^MS-${year}-(\\d{4,})$`);
  let max = 0;
  for (const id of existingIds) {
    const m = String(id).match(re);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `MS-${year}-${String(max + 1).padStart(4,'0')}`;
}

function scanForIdentifiers(text='') {
  const s = String(text);
  const findings = [];
  const patterns = [
    ['medical-record-number', /(?:ИБ|истори(?:я|и)\s+болезни|medical\s*record|MRN)\s*[:№#-]?\s*\d{3,}/ig],
    ['phone', /(?:\+?7|8)[\s()-]*\d{3}[\s()-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g],
    ['email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig],
    ['full-date-of-birth', /(?:дата\s+рождения|dob)\s*[: -]?\s*\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}/ig],
    ['passport', /(?:паспорт|passport)\s*[:№#-]?\s*[A-ZА-Я0-9 -]{6,}/ig],
  ];
  for (const [type, re] of patterns) {
    const matches = s.match(re) || [];
    for (const match of matches) findings.push({type, match});
  }
  return findings;
}

function required(value, name) {
  if (value == null || String(value).trim() === '') throw new Error(`${name} is required`);
  return String(value).trim();
}

function validateCase(input) {
  const c = {...input};
  c.caseId = required(c.caseId, 'caseId');
  if (!/^MS-\d{4}-\d{4,}$/.test(c.caseId)) throw new Error('caseId must match MS-YYYY-####');
  c.surgeryDate = required(c.surgeryDate, 'surgeryDate');
  c.specialty = required(c.specialty, 'specialty');
  c.procedure = required(c.procedure, 'procedure');
  c.eye = required(c.eye, 'eye');
  c.role ||= ROLE_DEFAULT;
  c.status ||= 'PRIVATE';
  if (!STATUSES.includes(c.status)) throw new Error('invalid status');
  if (c.status === 'PUBLIC_READY' && c.consentPublic !== 'Yes') throw new Error('PUBLIC_READY requires public consent');
  c.complexity ||= 'Routine';
  c.caseType ||= 'Elective';
  c.intraComplication ||= 'No';
  c.postComplication ||= 'No';
  c.reintervention ||= 'No';
  c.archived = Boolean(c.archived);
  c.revision = Number(c.revision || 1);
  c.createdAt ||= new Date().toISOString();
  c.updatedAt = new Date().toISOString();
  const freeText = [c.diagnosis,c.riskFactors,c.keyTechnique,c.clinicalPearl,c.notes].filter(Boolean).join('\n');
  const findings = scanForIdentifiers(freeText);
  if (findings.length && !c.privacyOverride) {
    const err = new Error('possible direct patient identifier detected');
    err.findings = findings;
    throw err;
  }
  return c;
}

function canTransitionStatus(from, to, explicitOwnerConfirmation=false) {
  if (!STATUSES.includes(from) || !STATUSES.includes(to)) return false;
  if (from === 'IP_HOLD' && to === 'PUBLIC_READY') return Boolean(explicitOwnerConfirmation);
  return true;
}

function computeMetrics(cases=[], followups=[]) {
  const active = cases.filter(c => !c.archived);
  const bySpecialty = {};
  for (const c of active) bySpecialty[c.specialty] = (bySpecialty[c.specialty] || 0) + 1;
  const withFollowup = new Set(followups.map(f => f.caseId));
  return {
    total: active.length,
    primaryIndependent: active.filter(c => c.role === ROLE_DEFAULT).length,
    complex: active.filter(c => ['Complex','Very complex'].includes(c.complexity)).length,
    intraComplications: active.filter(c => c.intraComplication && c.intraComplication !== 'No').length,
    postComplications: active.filter(c => c.postComplication && c.postComplication !== 'No').length,
    reinterventions: active.filter(c => c.reintervention && c.reintervention !== 'No').length,
    research: active.filter(c => c.status === 'RESEARCH').length,
    ipHold: active.filter(c => c.status === 'IP_HOLD').length,
    followupComplete: active.length ? Math.round((active.filter(c=>withFollowup.has(c.caseId)).length/active.length)*100) : 0,
    bySpecialty,
  };
}

function lastConsecutiveCataracts(cases=[], limit=100) {
  return cases.filter(c => !c.archived && c.specialty === 'Cataract' && c.role === ROLE_DEFAULT)
    .sort((a,b) => `${b.surgeryDate}|${b.caseId}`.localeCompare(`${a.surgeryDate}|${a.caseId}`))
    .slice(0, limit);
}

function vrOutcomes(cases=[], followups=[]) {
  const vr = cases.filter(c => !c.archived && c.specialty === 'Vitreoretinal');
  const latest = new Map();
  for (const f of followups) {
    if (!latest.has(f.caseId) || String(f.date) > String(latest.get(f.caseId).date)) latest.set(f.caseId, f);
  }
  const rrd = vr.filter(c => ['RRD','TRD','Combined'].includes(c.vr?.detachmentType));
  const evaluable = rrd.filter(c => latest.get(c.caseId)?.retinalAttachment);
  const primary = evaluable.filter(c => latest.get(c.caseId).retinalAttachment === 'Attached — primary').length;
  const finalAttached = evaluable.filter(c => ['Attached — primary','Attached — after reoperation'].includes(latest.get(c.caseId).retinalAttachment)).length;
  return {cases: vr.length, detachmentCases: rrd.length, evaluable: evaluable.length, primaryAttached: primary, finalAttached};
}


function key(entityType,entityId){return `${entityType}:${entityId}`}
function pendingSet(state){return new Set((state.pending||[]).map(m=>key(m.entityType,m.entityId)))}
function upsert(arr,idKey,record){const i=arr.findIndex(x=>x[idKey]===record[idKey]);if(i>=0)arr[i]=structuredClone(record);else arr.push(structuredClone(record))}
function mergeSnapshot(state,snapshot){state.conflicts ||= [];const pending=pendingSet(state);for(const remote of snapshot.cases||[]){const local=state.cases.find(x=>x.caseId===remote.caseId);if(!local||Number(remote.revision||0)>Number(local.revision||0)){if(local&&pending.has(key('case',remote.caseId))){if(!state.conflicts.some(c=>c.entityType==='case'&&c.entityId===remote.caseId))state.conflicts.push({entityType:'case',entityId:remote.caseId,server:structuredClone(remote)});}else upsert(state.cases,'caseId',remote)}}for(const remote of snapshot.followups||[]){const local=state.followups.find(x=>x.followupId===remote.followupId);if(!local||Number(remote.revision||0)>Number(local.revision||0)){if(local&&pending.has(key('followup',remote.followupId))){if(!state.conflicts.some(c=>c.entityType==='followup'&&c.entityId===remote.followupId))state.conflicts.push({entityType:'followup',entityId:remote.followupId,server:structuredClone(remote)});}else upsert(state.followups,'followupId',remote)}}return state}
function resolveConflict(state,entityType,entityId,decision,idFactory=()=>crypto.randomUUID()){const conflict=(state.conflicts||[]).find(c=>c.entityType===entityType&&c.entityId===entityId);if(!conflict)throw new Error('Conflict not found');state.pending=(state.pending||[]).filter(m=>!(m.entityType===entityType&&m.entityId===entityId));if(decision==='USE_CLOUD'){if(entityType==='case')upsert(state.cases,'caseId',conflict.server);else upsert(state.followups,'followupId',conflict.server)}else if(decision==='KEEP_LOCAL'){const local=entityType==='case'?state.cases.find(x=>x.caseId===entityId):state.followups.find(x=>x.followupId===entityId);if(!local)throw new Error('Local entity not found');local.revision=Number(conflict.server?.revision||0)+1;local.updatedAt=new Date().toISOString();state.pending.push({mutationId:idFactory(),entityType,entityId,expectedRevision:Number(conflict.server?.revision||0),operation:'UPSERT',payload:structuredClone(local),createdAt:new Date().toISOString()})}else throw new Error('Unknown conflict decision');state.conflicts=state.conflicts.filter(c=>!(c.entityType===entityType&&c.entityId===entityId));return state}
