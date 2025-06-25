import { Router } from "express";
import axios from "axios";
// types
import type { Response } from "express";
import type { RequestBody, RequestQuery } from "../types";

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
    res.status(200).json({
        result: 1,
        message: "success",
        data: req.query,
    });
});

export default router;
