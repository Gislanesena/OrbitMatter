/**
 * Catálogo inicial do atlas. Três artefatos lunares, em ordem cronológica.
 * Importar este módulo já valida a lista: dado inválido falha na carga.
 *
 * Convenção de coordenadas: latitude norte-positiva; longitude leste-positiva
 * em [-180, 180]. Fontes de cada número estão no comentário do registro.
 */
import { validarCatalogo } from "./schemas/artifact.ts";

const registros = [
  {
    id: "luna-2",
    cosparId: "1959-014A",
    nomeOriginal: "Луна-2 (E-1A No.7)",
    missao: "Luna 2",
    corpo: "lua",
    // 13 set 1959, 21:02:24 UT. O anúncio soviético marca 00:02:24 de 14 set, hora de Moscou.
    dataUtc: "1959-09-13T21:02:24Z",
    operador: "União Soviética (OKB-1)",
    // Massa de voo publicada. Um inventário de peças lista 361,3 kg secos para a sonda;
    // o valor abaixo é o que a nave levava no lançamento, e com o qual impactou.
    massaKg: 390.2,
    referenciaMassa: "impacto",
    coordenadas: {
      // 29,1° N, 0° E. Estimativa histórica (Palus Putredinis); a cratera não foi fixada em imagem.
      latitudeGraus: 29.1,
      longitudeLesteGraus: 0,
      confianca: "estimada",
      incertezaMetros: null,
    },
    local: "Palus Putredinis, entre as crateras Archimedes e Autolycus",
    historico:
      "Primeiro objeto construído por humanos a atingir outro corpo celeste. " +
      "Lançada de Baikonur em 12 de setembro de 1959, liberou uma nuvem de sódio a cerca de 140.000 km da Terra e impactou a Lua no dia seguinte, a cerca de 3,3 km/s. " +
      "Os magnetômetros não encontraram campo magnético lunar apreciável nem cinturão de radiação. " +
      "O impacto espalhou flâmulas com o brasão soviético. O terceiro estágio Blok E também caiu na Lua, em ponto ainda não determinado.",
    statusAtual: "fragmentado_no_impacto",
  },
  {
    id: "luna-9",
    cosparId: "1966-006A",
    nomeOriginal: "Луна-9 (E-6M No.202 SA)",
    missao: "Luna 9",
    corpo: "lua",
    // Pouso em 3 fev 1966, 18:44:52 UT (NSSDC). Transmissões seguiram até 6 fev.
    dataUtc: "1966-02-03T18:44:52Z",
    operador: "União Soviética (Lavochkin)",
    // Massa publicada da cápsula pousada (DLR). O módulo de cruzeiro, cerca de 325 kg, impactou à parte.
    massaKg: 99,
    referenciaMassa: "pousada",
    coordenadas: {
      // 7,08° N, 295,63° E no resumo NSSDC, escritos aqui como longitude leste em [-180, 180] (−64,37°).
      latitudeGraus: 7.08,
      longitudeLesteGraus: -64.37,
      confianca: "rastreada",
      incertezaMetros: null,
    },
    local: "Oceanus Procellarum, a oeste das crateras Reiner e Marius (Planitia Descensus)",
    historico:
      "Primeiro pouso suave na Lua. A cápsula separou-se do módulo de cruzeiro, que caiu à parte, e abriu quatro pétalas no Oceanus Procellarum. " +
      "Até 6 de fevereiro de 1966 transmitiu panoramas de televisão: o solo era firme o bastante para suportar uma nave, dado usado pelos pousos tripulados seguintes. " +
      "Em 1970 a União Astronômica Internacional deu à região o nome Planitia Descensus.",
    statusAtual: "inativo_na_superficie",
  },
  {
    id: "surveyor-1",
    cosparId: "1966-045A",
    nomeOriginal: "Surveyor SC-1 (Surveyor-A)",
    missao: "Surveyor 1",
    corpo: "lua",
    // Pouso em 2 jun 1966, 06:17:36 UT. Último contato em 7 jan 1967.
    dataUtc: "1966-06-02T06:17:36Z",
    operador: "NASA (JPL)",
    // Massa no solo depois de ejetar o retrofoguete e o radar e de consumir propelente. Lançamento: 995,2 kg.
    massaKg: 294.3,
    referenciaMassa: "pousada",
    coordenadas: {
      // LROC 2016 (quadro ME): −2,4745°, 316,6602° L, incerteza 5,6 m. 316,6602° L = −43,3398°.
      latitudeGraus: -2.4745,
      longitudeLesteGraus: -43.3398,
      confianca: "imageada",
      incertezaMetros: 5.6,
    },
    local: "Oceanus Procellarum, interior do anel de Flamsteed (Flamsteed P)",
    historico:
      "Primeiro pouso suave dos Estados Unidos na Lua e ensaio de solo para a Apollo. " +
      "O módulo enviou mais de 11 mil imagens e mediu a resistência do regolito. " +
      "O radar de marcação de altitude (103,8 kg) e o retrofoguete Star 37 nº A21-26 (62,7 kg) foram ejetados e impactaram à parte. " +
      "O Lunar Reconnaissance Orbiter fotografou o módulo ainda íntegro no local de pouso.",
    statusAtual: "inativo_na_superficie",
  },
] as const;

export const catalogo = validarCatalogo(registros);
