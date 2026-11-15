/**
 * Confere o retrato da efeméride e o leitor do Horizons.
 * Não chama a rede. Rode com: node deep-space/checar.mjs
 */
import fs from 'node:fs';
import vm from 'node:vm';

const context = {
  console,
  fetch,
  localStorage: { getItem() { return null; }, setItem() {} },
  document: {
    addEventListener() {},
    getElementById() { return null; },
    querySelector() { return null; },
  },
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('./voyager-1.js', import.meta.url), 'utf8'), context);

const ds = context.DeepSpace;
const sample = `
$$SOE
 2026-Nov-14 00:00     173.067682711039  27.1464777
 2026-Nov-15 00:00     173.083248374167  26.7585866
$$EOE
Target body name: Voyager 1 (spacecraft) (-31)    {source: Voyager_1_ST+refit2022_m}
1 au= 149597870.700 km
`;

const row = ds.parseBlock(sample);
if (row.deltaAu !== 173.067682711039) throw new Error('delta AU');
if (row.deldotKmS !== 27.1464777) throw new Error('deldot');
if (row.epoch !== '2026-Nov-14 00:00 UT') throw new Error('epoca');
if (!row.kernel.includes('Voyager_1_ST+refit2022_m')) throw new Error('kernel');

const snap = ds.snapshot;
if (snap.earth.deltaAu !== 173.067682711039) throw new Error('retrato Terra');
if (snap.sun.deltaAu !== 172.336397702297) throw new Error('retrato Sol');
if (snap.auKm !== 149597870.7) throw new Error('UA');

const km = Math.round(snap.earth.deltaAu * snap.auKm);
if (km < 25_000_000_000 || km > 26_000_000_000) throw new Error('km fora da ordem do dia-luz: ' + km);

let broke = false;
try { ds.parseBlock('sem dados'); } catch (e) { broke = true; }
if (!broke) throw new Error('texto invalido deveria falhar');

console.log('checar.mjs ok', { km, epoch: row.epoch, kernel: row.kernel });
