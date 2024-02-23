import { Request, Response, NextFunction } from "express";

function log(req: Request, res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

export default log;
