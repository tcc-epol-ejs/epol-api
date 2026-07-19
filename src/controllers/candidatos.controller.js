import {
  listarCandidatos,
  buscarCandidato,
  cadastrarCandidato,
  atualizarCandidato,
  excluirCandidato,
} from "../services/candidatos.service.js";

export async function listar(req, res, next) {
  try {
    const candidatos = await listarCandidatos();
    return res.json(candidatos);
  } catch (err) {
    next(err);
  }
}

export async function buscar(req, res, next) {
  try {
    const candidato = await buscarCandidato(req.params.id);
    return res.json(candidato);
  } catch (err) {
    next(err);
  }
}

export async function cadastrar(req, res, next) {
  try {
    const candidato = await cadastrarCandidato(req.body);
    return res.status(201).json(candidato);
  } catch (err) {
    next(err);
  }
}

export async function atualizar(req, res, next) {
  try {
    const candidato = await atualizarCandidato(req.params.id, req.body);

    return res.json(candidato);
  } catch (err) {
    next(err);
  }
}

export async function excluir(req, res, next) {
  try {
    const resposta = await excluirCandidato(req.params.id);
    return res.json(resposta);
  } catch (err) {
    next(err);
  }
}
