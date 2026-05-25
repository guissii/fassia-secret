import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
type ZodTypeAny = z.ZodTypeAny;

export const validate = (schema: ZodTypeAny) => 
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((issue) => ({ 
            path: issue.path.join('.'), 
            message: issue.message 
          }))
        });
        return;
      }
      next(error);
    }
  };