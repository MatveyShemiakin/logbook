import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('cataract module records biometry, platform and pupil/zonular support details',async()=>{
 const s=await readFile('src/public/specialties.js','utf8');
 for(const field of ['axialLength','phacoPlatform','phacoEnergy','pupilDevice','zonularDevice']) assert.match(s,new RegExp(field));
});
test('cornea module records graft-risk and donor variables useful for PKP audit',async()=>{
 const s=await readFile('src/public/specialties.js','utf8');
 for(const field of ['vascularizationQuadrants','priorGraft','donorEndothelialDensity','microbiology']) assert.match(s,new RegExp(field));
});
test('glaucoma and VR modules retain DALS and retinal-detachment detail',async()=>{
 const s=await readFile('src/public/specialties.js','utf8');
 for(const field of ['targetIop','dalsDetails','lensStatus','detachmentExtent','laserExtent']) assert.match(s,new RegExp(field));
});
