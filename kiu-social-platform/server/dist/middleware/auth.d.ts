import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
export interface AuthRequest extends Request {
    user?: User;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const authenticatePIN: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map