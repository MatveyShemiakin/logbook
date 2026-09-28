import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptJson, decryptJson } from '../src/lib/vault.js';

test('vault roundtrip encrypts and decrypts JSON with PIN', async () => {
  const payload = {cases:[{caseId:'MS-2026-0001'}],followups:[]};
  const encrypted = await encryptJson(payload, '482913');
  assert.notEqual(encrypted.ciphertext.includes('MS-2026-0001'), true);
  assert.deepEqual(await decryptJson(encrypted, '482913'), payload);
});

test('wrong PIN cannot decrypt vault', async () => {
  const encrypted = await encryptJson({secret:'clinical'}, '123456');
  await assert.rejects(() => decryptJson(encrypted, '654321'));
});
