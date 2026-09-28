import { encryptJson, decryptJson } from '/lib/vault.js';
const DB='ophthalmic-logbook-v1', STORE='vault', KEY='primary';
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function idbGet(){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(KEY);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function idbPut(value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function idbDelete(){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
export async function vaultExists(){return Boolean(await idbGet())}
export async function createVault(pin){const state={version:1,cases:[],followups:[],pending:[],settings:{apiUrl:'',apiToken:''},deviceId:crypto.randomUUID(),verificationBatches:[]};await saveVault(state,pin);return state}
export async function loadVault(pin){const env=await idbGet();if(!env)throw new Error('Vault not found');return decryptJson(env,pin)}
export async function saveVault(state,pin){await idbPut(await encryptJson(state,pin))}
export async function exportEnvelope(){return idbGet()}
export async function importEnvelope(envelope,pin){if(!envelope||typeof envelope!=='object')throw new Error('Invalid backup file');await decryptJson(envelope,pin);await idbPut(envelope);return true}
export async function wipeVault(){await idbDelete()}
