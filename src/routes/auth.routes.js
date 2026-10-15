import { Router } from "express";
import {
  cadastro,
  login,
  solicitarRecuperacao,
  redefinir,
  me,
  editarPerfil,
  excluirMinhaConta,
} from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/cadastro", cadastro);
router.post("/login", login);
router.post("/recuperar-senha", solicitarRecuperacao);
router.post("/redefinir-senha", redefinir);
router.get("/me", verificarToken, me);
router.patch("/perfil", verificarToken, editarPerfil);
router.delete("/conta", verificarToken, excluirMinhaConta);

export default router;
