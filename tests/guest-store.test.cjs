const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Load the isolated TypeScript adapter without introducing a test runtime dependency.
function load(relative) {
  const filename = path.join(__dirname, '..', relative);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  const localRequire = name => name.startsWith('@/') ? load(`src/${name.slice(2)}.ts`) : require(name);
  new Function('require', 'module', 'exports', source)(localRequire, mod, mod.exports);
  return mod.exports;
}
const { createGuestStore, guestBalance } = load('src/lib/guest-store.ts');
const occurredAt = new Date().toISOString();
async function request(store, url, body, method = 'POST') {
  const response = await store.request(`/api/${url}`, { method, body: JSON.stringify(body) });
  const result = await response.json();
  return { ok: response.ok, result };
}
async function fundedStore() {
  const store = createGuestStore();
  const { result: bank } = await request(store, 'banks', { name: 'Test bank' });
  const { result: wallet } = await request(store, 'wallets', { name: 'Test wallet' });
  assert.equal((await request(store, 'transactions', { type: 'INCOME', account: 'BANK', bankId: bank.id, amount: 1000, source: 'Client', occurredAt })).ok, true);
  return { store, bank, wallet };
}

test('guest stores are isolated, snapshots cannot mutate data, reset removes everything', async () => {
  const { store } = await fundedStore();
  assert.equal(createGuestStore().snapshot().banks.length, 0);
  store.snapshot().banks.splice(0);
  assert.equal(store.snapshot().banks.length, 1);
  store.reset();
  assert.ok(Object.values(store.snapshot()).every(list => list.length === 0));
});

test('transfers conserve money, reject overdrafts, and delete both ledger entries', async () => {
  const { store, bank, wallet } = await fundedStore();
  const transfer = { amount: 250, fromAccount: 'BANK', fromId: bank.id, toAccount: 'WALLET', toId: wallet.id, occurredAt };
  const { ok, result } = await request(store, 'account-transfers', transfer);
  assert.equal(ok, true);
  assert.equal(guestBalance(store.snapshot()), 1000);
  assert.equal(guestBalance(store.snapshot(), 'BANK', bank.id), 750);
  assert.equal(guestBalance(store.snapshot(), 'WALLET', wallet.id), 250);
  const before = store.snapshot();
  assert.equal((await request(store, 'account-transfers', { ...transfer, amount: 751 })).ok, false);
  assert.deepEqual(store.snapshot(), before);
  await request(store, `transactions/${result[0].id}`, undefined, 'DELETE');
  assert.equal(guestBalance(store.snapshot(), 'BANK', bank.id), 1000);
  assert.equal(guestBalance(store.snapshot(), 'WALLET', wallet.id), 0);
});

test('invalid destinations roll back; bills and pocket funding affect correct balances', async () => {
  const { store, bank } = await fundedStore();
  const before = store.snapshot();
  assert.equal((await request(store, 'account-transfers', { amount: 100, fromAccount: 'BANK', fromId: bank.id, toAccount: 'WALLET', toId: 'missing', occurredAt })).ok, false);
  assert.deepEqual(store.snapshot(), before);
  assert.equal((await request(store, 'transfers', { amount: 300, sourceType: 'BANK', bankId: bank.id, occurredAt })).ok, true);
  assert.equal((await request(store, 'bills', { biller: 'Internet', reference: '123', amount: 100, account: 'POCKET_MONEY', occurredAt })).ok, true);
  assert.equal(guestBalance(store.snapshot(), 'POCKET_MONEY'), 200);
  assert.equal(guestBalance(store.snapshot()), 900);
});

test('payout receipts create one income entry, use net conversion, and reject duplicate receipts', async () => {
  const { store, bank } = await fundedStore();
  const { result: earning } = await request(store, 'earnings', { sourceType: 'MARKETPLACE', platform: 'Fiverr', title: 'Logo', grossAmount: 100, platformFee: 20, otherFee: 0, currency: 'USD', exchangeRate: 120, status: 'AVAILABLE' });
  const receipt = { action: 'RECEIVE', account: 'BANK', bankId: bank.id, paymentMethod: 'BANK_TRANSFER' };
  assert.equal((await request(store, `earnings/${earning.id}`, receipt, 'PATCH')).ok, true);
  assert.equal(guestBalance(store.snapshot()), 10600);
  assert.equal((await request(store, `earnings/${earning.id}`, receipt, 'PATCH')).ok, false);
  assert.equal(guestBalance(store.snapshot()), 10600);
  assert.equal((await request(store, `earnings/${earning.id}`, undefined, 'DELETE')).ok, false);
});

test('loan repayments and project payments track remaining amounts and reject overpayment', async () => {
  const store = createGuestStore();
  const { result: loan } = await request(store, 'loans', { direction: 'LENT', person: 'Demo', phone: '01712345678', principal: 100, interestRate: 10 });
  assert.equal((await request(store, `loans/${loan.id}/payments`, { amount: 111 })).ok, false);
  assert.equal((await request(store, `loans/${loan.id}/payments`, { amount: 110 })).result.status, 'PAID');
  const { result: project } = await request(store, 'projects', { title: 'Website', client: 'Demo', phone: '01712345678', agreedAmount: 100, paidAmount: 20 });
  assert.equal((await request(store, `projects/${project.id}/payments`, { amount: 81 })).ok, false);
  assert.equal((await request(store, `projects/${project.id}/payments`, { amount: 80 })).result.status, 'PAID');
  assert.equal(guestBalance(store.snapshot()), 0); // Trackers do not fabricate account income.
});

test('guest actions never fall through to the authenticated API', async () => {
  const store = createGuestStore();
  const original = global.fetch;
  global.fetch = () => { throw new Error('Unexpected network request'); };
  try {
    assert.equal((await request(store, 'banks', { name: 'Local only' })).ok, true);
    assert.equal((await request(store, 'admin/users', {})).ok, false);
  } finally { global.fetch = original; }
});
