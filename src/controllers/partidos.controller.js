import {
  listarPartidos,
  buscarPartido,
  cadastrarPartido,
  atualizarPartido,
  excluirPartido,
} from "../services/partidos.service.js";

export async function listar(req, res, next) {
  try {
    const partidos = await listarPartidos();

    return res.json(partidos);
  } catch (err) {
    next(err);
  }
}

export async function buscar(req, res, next) {
  try {
    const partido = await buscarPartido(req.params.id);

    return res.json(partido);
  } catch (err) {
    next(err);
  }
}

export async function cadastrar(req, res, next) {
  try {
    const partido = await cadastrarPartido(req.body);

    return res.status(201).json(partido);
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const partido = await atualizarPartido(req.params.id, req.body);

    return res.json(partido);
  } catch (err) {
    next(err);
  }
}

export async function excluir(req, res, next) {
  try {
    const resposta = await excluirPartido(req.params.id);

    return res.json(resposta);
  } catch (err) {
    next(err);
  }
}
