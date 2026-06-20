import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usuariosSchema } from "../config/supabaseClient.js";
import { gerarTokenRecuperacao } from "../utils/tokenGenerator.js";
import { ErroAplicacao } from "../utils/errors.js";
import { enviarEmailRecuperacao } from "./email.service.js";

const SALT_ROUNDS = 10;

/**
 * Cadastra um novo usuário em usuarios.usuarios.
 * A senha nunca é armazenada em texto puro — apenas o hash bcrypt.
 */
export async function cadastrarUsuario({
  nome,
  apelido,
  email,
  senha,
  estado,
  data_nascimento,
  partido_preferencia_id,
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
    })
    .select(
      "id, nome, apelido, email, estado, data_nascimento, partido_preferencia_id, created_at"
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
    .select("id, nome, apelido, email, senha_hash, estado")
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
