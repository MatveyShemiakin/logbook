import test from 'node:test';
import assert from 'node:assert/strict';
import { credentialingCase, cataractAudit, buildSummary } from '../src/lib/reports.js';

test('credentialing export uses allow-list and drops internal fields',()=>{
 const out=credentialingCase({caseId:'MS-2026-0001',surgeryDate:'2026-09-28',site:'A',eye:'OD',specialty:'Cataract',procedure:'Phaco',diagnosis:'Cataract',role:'Primary surgeon — independent',complexity:'Routine',status:'PRIVATE',pendingSecret:'x',apiToken:'secret'});
 assert.equal(out.caseId,'MS-2026-0001');
 assert.equal('apiToken' in out,false);assert.equal('pendingSecret' in out,false);
});

test('cataract audit labels actual N when fewer than 100',()=>{
 const a=cataractAudit([{caseId:'1',surgeryDate:'2026-01-01',specialty:'Cataract',role:'Primary surgeon — independent',intraComplication:'No',postComplication:'No'}]);
 assert.equal(a.n,1);assert.equal(a.requestedN,100);assert.equal(a.completeHundred,false);
});

test('summary states denominator and followup completeness',()=>{
 const s=buildSummary([{caseId:'1',archived:false,role:'Primary surgeon — independent',specialty:'Cornea',complexity:'Complex',intraComplication:'No',postComplication:'No',reintervention:'No',status:'PRIVATE'}],[{caseId:'1'}]);
 assert.equal(s.total,1);assert.equal(s.followupCompletenessPct,100);
});
