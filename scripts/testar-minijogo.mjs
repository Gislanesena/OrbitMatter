import assert from "node:assert/strict";

await import("../js/minijogo-lua-nucleo.js");
const nucleo = globalThis.MinijogoLuaNucleo;

const ARTEFATOS = [
  {
    id: "luna-2",
    statusAtual: "fragmentado_no_impacto",
    coordenadas: { confianca: "estimada", incertezaMetros: null },
  },
  {
    id: "luna-9",
    statusAtual: "inativo_na_superficie",
    coordenadas: { confianca: "rastreada", incertezaMetros: null },
  },
  {
    id: "surveyor-1",
    statusAtual: "inativo_na_superficie",
    coordenadas: { confianca: "imageada", incertezaMetros: 5.6 },
  },
];
const PERFIS = ["preservar", "medir", "aproximar"];
const RISCOS = ["baixo", "moderado", "alto"];

function finitos(valor, caminho) {
  if (typeof valor === "number") assert.ok(Number.isFinite(valor), caminho);
  else if (Array.isArray(valor)) valor.forEach((item, i) => finitos(item, caminho + "[" + i + "]"));
  else if (valor && typeof valor === "object") {
    Object.keys(valor).forEach((chave) => finitos(valor[chave], caminho + "." + chave));
  }
}

const raios = {};
for (const artefato of ARTEFATOS) {
  for (const perfil of PERFIS) {
    for (const risco of RISCOS) {
      const cena = nucleo.cenario(artefato, perfil, risco);
      raios[artefato.id] = cena.rExclusaoMetros;
      const segura = nucleo.avaliar(cena, [{ x: -1.05, y: 0 }]);
      assert.equal(segura.seg, 100, artefato.id + " " + perfil + " segurança");
      assert.ok(segura.ciencia > 0, artefato.id + " " + perfil + " ciência");
      assert.equal(segura.violacao, "nenhuma");

      const invasora = nucleo.avaliar(cena, [{ x: 0, y: 0 }]);
      assert.ok(invasora.seg <= 50, artefato.id + " invasora");
      assert.equal(invasora.violacao, "incerteza");

      const deNovo = nucleo.avaliar(cena, [{ x: -1.05, y: 0 }]);
      assert.deepEqual(deNovo, segura);

      finitos(segura, "segura");
      finitos(invasora, "invasora");
      finitos(nucleo.avaliar(cena, []), "vazia");
      finitos(nucleo.avaliar(cena, [{ x: Number.NaN, y: 0 }, { x: -1.2, y: 0 }]), "nan");
    }
  }
}

assert.ok(raios["luna-2"] > raios["luna-9"] && raios["luna-9"] > raios["surveyor-1"], "raios diferentes");
assert.equal(raios["luna-2"], 270);
assert.equal(raios["luna-9"], 100);
assert.equal(raios["surveyor-1"], 45.6);

const surveyor = nucleo.cenario(ARTEFATOS[2], "aproximar", "alto");
const soExclusao = nucleo.avaliar(surveyor, [{ x: -0.5, y: 0 }]);
assert.equal(soExclusao.seg, 50);
assert.equal(soExclusao.violacao, "exclusao");

const longa = nucleo.avaliar(surveyor, [{ x: 10, y: 0 }]);
assert.ok(longa.truncada);
assert.ok(Math.abs(longa.comprimento - surveyor.orcamento) < 1e-6);
assert.ok(longa.comprimento < 12.4);

const aproximar = nucleo.cenario(ARTEFATOS[0], "aproximar", "baixo");
const radial = nucleo.avaliar(aproximar, [{ x: -1.05, y: 0 }]);
assert.ok(Math.abs(radial.naBanda - 0.2) < 1e-6);

const base = { seg: 40, comb: 80, orc: 10, ciencia: 60 };
const junto = nucleo.combinar(base, { seg: 100, comb: 50, ciencia: 20 });
assert.deepEqual(junto, { seg: 70, comb: 65, orc: 58, ciencia: 40 });
assert.equal(nucleo.notaDe(junto), Math.round(((70 + 65 + 58 + 40) / 4) * 0.7 + 40 * 0.3));

const auto = nucleo.combinar(base, { seg: 50, comb: 50, ciencia: 50 });
assert.equal(auto.seg, 45);
assert.equal(auto.ciencia, 55);
assert.equal(auto.comb, 65);

console.log("minijogo ok", raios);
