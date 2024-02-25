const baseUrl = "https://api.coingecko.com/api/v3";
export async function ping() {
    return (await fetch(`${baseUrl}/ping`)).json();
}
export async function coinsList() {
    return (await fetch(`${baseUrl}/coins/list`)).json();
}
export async function coinsInfo() {
    const response = await fetch(`${baseUrl}/coins/markets/?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h&locale=en&precision=full`);
    if (response.status !== 200)
        throw new Error("Crypto API error");
    else
        return response.json();
}
//# sourceMappingURL=cryptoService.js.map