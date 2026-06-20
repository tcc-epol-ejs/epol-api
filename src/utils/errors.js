export class ErroAplicacao extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ErroAplicacao';
    this.status = status;
  }
}
