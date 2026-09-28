function toBytes(value){
  const s=String(value).replace(/-/g,'+').replace(/_/g,'/');
  const padded=s+'='.repeat((4-s.length%4)%4);const raw=atob(padded);return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
function toB64u(value){let s='';for(const b of new Uint8Array(value))s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function authActionUrl(base,action){const u=new URL(base);u.searchParams.set('action',action);return u.toString()}
async function api(base,action,{body={},headers={}}={}){let r;try{r=await fetch(authActionUrl(base,action),{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)})}catch{throw new Error('Сервер синхронизации недоступен. Проверь API URL и подключение Yandex Cloud.')}const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||`HTTP ${r.status}`);return data}
export function passkeySupported(){return Boolean(window.PublicKeyCredential&&navigator.credentials?.create&&navigator.credentials?.get)}
export async function registerPasskey(apiUrl,bootstrapToken){
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
export async function loginPasskey(apiUrl){
  if(!passkeySupported())throw new Error('Passkey/WebAuthn не поддерживается этим браузером');
  const origin=location.origin;
  const o=await api(apiUrl,'auth-login-options',{body:{origin}});
  const credential=await navigator.credentials.get({publicKey:{challenge:toBytes(o.challenge),rpId:o.rpId,allowCredentials:[{type:'public-key',id:toBytes(o.credentialId),transports:['internal','hybrid']}],timeout:60000,userVerification:'required'}});
  if(!credential)throw new Error('Вход по passkey отменён');
  const r=credential.response;
  return api(apiUrl,'auth-login-verify',{body:{challengeId:o.challengeId,credentialId:toB64u(credential.rawId),clientDataJSON:toB64u(r.clientDataJSON),authenticatorData:toB64u(r.authenticatorData),signature:toB64u(r.signature)}});
}
