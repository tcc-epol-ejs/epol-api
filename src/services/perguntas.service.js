import { dadosPoliticosSchema } from "../config/supabaseClient.js";
import { ErroAplicacao } from "../utils/errors.js";

// LISTAR TODAS
// Por padrão retorna só as perguntas ativas (ativa = true).
// Passe { apenasAtivas: false } pra trazer todas, incluindo as desativadas.
export async function listarPerguntas({ apenasAtivas = true } = {}) {
  let query = dadosPoliticosSchema()
    .from("perguntas")
    .select("*")
    .order("categoria")
    .order("created_at");

  if (apenasAtivas) {
    query = query.eq("ativa", true);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}

// BUSCAR POR ID
export async function buscarPergunta(id) {
  const { data, error } = await dadosPoliticosSchema()
    .from("perguntas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new ErroAplicacao("Pergunta não encontrada.", 404);
  }

  return data;
}

// CADASTRAR
export async function cadastrarPergunta(pergunta) {
  const { data, error } = await dadosPoliticosSchema()
    .from("perguntas")
    .insert(pergunta)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// ATUALIZAR
export async function atualizarPergunta(id, pergunta) {
  const { data, error } = await dadosPoliticosSchema()
    .from("perguntas")
    .update(pergunta)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// EXCLUIR
export async function excluirPergunta(id) {
  const { error } = await dadosPoliticosSchema()
    .from("perguntas")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return {
    mensagem: "Pergunta excluída com sucesso.",
  };
}
