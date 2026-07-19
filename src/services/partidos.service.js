import { dadosPoliticosSchema } from "../config/supabaseClient.js";
import { ErroAplicacao } from "../utils/errors.js";

// LISTAR TODOS
export async function listarPartidos() {
  const { data, error } = await dadosPoliticosSchema()
    .from("partidos")
    .select("*")
    .order("sigla");

  if (error) throw error;

  return data;
}

// BUSCAR POR ID
export async function buscarPartido(id) {
  const { data, error } = await dadosPoliticosSchema()
    .from("partidos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new ErroAplicacao("Partido não encontrado.", 404);
  }

  return data;
}

// CADASTRAR
export async function cadastrarPartido(partido) {
  const { data, error } = await dadosPoliticosSchema()
    .from("partidos")
    .insert(partido)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// ATUALIZAR
export async function atualizarPartido(id, partido) {
  const { data, error } = await dadosPoliticosSchema()
    .from("partidos")
    .update(partido)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// EXCLUIR
export async function excluirPartido(id) {
  const { error } = await dadosPoliticosSchema()
    .from("partidos")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return {
    mensagem: "Partido excluído com sucesso.",
  };
}
