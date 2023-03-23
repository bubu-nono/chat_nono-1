import * as dotenv from "dotenv";
import fs from "fs";
import { parse } from "yaml";
dotenv.config();
let configFile = {};
let city = [];
// get configurations from 'config.yaml' first
if (fs.existsSync("./.env.sample")) {
    const file = fs.readFileSync("./.env.sample", "utf8");
    configFile = parse(file);
    console.log(`1_${configFile}`);
}
// if 'config.yaml' not exist, read them from env
else {
    configFile = {
        openaiApiKey: process.env.OPENAI_API_KEY,
        openaiOrganizationID: process.env.OPENAI_ORGANIZATION_KEY,
        chatgptTriggerKeyword: process.env.CHATGPT_TRIGGER_KEYWORD,
        redisUrl: process.env.REDIS_URL,
        redisPwd: process.env.REDIS_PWD,
        redisUser: process.env.REDIS_USER,
    };
    console.log(`2_${process.env.REDIS_URL}`);
}
if (fs.existsSync("./_city.json")) {
    const file = fs.readFileSync("./_city.json", "utf8");
    city = parse(file);
}
// warning if no OpenAI API key found
if (configFile.openaiApiKey === undefined) {
    console.error("⚠️ No OPENAI_API_KEY found in env, please export to env or configure in config.yaml");
}
export const Config = {
    openaiApiKey: configFile.openaiApiKey,
    openaiOrganizationID: configFile.openaiOrganizationID || "",
    chatgptTriggerKeyword: configFile.chatgptTriggerKeyword || "",
    redisUrl: configFile.redisUrl || "",
    redisPwd: configFile.redisPwd || "",
    redisUser: configFile.redisUser || "",
    city: city || [],
};
