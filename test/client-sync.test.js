import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeSnapshot, resolveConflict } from '../src/lib/syncClient.js';

test('snapshot replaces older local revision when no pending mutation exists',()=>{
 const state={cases:[{caseId:'A',revision:1}],followups:[],pending:[],conflicts:[]};
 mergeSnapshot(state,{cases:[{caseId:'A',revision:2,procedure:'cloud'}],followups:[]});
 assert.equal(state.cases[0].procedure,'cloud');assert.equal(state.cases[0].revision,2);
});

test('snapshot creates conflict instead of overwriting entity with pending mutation',()=>{
 const state={cases:[{caseId:'A',revision:2,procedure:'local'}],followups:[],pending:[{mutationId:'m1',entityType:'case',entityId:'A',expectedRevision:1,payload:{caseId:'A',revision:2,procedure:'local'}}],conflicts:[]};
 mergeSnapshot(state,{cases:[{caseId:'A',revision:3,procedure:'cloud'}],followups:[]});
 assert.equal(state.cases[0].procedure,'local');assert.equal(state.conflicts.length,1);
});

test('keep-local conflict resolution creates fresh mutation against server revision',()=>{
 const state={cases:[{caseId:'A',revision:2,procedure:'local'}],followups:[],pending:[{mutationId:'old',entityType:'case',entityId:'A',expectedRevision:1,payload:{caseId:'A',revision:2,procedure:'local'}}],conflicts:[{entityType:'case',entityId:'A',server:{caseId:'A',revision:3,procedure:'cloud'}}]};
 resolveConflict(state,'case','A','KEEP_LOCAL',()=> 'new-id');
 assert.equal(state.pending.length,1);assert.equal(state.pending[0].mutationId,'new-id');assert.equal(state.pending[0].expectedRevision,3);assert.equal(state.conflicts.length,0);
});

test('use-cloud conflict resolution replaces local and drops pending mutation',()=>{
 const state={cases:[{caseId:'A',revision:2,procedure:'local'}],followups:[],pending:[{mutationId:'old',entityType:'case',entityId:'A'}],conflicts:[{entityType:'case',entityId:'A',server:{caseId:'A',revision:3,procedure:'cloud'}}]};
 resolveConflict(state,'case','A','USE_CLOUD');
 assert.equal(state.cases[0].procedure,'cloud');assert.equal(state.pending.length,0);assert.equal(state.conflicts.length,0);
});
