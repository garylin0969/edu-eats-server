import { Router } from "express";
import axios from "axios";
import https from "https";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// types
import type { Response } from "express";
import type { RequestQuery } from "../types";

// const ePKICert = fs.readFileSync(path.join(process.cwd(), "src", "assets", "GTLSCA.crt"), "utf8");
const ePKICert = fs.readFileSync(path.join(process.cwd(), "src", "assets", "GTLSCA.pem"), "utf8");

const httpsAgent = new https.Agent({
    ca: ePKICert,
    // ca: process.env.TLS_PEM ?? "",
});

const router = Router();

interface RestaurantResponse {
    result_content: {
        resStatus: number;
        msg: string;
        storeList: {
            storeId: string;
            storeName: string;
            schoolId: string;
            schoolName: string;
            storeTypeCode: string;
            storeTypeName: string;
            storeParentCode: string;
            storeParentName: string;
            storeCode: string;
            sfStreetId: string;
            enable: string;
            logo: string;
        }[];
    };
    resource: string;
    method: string;
    result: string;
    error_msg: string;
}

router.get("/rest/test", async (req: RequestQuery<Record<string, string>>, res: Response) => {
    try {
        // console.log("ePKICert: ", ePKICert);
        // console.log("TLS_PEM: ", process.env.TLS_PEM);
        // const singleLine = process.env.TLS_PEM!.trim().replace(/\r?\n/g, "\\n");
        // console.log("--------------------------------");
        // console.log(singleLine);
        const result = await axios.post<RestaurantResponse>(
            "https://fatraceschool.k12ea.gov.tw/cateringservice/rest/API/",
            {
                method: req.query.method,
                args: {
                    schoolId: Number(req.query.schoolId),
                    schoolCode: req.query.schoolCode ?? "",
                    schoolName: req.query.schoolName ?? "",
                },
            },
            {
                httpsAgent,
            }
        );

        res.status(200).json({
            result: 1,
            message: "success",
            data: result.data,
        });
    } catch (error: any) {
        console.error("API request failed:", {
            error: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
        });

        res.status(500).json({
            result: 0,
            message: error?.message ?? "Unknown Error",
            details: error.response?.data || null,
        });
    }
});

export default router;
