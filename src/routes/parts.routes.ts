import { Router } from "express";
import { listParts, getPart } from "../controllers/parts.controller";

const router = Router();

router.get("/parts", listParts);
router.get("/parts/:id", getPart);

export default router;