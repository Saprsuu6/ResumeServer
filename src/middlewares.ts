import { Request, Response, NextFunction } from "express";
import { coinsList } from "./cryptoService.js";
import { neededCoins } from "./index.js";

export function log(req: Request, res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

export function cors(req: Request, res: Response, next: NextFunction): void {
  res.header("Access-Control-Allow-Origin", "*"); // Разрешить доступ со всех доменов
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
}

export async function setResCoins(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (neededCoins.length <= 0) {
    const response = await coinsList();
    req.body = response;
  }
  next();
}
