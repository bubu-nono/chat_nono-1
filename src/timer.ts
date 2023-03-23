import schedule from "node-schedule";
import {RoomInterface, WechatyInterface} from "wechaty/impls";
import {ChatGPTBot} from "./chatgpt.js";
import {kline, ticker2} from "./cryptoapi.js";
import {Redis} from "./redis.js";

var jobs = {}
var hash = "token_users";
var key_crypto_gj = "key_crypto_gj";

export function w_everyday(jobid: string, weChatBot: WechatyInterface, chatGPTBot: ChatGPTBot) {
    //分 時 日 月 星期
    // @ts-ignore
    jobs[jobid] = schedule.scheduleJob('00 20 00 * * *', async function () {
        console.log(`定时任务发送天气：${new Date().toLocaleString()}`);
        await timer(weChatBot, chatGPTBot);
    });
}

async function timer(weChatBot: WechatyInterface, chatGPTBot: ChatGPTBot) {
    const em = await weChatBot.Contact.find('Em.');
    const sysReply = await chatGPTBot.weather("杭州");
    // @ts-ignore
    await em.say(`早安，亲爱的：\n  今天又是美好的一天~\n${sysReply}`);
}

export function m30_tAndk(jobid: string, weChatBot: WechatyInterface) {
    // @ts-ignore
    jobs[jobid] = schedule.scheduleJob('00 */5 0-16 * * *', async function () {
        console.log(`定时任务发送行情：${new Date().toLocaleString()}`);
        // @ts-ignore
        const a: RoomInterface = await weChatBot.Room.find('BM小卡片输出小组');
        await warn(a, "ETH", weChatBot);
        await warn(a, "BTC", weChatBot);
    });
}

async function warn(a: RoomInterface, code: string, weChatBot: WechatyInterface) {
    let t_eth: string = await ticker2(`/${code}`);
    if (t_eth === "") {
        console.log(`💥查询${code}行情异常~`)
        return;
    }
    const arr1 = t_eth.split(":");
    const price: string = arr1[1];
    const pre: string | null = await Redis.getSetEx(`${key_crypto_gj}${code}`, `${price}`, 3600);
    if (pre === null) {
        console.log(`⚠️缓存没有前一次${code}行情数据~`)
        return;
    }
    // @ts-ignore
    let x = (pre - price) / price;
    const zd = x > 0 ? `📈` : `📉`
    let abs_x = Math.abs(x);
    console.log(`${zd}${code}:${price} 涨跌:${x}`)
    if (abs_x > 0.02) {
        // @ts-ignore
        await a.say(`${t_eth} ${zd}:${abs_x}`);
        let k_eth = await kline(new weChatBot.Message, `k/${code}`);
        // @ts-ignore
        await a.say(k_eth);
    }
}

export function w_test(jobid: string, weChatBot: WechatyInterface) {
    // @ts-ignore
    // jobs[jobid] = schedule.scheduleJob('00 */1 * * * *', async function () {
    //     console.log(`定时任务发送天气：${new Date().toLocaleString()}`);
    //     const a = await weChatBot.Room.find('BM小卡片输出小组');
    //     let text:string = await ticker(new weChatBot.Message, "查ETH");
    //     // @ts-ignore
    //     await a.say(text);
    //     let t2 = await kline(new weChatBot.Message, "k线ETH");
    //     // @ts-ignore
    //     await a.say(t2);
    // });
}