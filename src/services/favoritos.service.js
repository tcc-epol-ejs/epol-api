import {
  usuariosSchema,
  dadosPoliticosSchema,
} from "../config/supabaseClient.js";
import { ErroAplicacao } from "../utils/errors.js";

const TIPOS = {
  partidos: {
    tabela: "favoritos_partidos",
    coluna: "partido_id",
    naoEncontrado: "Partido não encontrado.",
  },
  candidatos: {
    tabela: "favoritos_candidatos",
    coluna: "candidato_id",
    naoEncontrado: "Candidato não encontrado.",
  },
};

// ids favoritados, do mais recente pro mais antigo
async function idsFavoritos(tipo, usuarioId) {
  const { tabela, coluna } = TIPOS[tipo];
  const { data, error } = await usuariosSchema()
    .from(tabela)
    .select(coluna)
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map((linha) => linha[coluna]);
}

export async function listarIdsFavoritos(usuarioId) {
  const [partidos, candidatos] = await Promise.all([
    idsFavoritos("partidos", usuarioId),
    idsFavoritos("candidatos", usuarioId),
  ]);
  return { partidos, candidatos };
}

export async function listarFavoritos(usuarioId) {
  const { partidos: idsP, candidatos: idsC } = await listarIdsFavoritos(
    usuarioId
  );

  const vazio = { data: [], error: null };

  const [resP, resC] = await Promise.all([
    idsP.length
      ? dadosPoliticosSchema()
          .from("partidos")
          .select("id, nome_completo, sigla, bandeira_url")
          .in("id", idsP)
      : vazio,
    idsC.length
      ? dadosPoliticosSchema()
          .from("candidatos")
          .select(
            "id, nome_completo, nome_politico, foto_url, cargo_atual, partidos (id, sigla)"
          )
          .in("id", idsC)
      : vazio,
  ]);

  if (resP.error) throw resP.error;
  if (resC.error) throw resC.error;

  // o .in() não garante ordem: reaplica a ordem dos favoritos
  const ordenar = (lista, ids) =>
    ids.map((id) => lista.find((item) => item.id === id)).filter(Boolean);

  return {
    partidos: ordenar(resP.data, idsP),
    candidatos: ordenar(resC.data, idsC),
  };
}

export async function favoritar(tipo, usuarioId, itemId) {
  const { tabela, coluna, naoEncontrado } = TIPOS[tipo];

  const { error } = await usuariosSchema()
    .from(tabela)
    .upsert(
      { usuario_id: usuarioId, [coluna]: itemId },
      { onConflict: `usuario_id,${coluna}`, ignoreDuplicates: true }
    );

  if (error) {
    // 23503 = foreign_key_violation (o partido/candidato não existe)
    if (error.code === "23503") throw new ErroAplicacao(naoEncontrado, 404);
    // 22P02 = id com formato inválido (não é uuid)
    if (error.code === "22P02")
      throw new ErroAplicacao("Identificador inválido.", 400);
    throw error;
  }
}

export async function desfavoritar(tipo, usuarioId, itemId) {
  const { tabela, coluna } = TIPOS[tipo];

  const { error } = await usuariosSchema()
    .from(tabela)
    .delete()
    .eq("usuario_id", usuarioId)
    .eq(coluna, itemId);

  if (error) {
    if (error.code === "22P02")
      throw new ErroAplicacao("Identificador inválido.", 400);
    throw error;
  }
}
