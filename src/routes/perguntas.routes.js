import { Router } from "express";

import {
  listar,
  buscar,
  cadastrar,
  atualizar,
  excluir,
} from "../controllers/perguntas.controller.js";

const router = Router();

router.get("/", listar);
router.get("/:id", buscar);
router.post("/", cadastrar);
router.put("/:id", atualizar);
router.delete("/:id", excluir);

export default router;
