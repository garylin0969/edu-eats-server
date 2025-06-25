import { Router } from "express";
import axios from "axios";
import https from "https";
import fs from "fs";
import path from "path";
// types
import type { Response } from "express";
import type { RequestBody, RequestQuery } from "../types";

// const ePKICert = fs.readFileSync(path.resolve(process.cwd(), "src/assets/GTLSCA.crt"), "utf8");
const ePKICert = fs.readFileSync(path.join(process.cwd(), "src", "assets", "GTLSCA.crt"), "utf8");

const httpsAgent = new https.Agent({
    ca: ePKICert,
});

const router = Router();

interface RestaurantParams {
    method: string;
    args: {
        schoolId: number;
        schoolCode: string;
        schoolName: string;
    };
}

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

router.post("/rest/API", async (req: RequestBody<RestaurantParams>, res: Response) => {
    try {
        const result = await axios.post<RestaurantResponse>(
            "https://fatraceschool.k12ea.gov.tw/cateringservice/rest/API/",
            req.body
        );

        res.status(200).json({
            result: Number(result.data.result),
            message: result.data.result_content.msg,
            data: result.data.result_content.storeList,
        });
    } catch (error: any) {
        res.status(500).json({ result: 0, message: error?.message ?? "Unknown Error" });
    }
});

router.get("/rest/test", async (req: RequestQuery<Record<string, string>>, res: Response) => {
    try {
        // const httpsAgent = new https.Agent({
        //     rejectUnauthorized: false,
        // });
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
                // headers: {
                //     Cookie: `JSESSIONID=${req.query.JSESSIONID}`,
                //     "User-Agent":
                //         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                //     Accept: "application/json, text/plain, */*",
                //     "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
                //     "Accept-Encoding": "gzip, deflate, br",
                //     "Content-Type": "application/json",
                //     Origin: "https://fatraceschool.k12ea.gov.tw",
                //     Referer: "https://fatraceschool.k12ea.gov.tw/",
                //     DNT: "1",
                //     Connection: "keep-alive",
                //     "Sec-Fetch-Dest": "empty",
                //     "Sec-Fetch-Mode": "cors",
                //     "Sec-Fetch-Site": "same-origin",
                //     "X-Requested-With": "XMLHttpRequest",
                // },
                // timeout: 30000, // 30 seconds timeout
                // maxRedirects: 5,
                // validateStatus: (status) => status < 500, // Accept all status codes below 500
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
