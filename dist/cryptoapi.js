import fetch from "node-fetch";
import { Redis } from "./redis.js";
export let key_crypto = "key_crypto";
export async function ticker(message, text) {
    try {
        const code = `${text.substring(1).toUpperCase()}USDT`;
        // 👇️ const response: Response // 美国：api.binance.us，其他：api.binance.com
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${code}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }
        // 👇️ const result:
        const result = JSON.stringify((await response.json()));
        const w = JSON.parse(result);
        if (!`${w.code}`) {
            return "";
        }
        const pre = await Redis.getSetEx(`${key_crypto}${w.symbol}`, `${w.price}`, 3600);
        const zd = pre === null ? `-` : pre > w.price ? `📉` : pre === w.price ? `-` : `📈`;
        return `${w.symbol}:${w.price} ${zd}`;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return '';
        }
        else {
            console.log('unexpected error: ', error);
            return '';
        }
    }
}
export async function kline(message, text) {
    try {
        const code = `${text.substring(2).toUpperCase()}USDT`;
        // 👇️ const response: Response // 美国：api.binance.us，其他：api.binance.com
        const response = await fetch(`https://api.binance.com/api/v3/uiKlines?symbol=${code}&interval=30m&limit=1`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }
        // 👇️ const result:
        const result = JSON.stringify((await response.json()));
        const w = JSON.parse(result);
        if (!`${w.code}`) {
            return "";
        }
        const begin = changeTime(w[0][0]);
        const end = changeTime(w[0][6]);
        const zd = w[0][1] > w[0][4] ? `📉` : w[0][1] === w[0][4] ? `-` : `📈`;
        return `${code}:${begin} — ${end}🀅\n`
            + `--------------------------\n`
            + `开盘价：${w[0][1]}\n`
            + `最高价：${w[0][2]}\n`
            + `最低价：${w[0][3]}\n`
            + `收盘价：${w[0][4]} ${zd}\n`;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return '';
        }
        else {
            console.log('unexpected error: ', error);
            return '';
        }
    }
}
/**
 * 时间格式 普通时间戳转换时间
 * @param value 时间戳
 */
export function changeTime(value) {
    let date = new Date(value);
    // 服务器在美国 UTC+0,所以要转换时区
    date.setHours(date.getHours() + 8);
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    return `${hours}:${minutes}`;
}
