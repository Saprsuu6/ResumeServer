import { PingResponse } from "./interfaces.js";

const baseUrl = "https://api.coingecko.com/api/v3";

export async function ping(): Promise<PingResponse> {
  return (await fetch(`${baseUrl}/ping`)).json() as Promise<PingResponse>;
}

export async function coinsList() {
  return (await fetch(`${baseUrl}/coins/list`)).json();
}
