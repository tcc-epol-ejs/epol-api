import { dadosPoliticosSchema } from "../config/supabaseClient.js";
import { ErroAplicacao } from "../utils/errors.js";

// LISTAR TODOS
export async function listarCandidatos() {
  const { data, error } = await dadosPoliticosSchema()
    .from("candidatos")
    .select(
      `
      *,
      partidos (
        id,
        nome_completo,
        sigla,
        numero_legenda,
        bandeira_url
      )
    `
    )
    .order("nome_politico");

  if (error) throw error;

  return data;
}

// BUSCAR POR ID
export async function buscarCandidato(id) {
  const { data, error } = await dadosPoliticosSchema()
    .from("candidatos")
    .select(
      `
      *,
      partidos (
        id,
        nome_completo,
        sigla,
        numero_legenda,
        bandeira_url
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new ErroAplicacao("Candidato não encontrado.", 404);
  }

  return data;
}

// CADASTRAR
export async function cadastrarCandidato(candidato) {
  const { data, error } = await dadosPoliticosSchema()
    .from("candidatos")
    .insert(candidato)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// EDITAR
export async function atualizarCandidato(id, candidato) {
  const { data, error } = await dadosPoliticosSchema()
    .from("candidatos")
    .update(candidato)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// EXCLUIR
export async function excluirCandidato(id) {
  const { error } = await dadosPoliticosSchema()
    .from("candidatos")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return {
    mensagem: "Candidato excluído com sucesso.",
  };
}
