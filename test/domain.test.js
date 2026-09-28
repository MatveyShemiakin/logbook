import test from 'node:test';
import assert from 'node:assert/strict';
import { nextCaseId, validateCase, scanForIdentifiers, canTransitionStatus, computeMetrics } from '../src/lib/domain.js';

test('nextCaseId advances highest ID in the selected year', () => {
  assert.equal(nextCaseId(2026, ['MS-2026-0001','MS-2026-0003','MS-2025-0999']), 'MS-2026-0004');
});

test('validateCase accepts minimal independent primary case', () => {
  const c = validateCase({caseId:'MS-2026-0001', surgeryDate:'2026-09-28', specialty:'Vitreoretinal', procedure:'PPV', eye:'OD'});
  assert.equal(c.role, 'Primary surgeon — independent');
  assert.equal(c.status, 'PRIVATE');
  assert.equal(c.revision, 1);
});

test('validateCase rejects missing required fields', () => {
  assert.throws(() => validateCase({caseId:'MS-2026-0001'}), /required/i);
});

test('privacy scanner flags obvious direct identifiers', () => {
  const f = scanForIdentifiers('ИБ 12345678, телефон +7 999 123-45-67');
  assert.ok(f.some(x => x.type === 'medical-record-number'));
  assert.ok(f.some(x => x.type === 'phone'));
});

test('IP_HOLD cannot silently become PUBLIC_READY', () => {
  assert.equal(canTransitionStatus('IP_HOLD','PUBLIC_READY',false), false);
  assert.equal(canTransitionStatus('IP_HOLD','PUBLIC_READY',true), true);
});

test('metrics do not double-count total combined cases', () => {
  const m = computeMetrics([
    {caseId:'1', archived:false, role:'Primary surgeon — independent', complexity:'Complex', specialty:'Combined', procedure:'Phaco + PPV', intraComplication:'No', postComplication:'No', reintervention:'No', status:'PRIVATE'},
    {caseId:'2', archived:false, role:'Primary surgeon — independent', complexity:'Routine', specialty:'Cataract', procedure:'Phaco', intraComplication:'Yes', postComplication:'No', reintervention:'No', status:'RESEARCH'}
  ], []);
  assert.equal(m.total, 2);
  assert.equal(m.primaryIndependent, 2);
  assert.equal(m.intraComplications, 1);
  assert.equal(m.research, 1);
});

test('PUBLIC_READY requires explicit public educational consent', () => {
  assert.throws(() => validateCase({
    caseId:'MS-2026-0100', surgeryDate:'2026-09-28', specialty:'Cornea', procedure:'PKP', eye:'OD',
    status:'PUBLIC_READY', consentPublic:'No'
  }), /public consent/i);
  const c = validateCase({
    caseId:'MS-2026-0100', surgeryDate:'2026-09-28', specialty:'Cornea', procedure:'PKP', eye:'OD',
    status:'PUBLIC_READY', consentPublic:'Yes'
  });
  assert.equal(c.status,'PUBLIC_READY');
});
