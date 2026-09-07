import {
  usuariosSchema,
  dadosPoliticosSchema,
} from "../config/supabaseClient.js";

// SALVAR/ATUALIZAR UMA RESPOSTA (upsert — cada pergunta só tem uma resposta por usuário)
export async function salvarResposta(usuarioId, perguntaId, valor) {
  const { data, error } = await usuariosSchema()
    .from("respostas_usuario")
    .upsert(
      { usuario_id: usuarioId, pergunta_id: perguntaId, valor },
      { onConflict: "usuario_id,pergunta_id" }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

// LIMPAR TODAS AS RESPOSTAS DE UM USUÁRIO
// Chamado antes de começar uma nova tentativa do quiz, pra não misturar
// respostas de perguntas sorteadas em tentativas antigas com as atuais.
export async function limparRespostas(usuarioId) {
  const { error } = await usuariosSchema()
    .from("respostas_usuario")
    .delete()
    .eq("usuario_id", usuarioId);

  if (error) throw error;

  return { mensagem: "Respostas anteriores removidas." };
}

// BUSCAR COMPATIBILIDADE — chama a função calcular_compatibilidade do Postgres
// A função vive no schema dados_politicos, então precisa ser chamada pelo
// client escopado a esse schema (o client "cru" só enxerga o schema public).
export async function buscarCompatibilidade(usuarioId) {
  const { data, error } = await dadosPoliticosSchema().rpc(
    "calcular_compatibilidade",
    {
      p_usuario_id: usuarioId,
    }
  );

  if (error) throw error;

  return data;
}
