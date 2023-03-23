import schedule from "node-schedule";
import { kline, ticker } from "./cryptoapi.js";
var jobs = {};
var hash = "token_users";
export function w_everyday(jobid, weChatBot, chatGPTBot) {
    //分 時 日 月 星期
    // @ts-ignore
    jobs[jobid] = schedule.scheduleJob('00 20 00 * * *', async function () {
        console.log(`定时任务发送天气：${new Date().toLocaleString()}`);
        await timer(weChatBot, chatGPTBot);
    });
}
async function timer(weChatBot, chatGPTBot) {
    const em = await weChatBot.Contact.find('Em.');
    const sysReply = await chatGPTBot.weather("杭州");
    // @ts-ignore
    await em.say(`早安，亲爱的：\n  今天又是美好的一天~\n${sysReply}`);
}
export function m30_tAndk(jobid, weChatBot) {
    // @ts-ignore
    jobs[jobid] = schedule.scheduleJob('50 29,59 0-14 * * *', async function () {
        console.log(`定时任务发送行情：${new Date().toLocaleString()}`);
        const a = await weChatBot.Room.find('BM小卡片输出小组');
        let t_eth = await ticker(new weChatBot.Message, "查ETH");
        // @ts-ignore
        await a.say(t_eth);
        let k_eth = await kline(new weChatBot.Message, "k线ETH");
        // @ts-ignore
        await a.say(k_eth);
        let t_btc = await ticker(new weChatBot.Message, "查BTC");
        // @ts-ignore
        await a.say(t_btc);
        let k_btc = await kline(new weChatBot.Message, "k线BTC");
        // @ts-ignore
        await a.say(k_btc);
    });
}
export function w_test(jobid, weChatBot) {
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
