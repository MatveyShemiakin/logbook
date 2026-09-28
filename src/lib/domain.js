export const STATUSES = ['PRIVATE','RESEARCH','IP_HOLD','PUBLIC_READY'];
export const SPECIALTIES = ['Cataract','Cornea','Glaucoma','IOL fixation / dislocation','Vitreoretinal','Trauma','Combined','Other'];
export const ROLE_DEFAULT = 'Primary surgeon — independent';

export function nextCaseId(year, existingIds = []) {
  const re = new RegExp(`^MS-${year}-(\\d{4,})$`);
  let max = 0;
  for (const id of existingIds) {
    const m = String(id).match(re);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `MS-${year}-${String(max + 1).padStart(4,'0')}`;
}

export function scanForIdentifiers(text='') {
  const s = String(text);
  const findings = [];
  const patterns = [
    ['medical-record-number', /(?:ИБ|истори(?:я|и)\s+болезни|medical\s*record|MRN)\s*[:№#-]?\s*\d{3,}/ig],
    ['phone', /(?:\+?7|8)[\s()-]*\d{3}[\s()-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g],
    ['email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig],
    ['full-date-of-birth', /(?:дата\s+рождения|dob)\s*[: -]?\s*\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}/ig],
    ['passport', /(?:паспорт|passport)\s*[:№#-]?\s*[A-ZА-Я0-9 -]{6,}/ig],
  ];
  for (const [type, re] of patterns) {
    const matches = s.match(re) || [];
    for (const match of matches) findings.push({type, match});
  }
  return findings;
}

function required(value, name) {
  if (value == null || String(value).trim() === '') throw new Error(`${name} is required`);
  return String(value).trim();
}

export function validateCase(input) {
  const c = {...input};
  c.caseId = required(c.caseId, 'caseId');
  if (!/^MS-\d{4}-\d{4,}$/.test(c.caseId)) throw new Error('caseId must match MS-YYYY-####');
  c.surgeryDate = required(c.surgeryDate, 'surgeryDate');
  c.specialty = required(c.specialty, 'specialty');
  c.procedure = required(c.procedure, 'procedure');
  c.eye = required(c.eye, 'eye');
  c.role ||= ROLE_DEFAULT;
  c.status ||= 'PRIVATE';
  if (!STATUSES.includes(c.status)) throw new Error('invalid status');
  if (c.status === 'PUBLIC_READY' && c.consentPublic !== 'Yes') throw new Error('PUBLIC_READY requires public consent');
  c.complexity ||= 'Routine';
  c.caseType ||= 'Elective';
  c.intraComplication ||= 'No';
  c.postComplication ||= 'No';
  c.reintervention ||= 'No';
  c.archived = Boolean(c.archived);
  c.revision = Number(c.revision || 1);
  c.createdAt ||= new Date().toISOString();
  c.updatedAt = new Date().toISOString();
  const freeText = [c.diagnosis,c.riskFactors,c.keyTechnique,c.clinicalPearl,c.notes].filter(Boolean).join('\n');
  const findings = scanForIdentifiers(freeText);
  if (findings.length && !c.privacyOverride) {
    const err = new Error('possible direct patient identifier detected');
    err.findings = findings;
    throw err;
  }
  return c;
}

export function canTransitionStatus(from, to, explicitOwnerConfirmation=false) {
  if (!STATUSES.includes(from) || !STATUSES.includes(to)) return false;
  if (from === 'IP_HOLD' && to === 'PUBLIC_READY') return Boolean(explicitOwnerConfirmation);
  return true;
}

export function computeMetrics(cases=[], followups=[]) {
  const active = cases.filter(c => !c.archived);
  const bySpecialty = {};
  for (const c of active) bySpecialty[c.specialty] = (bySpecialty[c.specialty] || 0) + 1;
  const withFollowup = new Set(followups.map(f => f.caseId));
  return {
    total: active.length,
    primaryIndependent: active.filter(c => c.role === ROLE_DEFAULT).length,
    complex: active.filter(c => ['Complex','Very complex'].includes(c.complexity)).length,
    intraComplications: active.filter(c => c.intraComplication && c.intraComplication !== 'No').length,
    postComplications: active.filter(c => c.postComplication && c.postComplication !== 'No').length,
    reinterventions: active.filter(c => c.reintervention && c.reintervention !== 'No').length,
    research: active.filter(c => c.status === 'RESEARCH').length,
    ipHold: active.filter(c => c.status === 'IP_HOLD').length,
    followupComplete: active.length ? Math.round((active.filter(c=>withFollowup.has(c.caseId)).length/active.length)*100) : 0,
    bySpecialty,
  };
}

export function lastConsecutiveCataracts(cases=[], limit=100) {
  return cases.filter(c => !c.archived && c.specialty === 'Cataract' && c.role === ROLE_DEFAULT)
    .sort((a,b) => `${b.surgeryDate}|${b.caseId}`.localeCompare(`${a.surgeryDate}|${a.caseId}`))
    .slice(0, limit);
}

export function vrOutcomes(cases=[], followups=[]) {
  const vr = cases.filter(c => !c.archived && c.specialty === 'Vitreoretinal');
  const latest = new Map();
  for (const f of followups) {
    if (!latest.has(f.caseId) || String(f.date) > String(latest.get(f.caseId).date)) latest.set(f.caseId, f);
  }
  const rrd = vr.filter(c => ['RRD','TRD','Combined'].includes(c.vr?.detachmentType));
  const evaluable = rrd.filter(c => latest.get(c.caseId)?.retinalAttachment);
  const primary = evaluable.filter(c => latest.get(c.caseId).retinalAttachment === 'Attached — primary').length;
  const finalAttached = evaluable.filter(c => ['Attached — primary','Attached — after reoperation'].includes(latest.get(c.caseId).retinalAttachment)).length;
  return {cases: vr.length, detachmentCases: rrd.length, evaluable: evaluable.length, primaryAttached: primary, finalAttached};
}
