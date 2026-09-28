import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function stripModuleSyntax(src){
  return src
    .replace(/^import\s+[^;]+;\s*$/gm,'')
    .replace(/\bexport\s+(?=(async\s+)?function\b|class\b|const\b|let\b|var\b)/g,'');
}
export async function buildStatic(outDir){
  await mkdir(outDir,{recursive:true});
  let html=await readFile(path.join(ROOT,'src/public/index.html'),'utf8');
  const css=await readFile(path.join(ROOT,'src/public/styles.css'),'utf8');
  const modules=[
    'src/lib/vault.js',
    'src/public/store.js',
    'src/lib/domain.js',
    'src/lib/syncClient.js',
    'src/public/specialties.js',
    'src/public/authClient.js',
    'src/public/app.js'
  ];
  const js=(await Promise.all(modules.map(async f=>stripModuleSyntax(await readFile(path.join(ROOT,f),'utf8'))))).join('\n\n');
  html=html.replace('<link rel="stylesheet" href="/styles.css">',()=>`<style>${css}</style>`)
           .replace('<script type="module" src="/app.js"></script>',()=>`<script type="module">${js}</script>`)
           .replace('href="/manifest.webmanifest"','href="./manifest.webmanifest"');
  await writeFile(path.join(outDir,'index.html'),html);
  const manifest=JSON.parse(await readFile(path.join(ROOT,'src/public/manifest.webmanifest'),'utf8'));
  manifest.start_url='./';manifest.scope='./';
  manifest.icons=[
    {src:'./icon-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},
    {src:'./icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}
  ];
  await writeFile(path.join(outDir,'manifest.webmanifest'),JSON.stringify(manifest));
  const sw=`const CACHE='logbook-v4-20260928-static';const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];\nself.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));\nself.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('logbook-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));\nself.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(self.registration.scope))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone))}return r}).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))))});\n`;
  await writeFile(path.join(outDir,'sw.js'),sw);
  await copyFile(path.join(ROOT,'src/public/icons/icon-192.png'),path.join(outDir,'icon-192.png'));
  await copyFile(path.join(ROOT,'src/public/icons/icon-512.png'),path.join(outDir,'icon-512.png'));
}
if(process.argv[1]===fileURLToPath(import.meta.url))await buildStatic(process.argv[2]||path.join(ROOT,'dist-static'));
