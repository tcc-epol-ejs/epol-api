import { Router } from "express";

import {
  salvar,
  limpar,
  compatibilidade,
} from "../controllers/respostasMatch.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken); // todas as rotas abaixo exigem usuário logado

router.post("/", salvar);
router.delete("/", limpar);
router.get("/compatibilidade", compatibilidade);

export default router;
