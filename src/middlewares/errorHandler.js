import { ErroAplicacao } from '../utils/errors.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof ErroAplicacao) {
    return res.status(err.status).json({ erro: err.message });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}
