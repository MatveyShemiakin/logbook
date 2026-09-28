import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildStatic } from '../tools/build-static.mjs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('published shell uses the configured cloud function without site sharing controls',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'logbook-cloud-'));
  await buildStatic(dir);
  const html=await readFile(path.join(dir,'index.html'),'utf8');
  assert.match(html,/Сервер подключён · passkey не настроен/);
  assert.match(html,/https:\/\/functions\.yandexcloud\.net\/d4e4l55o224tbo28mcsb/);
  assert.doesNotMatch(html,/id="shareLogbook"|\/legal\.js|\/site-mega-nav\.js/);
});
