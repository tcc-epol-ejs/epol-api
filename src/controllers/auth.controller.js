import {
  cadastrarUsuario,
  autenticarUsuario,
  solicitarRecuperacaoSenha,
  redefinirSenha,
  buscarUsuarioPorId,
  atualizarPerfil,
  excluirConta,
} from "../services/auth.service.js";

export async function me(req, res, next) {
  try {
    const usuario = await buscarUsuarioPorId(req.usuarioId);
    return res.json({ usuario });
  } catch (err) {
    next(err);
  }
}

export async function cadastro(req, res, next) {
  try {
    const {
      nome,
      apelido,
      email,
      senha,
      estado,
      data_nascimento,
      partido_preferencia_id,
      foto_perfil_url,
    } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Campos obrigatórios: nome, email, senha.",
      });
    }

    const usuario = await cadastrarUsuario({
      nome,
      apelido,
      email,
      senha,
      estado,
      data_nascimento,
      partido_preferencia_id,
      foto_perfil_url,
    });

    return res.status(201).json({ usuario });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
    }

    const { usuario, token } = await autenticarUsuario({ email, senha });
    return res.json({ usuario, token });
  } catch (err) {
    next(err);
  }
}

export async function solicitarRecuperacao(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: "E-mail é obrigatório." });
    }

    await solicitarRecuperacaoSenha(email);

    // Resposta sempre genérica, exista ou não o e-mail no banco.
    return res.json({
      mensagem: "Se o e-mail existir, um link de recuperação será enviado.",
    });
  } catch (err) {
    next(err);
  }
}

export async function redefinir(req, res, next) {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res
        .status(400)
        .json({ erro: "Token e novaSenha são obrigatórios." });
    }

    await redefinirSenha({ token, novaSenha });
    return res.json({ mensagem: "Senha redefinida com sucesso." });
  } catch (err) {
    next(err);
  }
}

export async function editarPerfil(req, res, next) {
  try {
    const { foto_perfil_url } = req.body;

    if (
      foto_perfil_url !== undefined &&
      foto_perfil_url !== null &&
      typeof foto_perfil_url !== "string"
    ) {
      return res
        .status(400)
        .json({ erro: "foto_perfil_url deve ser um texto." });
    }

    const usuario = await atualizarPerfil(req.usuarioId, { foto_perfil_url });
    return res.json({ usuario });
  } catch (err) {
    next(err);
  }
}

export async function excluirMinhaConta(req, res, next) {
  try {
    const { senha } = req.body;

    if (!senha || typeof senha !== "string") {
      return res.status(400).json({ erro: "Informe sua senha." });
    }

    await excluirConta(req.usuarioId, senha);
    return res.json({ mensagem: "Conta excluída com sucesso." });
  } catch (err) {
    next(err);
  }
}