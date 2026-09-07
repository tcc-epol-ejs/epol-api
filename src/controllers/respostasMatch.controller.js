import {
  salvarResposta,
  limparRespostas,
  buscarCompatibilidade,
} from "../services/respostasMatch.service.js";

export async function salvar(req, res, next) {
  try {
    const usuarioId = req.usuarioId;
    const { pergunta_id, valor } = req.body;

    const resposta = await salvarResposta(usuarioId, pergunta_id, valor);

    return res.status(201).json(resposta);
  } catch (err) {
    next(err);
  }
}

export async function limpar(req, res, next) {
  try {
    const usuarioId = req.usuarioId;

    const resultado = await limparRespostas(usuarioId);

    return res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function compatibilidade(req, res, next) {
  try {
    const usuarioId = req.usuarioId;

    const ranking = await buscarCompatibilidade(usuarioId);

    return res.json(ranking);
  } catch (err) {
    next(err);
  }
}
