import { Router } from 'express';
import { cadastro, login, solicitarRecuperacao, redefinir } from '../controllers/auth.controller.js';

const router = Router();

router.post('/cadastro', cadastro);
router.post('/login', login);
router.post('/recuperar-senha', solicitarRecuperacao);
router.post('/redefinir-senha', redefinir);

export default router;
