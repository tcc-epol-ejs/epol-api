import crypto from 'crypto';

export function gerarTokenRecuperacao() {
  return crypto.randomBytes(32).toString('hex');
}
