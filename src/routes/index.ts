import { Router } from "express";
// types
import type { Request, Response } from "express";
import type { RequestBody } from "../types";

const router = Router();

router.get("/now", (_req: Request, res: Response) => {
    try {
        const now = new Date().toISOString();
        res.status(200).json({ success: true, data: now });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error?.message ?? "Unknown Error" });
    }
});

router.post("/test", (req: RequestBody<any>, res: Response) => {
    res.status(200).json({ success: true, data: req.body });
});

export default router;
