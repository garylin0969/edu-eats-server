import { Router } from 'express';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// types
import type { Response } from 'express';
import type { RequestQuery } from '../types';

type RemoveUndefined<T> = {
    [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>;
};

const objectRemoveUndefined = <T extends Record<string, unknown>>(obj: T): RemoveUndefined<T> => {
    const result = {} as RemoveUndefined<T>;

    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            (result as Record<string, unknown>)[key] = value;
        }
    }

    return result;
};

// const ePKICert = fs.readFileSync(path.join(process.cwd(), "src", "assets", "GTLSCA.crt"), "utf8");
const ePKICert = fs.readFileSync(path.join(process.cwd(), 'src', 'assets', 'GTLSCA.pem'), 'utf8');

const httpsAgent = new https.Agent({
    ca: ePKICert,
    // ca: process.env.TLS_PEM ?? "",
});

const router = Router();

router.get('/rest/API', async (req: RequestQuery<Record<string, string>>, res: Response) => {
    const args = objectRemoveUndefined({
        schoolId: req.query.schoolId ? Number(req.query.schoolId) : undefined,
        schoolCode: req.query.schoolCode,
        schoolName: req.query.schoolName,
        func: req.query.func,
        storeId: req.query.storeId,
    });

    const body = {
        method: req.query.method,
        token: req.query.token,
        username: req.query.username,
        args: args,
    };

    try {
        const result = await axios.post(
            'https://fatraceschool.k12ea.gov.tw/cateringservice/rest/API/',
            objectRemoveUndefined(body),
            {
                httpsAgent,
            }
        );

        res.status(200).json({
            result: 1,
            message: result.data.result_content.msg,
            data: result.data.result_content[req.query.key],
        });
    } catch (error: any) {
        console.error('API request failed:', {
            error: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
        });

        res.status(500).json({
            result: 0,
            message: error?.message ?? 'Unknown Error',
            details: error.response?.data || null,
        });
    }
});

export default router;
