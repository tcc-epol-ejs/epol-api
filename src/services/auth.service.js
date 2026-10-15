import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usuariosSchema } from "../config/supabaseClient.js";
import { gerarTokenRecuperacao } from "../utils/tokenGenerator.js";
import { ErroAplicacao } from "../utils/errors.js";
import { enviarEmailRecuperacao } from "./email.service.js";

const SALT_ROUNDS = 10;

export async function cadastrarUsuario({
  nome,
  apelido,
  email,
  senha,
  estado,
  data_nascimento,
  partido_preferencia_id,
  foto_perfil_url,
}) {
  const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

  const { data, error } = await usuariosSchema()
    .from("usuarios")
    .insert({
      nome,
      apelido: apelido ?? null,
      email,
      senha_hash,
      estado,
      data_nascimento,
      partido_preferencia_id: partido_preferencia_id ?? null,
      foto_perfil_url: foto_perfil_url ?? null,
      // adm não é aceito aqui: usa o default (false) do banco
    })
    .select(
      "id, nome, apelido, email, estado, data_nascimento, partido_preferencia_id, foto_perfil_url, adm, created_at"
    )
    .single();

  if (error) {
    // 23505 = unique_violation no Postgres (email duplicado)
    if (error.code === "23505") {
      throw new ErroAplicacao("Este e-mail já está cadastrado.", 409);
    }
    throw error;
  }

  return data;
}

/**
 * Valida e-mail/senha e devolve um JWT de sessão.
 */
export async function autenticarUsuario({ email, senha }) {
  const { data: usuario, error } = await usuariosSchema()
    .from("usuarios")
    .select(
      "id, nome, apelido, email, senha_hash, estado, data_nascimento, partido_preferencia_id, adm, foto_perfil_url"
    )
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;

  // Mensagem genérica em ambos os casos, para não revelar se o e-mail existe.
  if (!usuario) {
    throw new ErroAplicacao("E-mail ou senha inválidos.", 401);
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    throw new ErroAplicacao("E-mail ou senha inválidos.", 401);
  }

  const token = jwt.sign(
    { sub: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  delete usuario.senha_hash;
  return { usuario, token };
}

/**
 * Gera um token em usuarios.recuperacao_senha para o e-mail informado.
 * Não lança erro se o e-mail não existir (evita enumeração de usuários).
 */
export async function solicitarRecuperacaoSenha(email) {
  const { data: usuario, error } = await usuariosSchema()
    .from("usuarios")
    .select("id, nome")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  if (!usuario) return null;

  const token = gerarTokenRecuperacao();
  const horasValidade = Number(process.env.RECUPERACAO_TOKEN_EXPIRA_HORAS || 1);
  const expira_em = new Date(
    Date.now() + horasValidade * 60 * 60 * 1000
  ).toISOString();

  const { error: insertError } = await usuariosSchema()
    .from("recuperacao_senha")
    .insert({ usuario_id: usuario.id, token, expira_em });

  if (insertError) throw insertError;

  await enviarEmailRecuperacao({ email, nome: usuario.nome, token });
  return token;
}

/**
 * Confere o token de recuperação e, se válido e não usado, troca a senha.
 */
export async function redefinirSenha({ token, novaSenha }) {
  const { data: recuperacao, error } = await usuariosSchema()
    .from("recuperacao_senha")
    .select("id, usuario_id, expira_em, usado")
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  if (!recuperacao) throw new ErroAplicacao("Token inválido.", 400);
  if (recuperacao.usado)
    throw new ErroAplicacao("Este token já foi utilizado.", 400);
  if (new Date(recuperacao.expira_em) < new Date()) {
    throw new ErroAplicacao(
      "Token expirado. Solicite a recuperação novamente.",
      400
    );
  }

  const senha_hash = await bcrypt.hash(novaSenha, SALT_ROUNDS);

  const { error: updateError } = await usuariosSchema()
    .from("usuarios")
    .update({ senha_hash })
    .eq("id", recuperacao.usuario_id);

  if (updateError) throw updateError;

  const { error: usadoError } = await usuariosSchema()
    .from("recuperacao_senha")
    .update({ usado: true })
    .eq("id", recuperacao.id);

  if (usadoError) throw usadoError;
}

export async function buscarUsuarioPorId(id) {
  const { data: usuario, error } = await usuariosSchema()
    .from("usuarios")
    .select(
      "id, nome, apelido, email, estado, data_nascimento, partido_preferencia_id, adm, foto_perfil_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!usuario) throw new ErroAplicacao("Usuário não encontrado.", 404);

  return usuario;
}

/**
 * Atualiza apenas campos permitidos do próprio usuário.
 * (adm, email e senha_hash ficam de fora de propósito.)
 */
const CAMPOS_EDITAVEIS = ["foto_perfil_url"];

export async function atualizarPerfil(id, dados) {
  const atualizacao = {};
  for (const campo of CAMPOS_EDITAVEIS) {
    if (dados[campo] !== undefined) atualizacao[campo] = dados[campo];
  }

  if (Object.keys(atualizacao).length === 0) {
    throw new ErroAplicacao("Nenhum campo válido para atualizar.", 400);
  }

  const { data, error } = await usuariosSchema()
    .from("usuarios")
    .update(atualizacao)
    .eq("id", id)
    .select(
      "id, nome, apelido, email, estado, data_nascimento, partido_preferencia_id, adm, foto_perfil_url"
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new ErroAplicacao("Usuário não encontrado.", 404);

  return data;
}


/**
 * Exclui a conta do próprio usuário, exigindo a senha atual.
 */
export async function excluirConta(id, senha) {
  const { data: usuario, error } = await usuariosSchema()
    .from("usuarios")
    .select("id, senha_hash")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!usuario) throw new ErroAplicacao("Usuário não encontrado.", 404);

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    // 403 de propósito: um 401 faria o front achar que a sessão expirou
    throw new ErroAplicacao("Senha incorreta.", 403);
  }

  const { error: deleteError } = await usuariosSchema()
    .from("usuarios")
    .delete()
    .eq("id", id);

  if (deleteError) {
    // 23503 = foreign_key_violation (ainda há dados ligados ao usuário)
    if (deleteError.code === "23503") {
      throw new ErroAplicacao(
        "Não foi possível excluir a conta: existem dados vinculados a ela.",
        409
      );
    }
    throw deleteError;
  }
}