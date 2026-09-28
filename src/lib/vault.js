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
export async function encryptJson(value, pin) {
  if (!/^\d{6,}$/.test(String(pin))) throw new Error('PIN must be at least 6 digits');
  const salt = cryptoObj.getRandomValues(new Uint8Array(16));
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(String(pin), salt);
  const plain = te.encode(JSON.stringify(value));
  const cipher = new Uint8Array(await cryptoObj.subtle.encrypt({name:'AES-GCM',iv}, key, plain));
  return {version:1,kdf:'PBKDF2-SHA256-210000',cipher:'AES-256-GCM',salt:toB64(salt),iv:toB64(iv),ciphertext:toB64(cipher)};
}
export async function decryptJson(envelope, pin) {
  if (!envelope || envelope.version !== 1) throw new Error('Unsupported vault format');
  const key = await deriveKey(String(pin), fromB64(envelope.salt));
  const plain = await cryptoObj.subtle.decrypt({name:'AES-GCM',iv:fromB64(envelope.iv)}, key, fromB64(envelope.ciphertext));
  return JSON.parse(td.decode(plain));
}
