import { Router } from "express";
import { listParts, getPart, addPart } from "../controllers/parts.controller";

const router = Router();


router.get("/parts", listParts);
router.get("/parts/:id", getPart);
router.post("/add-part", addPart);

export default router;