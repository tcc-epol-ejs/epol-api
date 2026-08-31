import {
  listarPerguntas,
  buscarPergunta,
  cadastrarPergunta,
  atualizarPergunta,
  excluirPergunta,
} from "../services/perguntas.service.js";

export async function listar(req, res, next) {
  try {
    // ?todas=true traz também as perguntas desativadas (uso administrativo).
    // Por padrão, só as ativas — que é o que o quiz no front deve consumir.
    const apenasAtivas = req.query.todas !== "true";

    const perguntas = await listarPerguntas({ apenasAtivas });

    return res.json(perguntas);
  } catch (err) {
    next(err);
  }
}

export async function buscar(req, res, next) {
  try {
    const pergunta = await buscarPergunta(req.params.id);

    return res.json(pergunta);
  } catch (err) {
    next(err);
  }
}

export async function cadastrar(req, res, next) {
  try {
    const pergunta = await cadastrarPergunta(req.body);

    return res.status(201).json(pergunta);
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const pergunta = await atualizarPergunta(req.params.id, req.body);

    return res.json(pergunta);
  } catch (err) {
    next(err);
  }
}

export async function excluir(req, res, next) {
  try {
    const resposta = await excluirPergunta(req.params.id);

    return res.json(resposta);
  } catch (err) {
    next(err);
  }
}
