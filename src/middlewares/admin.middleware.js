import { buscarUsuarioPorId } from "../services/auth.service.js";
import { ErroAplicacao } from "../utils/errors.js";

export async function verificarAdmin(req, res, next) {
  try {
    const usuario = await buscarUsuarioPorId(req.usuarioId);
    if (!usuario.adm)
      throw new ErroAplicacao("Acesso restrito a administradores.", 403);
    next();
  } catch (err) {
    next(err);
  }
}
