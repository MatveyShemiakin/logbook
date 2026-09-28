import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildStatic } from '../tools/build-static.mjs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('published shell explains unavailable cloud sync without site sharing controls',async()=>{
  const dir=await mkdtemp(path.join(tmpdir(),'logbook-cloud-'));
  await buildStatic(dir);
  const html=await readFile(path.join(dir,'index.html'),'utf8');
  assert.match(html,/Cloud sync пока не подключена/);
  assert.doesNotMatch(html,/id="shareLogbook"|\/legal\.js|\/site-mega-nav\.js/);
});
