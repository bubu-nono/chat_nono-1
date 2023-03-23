import QRCode from "qrcode";
import {WechatyBuilder} from "wechaty";
import {ChatGPTBot} from "./chatgpt.js";
import {m30_tAndk, w_everyday} from "./timer.js";

// Wechaty instance
export const weChatBot = WechatyBuilder.build({
  name: "my-wechat-bot",
});
// ChatGPTBot instance
const chatGPTBot = new ChatGPTBot();

async function main() {
  console.log(`服务器时间：${new Date().toLocaleString()}`);
  weChatBot
      // scan QR code for login
      .on("scan", async (qrcode, status) => {
        const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
        console.log(`💡 Scan QR Code to login: ${status}\n${url}`);
        console.log(
            await QRCode.toString(qrcode, {type: "terminal", small: true})
        );
      })
      // login to WeChat desktop account
    .on("login", async (user: any) => {
      console.log(`✅ User ${user} has logged in`);
        chatGPTBot.setBotName(user.name());
      await chatGPTBot.startGPTBot();
      m30_tAndk('m30_tAndk', weChatBot);
        w_everyday("Em", weChatBot, chatGPTBot);
    })
    // message handler
    .on("message", async (message: any) => {
      try {
        // // @ts-ignore
        // let time = Date.parse(new Date()) / 1000 - message.payload.timestamp;
        if (message.type() === 7 && message.age() < 20) {
          // console.log(`📨 ${message}`);
          // handle message for system task handlers
          const sys = await chatGPTBot.onSysTask(message);
          if (sys) {
            return;
          }
          // handle message for chatGPT bot
          await chatGPTBot.onMessage(message);
        }
      } catch (e) {
        console.error(`❌ ${e}`);
      }
    });

  try {
    await weChatBot.start();
  } catch (e) {
    console.error(`❌ Your Bot failed to start: ${e}`);
    console.log(
      "🤔 Can you login WeChat in browser? The bot works on the desktop WeChat"
    );
  }
}

main();
