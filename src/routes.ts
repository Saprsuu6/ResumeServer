import express from "express";
import { coinsList, ping } from "./cryptoService.js";
import { PingResponse } from "./interfaces.js";

const router = express.Router();

router.route("/cryptoPing").get(async (req, res) => {
  const response: Promise<PingResponse> = ping();

  // to send only string
  // res.send((await response).gecko_says);

  response.then((data) => {
    res.send(data);
  });
});

router.route("/getCryptoInfo").get(async (req, res) => {
  const response = await coinsList();
  res.send(response);
});

export default router;
