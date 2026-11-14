/**
 * Missão de reserva. Entra quando o modelo está fora do ar ou devolve JSON
 * que o esquema recusa. Os números saem do artefato; os pesos só mudam com o risco.
 */
import type { Artefato } from "../../data/schemas/artifact.ts";
import { ROTULO_TIPO, type ContextoMissao, type NivelRisco } from "../esquema/contexto.ts";
import { validarMissao, type Missao, type Pesos } from "../esquema/missao.ts";

export function missaoDeReserva(artefato: Artefato, contexto: ContextoMissao): Missao {
  const estado = fraseDeEstado(artefato);
  const coordenadas = formatarCoordenadas(artefato);
  const [preservar, medir, aproximar] = pesosDoRisco(contexto.nivelRisco);

  return validarMissao(
    {
      artefatoId: artefato.id,
      titulo: `Aproximação a ${artefato.missao}`,
      briefing:
        `${artefato.missao} (${artefato.nomeOriginal}), a cargo de ${artefato.operador}, ` +
        `chegou a ${artefato.local} em ${artefato.dataUtc.slice(0, 10)}. ` +
        `Você trata o alvo como ${ROTULO_TIPO[contexto.tipoObjeto]}, a partir de ${contexto.local}, ` +
        `com risco ${contexto.nivelRisco}. ${estado}`,
      opcoes: [
        {
          id: "preservar",
          rotulo: "Manter distância e só registrar o sítio",
          pesos: preservar,
          feedbackCientifico:
            `${artefato.missao} permanece como o catálogo a descreve. ${estado} ` +
            `A observação distante conserva o sítio e gasta pouco propelente.`,
        },
        {
          id: "medir",
          rotulo: "Passagem de instrumentos sem tocar o hardware",
          pesos: medir,
          feedbackCientifico:
            `A passagem confere ${artefato.massaKg} kg (${artefato.referenciaMassa}) em ${coordenadas}. ` +
            `${primeiraFrase(artefato.historico)} O sítio fica intocado se a altitude se mantiver.`,
        },
        {
          id: "aproximar",
          rotulo: "Descida curta para inspecionar o que restou",
          pesos: aproximar,
          feedbackCientifico:
            `A descida mostra mais de ${artefato.missao} e aumenta a chance de perturbar o sítio. ` +
            `${estado} Referência do catálogo: ${coordenadas}. Risco desta jogada: ${contexto.nivelRisco}.`,
        },
      ],
    },
    { artefatoId: artefato.id, missao: artefato.missao },
  );
}

function fraseDeEstado(artefato: Artefato): string {
  if (artefato.statusAtual === "fragmentado_no_impacto") {
    return "O hardware chegou fragmentado e permanece assim no ponto de impacto.";
  }
  return "O equipamento permanece inativo na superfície desde o fim da missão.";
}

function pesosDoRisco(nivel: NivelRisco): readonly [Pesos, Pesos, Pesos] {
  if (nivel === "alto") {
    return [
      { impacto: 1, combustivel: 1, seguranca: 2 },
      { impacto: 2, combustivel: 2, seguranca: 1 },
      { impacto: 3, combustivel: 3, seguranca: 0 },
    ];
  }
  if (nivel === "moderado") {
    return [
      { impacto: 1, combustivel: 1, seguranca: 3 },
      { impacto: 2, combustivel: 2, seguranca: 2 },
      { impacto: 3, combustivel: 3, seguranca: 1 },
    ];
  }
  return [
    { impacto: 1, combustivel: 0, seguranca: 3 },
    { impacto: 2, combustivel: 1, seguranca: 3 },
    { impacto: 3, combustivel: 2, seguranca: 2 },
  ];
}

function formatarCoordenadas(artefato: Artefato): string {
  const latitude = formatarEixo(artefato.coordenadas.latitudeGraus, "N", "S");
  const longitude = formatarEixo(artefato.coordenadas.longitudeLesteGraus, "L", "O");
  return `${latitude}, ${longitude}`;
}

function formatarEixo(valor: number, positivo: string, negativo: string): string {
  if (valor === 0) {
    return "0°";
  }
  const hemisferio = valor > 0 ? positivo : negativo;
  return `${Math.abs(valor)}° ${hemisferio}`;
}

function primeiraFrase(texto: string): string {
  const corte = texto.indexOf(". ");
  return corte === -1 ? texto : texto.slice(0, corte + 1);
}
