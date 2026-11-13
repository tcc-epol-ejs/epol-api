import { Router } from "express";
import {
  listar,
  listarIds,
  adicionar,
  remover,
} from "../controllers/favoritos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listar);
router.get("/ids", listarIds);

router.put("/partidos/:id", adicionar("partidos"));
router.delete("/partidos/:id", remover("partidos"));

router.put("/candidatos/:id", adicionar("candidatos"));
router.delete("/candidatos/:id", remover("candidatos"));

export default router;
