import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import clashRouter from "./clash.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clashRouter);

export default router;
