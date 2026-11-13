import {
  listarFavoritos,
  listarIdsFavoritos,
  favoritar,
  desfavoritar,
} from "../services/favoritos.service.js";

export async function listar(req, res, next) {
  try {
    return res.json(await listarFavoritos(req.usuarioId));
  } catch (err) {
    next(err);
  }
}

export async function listarIds(req, res, next) {
  try {
    return res.json(await listarIdsFavoritos(req.usuarioId));
  } catch (err) {
    next(err);
  }
}

export function adicionar(tipo) {
  return async (req, res, next) => {
    try {
      await favoritar(tipo, req.usuarioId, req.params.id);
      return res.json({ favorito: true });
    } catch (err) {
      next(err);
    }
  };
}

export function remover(tipo) {
  return async (req, res, next) => {
    try {
      await desfavoritar(tipo, req.usuarioId, req.params.id);
      return res.json({ favorito: false });
    } catch (err) {
      next(err);
    }
  };
}
