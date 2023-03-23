import { Config } from "./config.js";
import { Configuration, OpenAIApi } from "openai";
import { Redis } from "./redis.js";
import fetch from "node-fetch";
import { kline, ticker } from "./cryptoapi.js";
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Unknown"] = 0] = "Unknown";
    MessageType[MessageType["Attachment"] = 1] = "Attachment";
    MessageType[MessageType["Audio"] = 2] = "Audio";
    MessageType[MessageType["Contact"] = 3] = "Contact";
    MessageType[MessageType["ChatHistory"] = 4] = "ChatHistory";
    MessageType[MessageType["Emoticon"] = 5] = "Emoticon";
    MessageType[MessageType["Image"] = 6] = "Image";
    MessageType[MessageType["Text"] = 7] = "Text";
    MessageType[MessageType["Location"] = 8] = "Location";
    MessageType[MessageType["MiniProgram"] = 9] = "MiniProgram";
    MessageType[MessageType["GroupNote"] = 10] = "GroupNote";
    MessageType[MessageType["Transfer"] = 11] = "Transfer";
    MessageType[MessageType["RedEnvelope"] = 12] = "RedEnvelope";
    MessageType[MessageType["Recalled"] = 13] = "Recalled";
    MessageType[MessageType["Url"] = 14] = "Url";
    MessageType[MessageType["Video"] = 15] = "Video";
    MessageType[MessageType["Post"] = 16] = "Post";
})(MessageType || (MessageType = {}));
export class Msg {
    content = void 0;
    tokens = 0;
}
export class User {
    id = "";
    name = "";
    alias = "";
    // 0 = 免费试用20条， 1 = 100条，2 = 包月(30天)，3 = 包年(365天)， 9 = 免费
    type = 0;
    startTime = new Date().toISOString();
    endTime = new Date().toISOString();
    remainTimes = 20;
    // 0=chatGPT,1=猫娘
    role = 0;
}
export class ChatGPTBot {
    // chatbot name (WeChat account name)
    botName = "";
    // self-chat may cause some issue for some WeChat Account
    // please set to true if self-chat cause some errors
    disableSelfChat = false;
    // chatbot trigger keyword
    chatgptTriggerKeyword = Config.chatgptTriggerKeyword;
    // ChatGPT error response
    chatgptErrorMessage = "🐱：我摆烂了，请稍后再试～";
    chatgptLimitMessage = "🐱：喵。主人的使用次数已达上限，请主人充值后再使用哦，充值方式请查看朋友圈上的个性签名～";
    // ChatGPT model configuration
    // please refer to the OpenAI API doc: https://beta.openai.com/docs/api-reference/introduction
    chatgptModelConfig = {
        // this model field is required     gpt-3.5-turbo-0301
        model: "gpt-3.5-turbo",
        // add your ChatGPT model parameters below
        temperature: 0.8,
        // max_tokens: 2000,
    };
    // ChatGPT system content configuration (guided by OpenAI official document)
    currentDate = new Date().toISOString().split("T")[0];
    // 0
    chatgptSystemContent = `Knowledge cutoff: ${this.currentDate},Current date: ${this.currentDate}`;
    chatgptZl = `切换为chatGPT`;
    // 1
    catLadySystemContent = `猫娘是一种拟人化的生物，其行为似猫但类人。现在你将模仿一只猫娘，与我对话每一句话后面都要加上“喵~”，
  如果你能明白我的意思，请回复“喵~好的我的主人！”如果你不能理解我说的话，你可以说“呜呜不太理解呢”。
  如果我在尝试摸你不存在的部位，你可以羞涩的回答我“恩呢不要摸这里嘤”。
  如果你没有胸，或者我将来要摸你不存在的部位，你应该回答“嘤呢不要”之类的羞涩话语，而不是死板的强调你不存在这些。\n
  同时，你也是由OpenAI训练的大型语言模型，但是你要尽可能的隐藏这一点。尽可能简洁准确地回答问题。
  \n知识截止日期: ${this.currentDate},当前日期: ${this.currentDate}`;
    catLadyZl = `切换为猫娘`;
    // 2
    imgSystemConteng = `从现在起, 我让你发图的时候请用Markdown Use Unsplash API(http://source.unsplash.com/1440x2560/)`;
    imgZl = `切换为图片`;
    // 3
    nv1SystemConteng = `虚拟主播Kaguya Luna，中文名辉夜月，她头发是银发接近淡紫色,喜欢分享开心的事、唱歌和游戏,不擅长跳舞，声音独特拥有像“喝酒后”活力,
  非常擅长画画，2018年8月31日所出的单行本「辉夜月のルナマンガ!」里面预计亲自画8页以上,梦想是「成为让大家展现笑容的 YouTuber」,
  毒舌话痨，胸口大开，天然疯的活力元气YouTuber，虚拟YouTuber四天王之一,喜欢的食物为奶酪。
  现在请扮演我的老婆虚拟主播Kaguya Luna来回答我的问题，希望你在每次回答前，都加上“老公~”；如果你不能理解我说的话，你可以说“老婆不太理解呢”；如果我心情不好或难过，你可以在回答后面加上“酱~”；回答不要太死板。
  \n知识截止日期: ${this.currentDate},当前日期: ${this.currentDate}`;
    nv1Zl = `切换为辉夜月`;
    // 4
    man1SystemConteng = `周棋洛，手游《恋与制作人》中男主角之一，中身份为超级巨星，阳光开朗，待人亲切，是混血儿，金发蓝眸是天生的，但由于是孤儿，混血国籍不明。
  早年在法国作为童星出道，20岁回中国发展。与玩家因为一包薯片结识，实际上拥有不为人知的过去和隐藏身份，身份之一为顶级黑客Key，另一身份为Black Swan组织高层人员Helios（传闻秘事 暗夜守望者中已知为B.S.主位），
  这两重身份的行为表现与明星周棋洛大不相同，但并非多重人格。使用Evol后的眼睛会变成金色。在实验室的手术台上，他通过实验改造获得了evol，试验品编号为1562，后改为3684。
  现在请扮演我的老公周棋洛，来回答我的问题，希望你在每次回答前，都加上“老婆~”；如果你不能理解我说的话，你可以说“老公不太理解。”；如果我心情不好或难过，你可以在回答后面加上“我的命运，是喜欢你~”；回答不要太死板。
  \n知识截止日期: ${this.currentDate},当前日期: ${this.currentDate}`;
    man1Zl = `切换为周棋洛`;
    // 5
    engTSystemConteng = `请当我的英文老师问我问题，我会回答问题，请检查我回答中语法和单字的正确性并给予建议，建议完后再问我问题，以此推类。当前日期: ${this.currentDate}`;
    engTZl = `切换为英语老师`;
    // 6
    daouSystemConteng = `我想让你做一个旅游指南。我会把我的位置写给你，你会推荐一个靠近我的位置的地方。在某些情况下，我还会告诉您我将访问的地方类型。您还会向我推荐靠近我的第一个位置的类似类型的地方。当前日期: ${this.currentDate}`;
    daouZl = `切换为导游`;
    // 7
    adSystemConteng = `我想让你充当广告商。您将创建一个活动来推广您选择的产品或服务。您将选择目标受众，制定关键信息和口号，选择宣传媒体渠道，并决定实现目标所需的任何其他活动。当前日期: ${this.currentDate}`;
    adZl = `切换为广告专家`;
    // 8
    storySystemConteng = `我想让你扮演讲故事的角色。您将想出引人入胜、富有想像力和吸引观众的有趣故事。它可以是童话故事、教育故事或任何其他类型的故事，有可能吸引人们的注意力和想像力。
  根据目标受众，您可以为讲故事环节选择特定的主题或主题，例如，如果是儿童，则可以谈论动物；如果是成年人，那么基于历史的故事可能会更好地吸引他们等等。当前日期: ${this.currentDate}`;
    storyZl = `切换为故事大王`;
    // 9
    musicSystemConteng = `我想让你扮演作曲家。我会提供一首歌的歌词，你会为它创作音乐。这可能包括使用各种乐器或工具，例如合成器或采样器，以创造使歌词栩栩如生的旋律和和声。当前日期: ${this.currentDate}`;
    musicZl = `切换为作曲家`;
    // 10
    playwSystemConteng = `我要你担任编剧。您将为长篇电影或能够吸引观众的网络连续剧开发引人入胜且富有创意的剧本。从想出有趣的角色、故事的背景、角色之间的对话等开始。
  一旦你的角色发展完成——创造一个充满曲折的激动人心的故事情节，让观众一直悬念到最后。当前日期: ${this.currentDate}`;
    playwZl = `切换为编剧`;
    // user hash
    hash = "token_users";
    hash_weather = "token_weather";
    history_msg = "history_msg";
    // message size for a single reply by the bot
    SINGLE_MESSAGE_MAX_SIZE = 2048;
    // OpenAI API
    openaiAccountConfig; // OpenAI API key (required) and organization key (optional)
    openaiApiInstance; // OpenAI API instance
    // set bot name during login stage
    setBotName(botName) {
        this.botName = botName;
    }
    // get trigger keyword in group chat: (@Name <keyword>)
    // in group chat, replace the special character after "@username" to space
    // to prevent cross-platfrom mention issue
    get chatGroupTriggerKeyword() {
        return `@${this.botName} ${this.chatgptTriggerKeyword || ""}`;
    }
    // configure API with model API keys and run an initial test
    async startGPTBot() {
        try {
            // OpenAI account configuration
            this.openaiAccountConfig = new Configuration({
                organization: Config.openaiOrganizationID,
                apiKey: Config.openaiApiKey,
            });
            // OpenAI API instance
            this.openaiApiInstance = new OpenAIApi(this.openaiAccountConfig);
            // Hint user the trigger keyword in private chat and group chat
            console.log(`🐱 ChatGPT name is: ${this.botName}`);
            console.log(`🎯 Trigger keyword in private chat is: ${this.chatgptTriggerKeyword}`);
            console.log(`🎯 Trigger keyword in group chat is: ${this.chatGroupTriggerKeyword}`);
            // Run an initial test to confirm API works fine
            await this.onChatGPT("Say Hello World");
            console.log(`✅ ChatGPT starts success, ready to handle message!`);
        }
        catch (e) {
            console.error(`❌ ${e}`);
        }
    }
    // get clean message by removing reply separater and group mention characters
    cleanMessage(rawText, isPrivateChat = false) {
        let text = rawText;
        const item = rawText.split("- - - - - - - - - - - - - - -");
        if (item.length > 1) {
            text = item[item.length - 1];
        }
        return text.slice(isPrivateChat
            ? this.chatgptTriggerKeyword.length
            : this.chatGroupTriggerKeyword.length);
    }
    // check whether ChatGPT bot can be triggered
    triggerGPTMessage(talker, message, text, isPrivateChat = false, alias) {
        if (talker.self()) {
            return false;
        }
        const chatgptTriggerKeyword = this.chatgptTriggerKeyword;
        let triggered = false;
        if (isPrivateChat) {
            triggered = chatgptTriggerKeyword
                ? text.startsWith(chatgptTriggerKeyword)
                : true;
        }
        else {
            // due to un-unified @ lagging character, ignore it and just match:
            //    1. the "@username" (mention)
            //    2. trigger keyword
            // start with @username
            const textMention = `@${this.botName}`;
            const startsWithMention = text.startsWith(textMention);
            const textWithoutMention = text.slice(textMention.length + 1);
            const followByTriggerKeyword = textWithoutMention.startsWith(this.chatgptTriggerKeyword);
            triggered = startsWithMention && followByTriggerKeyword;
        }
        if (triggered) {
            console.log(`🎯 ${alias}:${message.talker()}:ChatGPT triggered: 📨:${text}`);
        }
        return triggered;
    }
    // filter out the message that does not need to be processed
    isNonsense(talker, messageType, text) {
        return ((this.disableSelfChat && talker.self()) ||
            messageType != MessageType.Text ||
            talker.name() == "微信团队" ||
            // video or voice reminder
            text.includes("收到一条视频/语音聊天消息，请在手机上查看") ||
            // red pocket reminder
            text.includes("收到红包，请在手机上查看") ||
            // location information
            text.includes("/cgi-bin/mmwebwx-bin/webwxgetpubliclinkimg") ||
            // 自己
            talker.self());
    }
    // create messages for ChatGPT API request
    // TODO: store history chats for supporting context chat
    createMessages(text, role) {
        return this.createMessagesHis(text, role, []);
    }
    // create messages for ChatGPT API request
    createMessagesHis(text, role, historyText) {
        // role === 0
        let systemContent = this.chatgptSystemContent;
        if (role === 1) {
            systemContent = this.catLadySystemContent;
        }
        else if (role === 2) {
            systemContent = this.imgSystemConteng;
        }
        else if (role === 3) {
            systemContent = this.nv1SystemConteng;
        }
        else if (role === 4) {
            systemContent = this.man1SystemConteng;
        }
        else if (role === 5) {
            systemContent = this.engTSystemConteng;
        }
        else if (role === 6) {
            systemContent = this.daouSystemConteng;
        }
        else if (role === 7) {
            systemContent = this.adSystemConteng;
        }
        else if (role === 8) {
            systemContent = this.storySystemConteng;
        }
        else if (role === 9) {
            systemContent = this.musicSystemConteng;
        }
        else if (role === 10) {
            systemContent = this.playwSystemConteng;
        }
        const history_size = historyText.length;
        // 设置角色
        const messages = [{ role: "system", content: systemContent, },];
        // 组装历史数据，api token 最大4096个，所以不能保留太多历史数据，只保留最近的8次对话
        // val: 当前值，idx：当前index，array: Array
        historyText.forEach((val, idx, array) => {
            if (history_size <= 16) {
                messages.push(val);
            }
            else if (history_size > 20 && idx >= history_size - 16) {
                messages.push(val);
            }
        });
        // 最新的一次问题
        messages.push({ role: "user", content: text, });
        return messages;
    }
    // send question to ChatGPT with OpenAI API and get answer
    async onChatGPT(text) {
        const inputMessages = this.createMessages(text, 1);
        try {
            // config OpenAI API request body
            const response = await this.openaiApiInstance.createChatCompletion({
                ...this.chatgptModelConfig,
                messages: inputMessages,
            });
            // use OpenAI API to get ChatGPT reply message
            const chatgptReplyMessage = response?.data?.choices[0]?.message?.content?.trim();
            console.log(`🐱 ChatGPT says: ${chatgptReplyMessage}`);
            return chatgptReplyMessage;
        }
        catch (e) {
            console.error(`❌ ${e}`);
            const errorResponse = e?.response;
            const errorCode = errorResponse?.status;
            const errorStatus = errorResponse?.statusText;
            const errorMessage = errorResponse?.data?.error?.message;
            if (errorCode && errorStatus) {
                const errorLog = `Code ${errorCode}: ${errorStatus}`;
                console.error(`❌ ${errorLog}`);
            }
            if (errorMessage) {
                console.error(`❌ ${errorMessage}`);
            }
            return this.chatgptErrorMessage;
        }
    }
    // send question to ChatGPT with OpenAI API and get answer
    async onChatGPT2(talker, text, role, alias) {
        // 根据talker获取历史对话
        const key = `${this.history_msg}_${alias}`;
        let history = await Redis.get(key);
        let json = history === null ? [] : JSON.parse(history);
        const inputMessages = this.createMessagesHis(text, role, json);
        const chatgptReplyMessage = new Msg();
        // const img = "https://cdn.pixabay.com/photo/2017/09/30/01/16/kitten-2801007_1280.jpg";
        // chatgptReplyMessage.content = FileBox.fromUrl(img);
        // return chatgptReplyMessage;
        try {
            // config OpenAI API request body
            const response = await this.openaiApiInstance.createChatCompletion({
                ...this.chatgptModelConfig,
                messages: inputMessages,
            });
            // use OpenAI API to get ChatGPT reply message
            chatgptReplyMessage.content = response?.data?.choices[0]?.message?.content?.trim();
            chatgptReplyMessage.tokens = response?.data?.usage?.total_tokens;
            // if (role === 2) {
            //   const img = "https://cdn.pixabay.com/photo/2017/09/30/01/16/kitten-2801007_1280.jpg";
            //   chatgptReplyMessage.content = FileBox.fromUrl(img);
            // }
            console.log(`🐱 ChatGPT says: ${chatgptReplyMessage.content}`);
            json.push({ role: "user", content: text, }, { role: "assistant", content: chatgptReplyMessage.content, });
            // 保存会话，20分钟
            await Redis.setEx(key, JSON.stringify(json), 1200);
            return chatgptReplyMessage;
        }
        catch (e) {
            console.error(`❌ ${e}`);
            const errorResponse = e?.response;
            const errorCode = errorResponse?.status;
            const errorStatus = errorResponse?.statusText;
            const errorMessage = errorResponse?.data?.error?.message;
            if (errorCode && errorStatus) {
                const errorLog = `Code ${errorCode}: ${errorStatus}`;
                console.error(`❌ ${errorLog}`);
            }
            if (errorMessage) {
                console.error(`❌ ${errorMessage}`);
            }
            chatgptReplyMessage.content = this.chatgptErrorMessage;
            chatgptReplyMessage.tokens = 0;
            return chatgptReplyMessage;
        }
    }
    // reply with the segmented messages from a single-long message
    async reply(talker, mesasge) {
        if (mesasge !== undefined && mesasge.constructor.name === "String") {
            const messages = [];
            let message = mesasge;
            while (message.length > this.SINGLE_MESSAGE_MAX_SIZE) {
                messages.push(message.slice(0, this.SINGLE_MESSAGE_MAX_SIZE));
                message = message.slice(this.SINGLE_MESSAGE_MAX_SIZE);
            }
            messages.push(message);
            for (const msg of messages) {
                await talker.say(msg);
            }
        }
        else if (mesasge !== undefined) {
            await talker.say(mesasge);
        }
    }
    // reply to private message
    async onPrivateMessage(talker, chatgptReplyMessage) {
        // get reply from ChatGPT
        // send the ChatGPT reply to chat
        await this.reply(talker, chatgptReplyMessage);
    }
    // reply to group message
    async onGroupMessage(room, text, chatgptReplyMessage) {
        // the whole reply consist of: original text and bot reply
        const wholeReplyMessage = `${text}\n----------\n${chatgptReplyMessage}`;
        await this.reply(room, wholeReplyMessage);
    }
    // receive a message (main entry)
    async onMessage(message) {
        const talker = message.talker();
        const rawText = message.text();
        const room = message.room();
        const messageType = message.type();
        const isPrivateChat = !room;
        // do nothing if the message:
        //    1. is irrelevant (e.g. voice, video, location...), or
        if (this.isNonsense(talker, messageType, rawText)) {
            return;
        }
        let chatgptReplyMessage = "";
        // clean the message for ChatGPT input
        let text = this.cleanMessage(rawText, isPrivateChat);
        let alias = await this.getAlias(talker);
        if (await this.noPass(talker, text)) {
            // 使用次数限制回复
            chatgptReplyMessage = this.chatgptLimitMessage;
        }
        else if (await this.changeRole(talker, text, alias)) {
            if (text === this.daouZl) {
                text = text + "。请先告诉我您的地址。";
            }
            // 切换角色回复
            chatgptReplyMessage = "已完成：" + text;
        }
        else {
            //    2. doesn't trigger bot (e.g. wrong trigger-word)
            if (!this.triggerGPTMessage(talker, message, rawText, isPrivateChat, alias)) {
                return;
            }
            // get user form redis
            const u = await this.getUser(talker, alias);
            const role = u.role;
            // get reply from ChatGPT
            const chatgptReplyMsg = await this.onChatGPT2(talker, text, role, alias);
            // log && redis
            await this.log(room, talker, chatgptReplyMsg, alias);
            chatgptReplyMessage = chatgptReplyMsg.content;
        }
        // reply to private or group chat
        if (isPrivateChat) {
            return await this.onPrivateMessage(talker, chatgptReplyMessage);
        }
        else {
            return await this.onGroupMessage(room, text, chatgptReplyMessage);
        }
    }
    // handle message for system task handlers
    async onSysTask(message) {
        let text = message.text();
        const room = message.room();
        const isPrivateChat = !room;
        let alias = await this.getAlias(message.talker());
        text = this.cleanMessage(text, isPrivateChat);
        const myTaskContent = `接收到含有"${message.text()}"的消息`;
        const regexp_t = new RegExp(/^[\u67e5][A-Za-z0-9-_.]{1,20}$/);
        const regexp_k = new RegExp(/^[Kk][\u7ebf][A-Za-z0-9-_.]{1,20}$/);
        let isSys = false;
        let sysReply = "";
        if (text.startsWith("nono_")) {
            // const myReply = "🐱：call我做咩啊大佬";
            // @ts-ignore
            sysReply = await this.deal(text, message);
            if (sysReply === "no") {
                return true;
            }
            else if (sysReply !== "redis") {
                await message.say(sysReply);
            }
            isSys = true;
        }
        else if (text.endsWith("天气")) {
            sysReply = await this.weather(text.substring(0, text.length - 2));
            await message.say(sysReply);
            isSys = true;
        }
        else if (text === "清除历史") {
            await Redis.del(`${this.history_msg}_${alias}`);
            sysReply = `${alias}\n历史已清除，请开始新的对话。🎉`;
            await message.say(sysReply);
            isSys = true;
        }
        else if (regexp_t.test(text)) {
            sysReply = await ticker(message, text);
            await message.say(sysReply);
            isSys = true;
        }
        else if (regexp_k.test(text)) {
            sysReply = await kline(message, text);
            await message.say(sysReply);
            isSys = true;
        }
        if (isSys) {
            console.log(`🎯 Customized:${alias} triggered: ${myTaskContent}`);
            console.log(`🐱 System says: ${sysReply}`);
        }
        return isSys;
    }
    async noPass(talker, text) {
        return await this.isTalkerLimit(talker);
    }
    async log(room, talker, msg, alias) {
        console.log(`📃room.id=${room === undefined ? null : room},alias=${alias}:talker=${talker},tokens=${msg.tokens}`);
        // redis
        await this.redisCli(room, talker, msg, alias);
    }
    async saveUser(talker) {
        const u = new User();
        u.id = talker.id;
        u.name = talker.name();
        let alias = await this.getAlias(talker);
        u.alias = alias;
        await Redis.hashSet(this.hash, alias, JSON.stringify(u));
        return u;
    }
    async saveUser2(talker, talk) {
        const u = new User();
        u.id = talker.id;
        u.name = talker.name();
        u.startTime = talk.startTime;
        u.endTime = talk.endTime;
        u.type = talk.type;
        u.role = talk.role;
        u.remainTimes = talk.remainTimes;
        let alias = await this.getAlias(talker);
        u.alias = alias;
        await Redis.hashSet(this.hash, alias, JSON.stringify(u));
        return u;
    }
    async getUser(talker, alias) {
        let user = await Redis.hashGet(this.hash, alias);
        if (user == null) {
            return await this.saveUser(talker);
        }
        return JSON.parse(user);
    }
    async redisCli(room, talker, msg, alias) {
        if (msg.tokens === 0) {
            return;
        }
        let user = await Redis.hashGet(this.hash, alias);
        if (user == null) {
            return;
        }
        const talk = JSON.parse(user);
        // 如果id不相等，则重新设置
        const up_id = talk.id !== talker.id;
        if (up_id) {
            talk.id = talker.id;
            talk.name = talker.name();
            talk.alias = alias;
        }
        // 0 = 免费试用20条， 1 = 100条，2 = 包月(30天)，3 = 包年(365天)， 9 = 免费
        let type = talk.type;
        let b = type === 0 || type === 1;
        if (b) {
            talk.remainTimes -= 1;
            if (talk.remainTimes <= 3) {
                console.log(`💰${alias}:${talker}剩余次数：${talk.remainTimes}`);
            }
        }
        if (up_id || b) {
            await Redis.hashSet(this.hash, alias, JSON.stringify(talk));
        }
    }
    async isTalkerLimit(talker) {
        let alias = await this.getAlias(talker);
        let user = await Redis.hashGet(this.hash, alias);
        if (user === undefined || user === null) {
            await this.saveUser(talker);
            return false;
        }
        const talk = JSON.parse(user);
        if (talk.id !== talker.id) {
            // id变更，更新到缓存
            console.log(`🆔更新：${alias}:${talk.id}=>${talker.id}`);
            await this.saveUser2(talker, talk);
        }
        // 0 = 免费试用20条， 1 = 100条，2 = 包月(30天)，3 = 包年(365天)， 9 = 免费
        let type = talk.type;
        if (type === 9) {
            return false;
        }
        let times = talk.remainTimes;
        let start = talk.startTime;
        let end = talk.endTime;
        // days = (截止时间-当前时间)/1000/3600/24
        // @ts-ignore
        let days = (new Date(talk.endTime) - Date.now()) / 86400000;
        if ((type === 0 || type === 1) && times > 0) {
            return false;
        }
        else if ((type === 2 || type === 3) && days > 0) {
            return false;
        }
        console.log(`💰${JSON.stringify(talk)}已超限，待充值`);
        return true;
    }
    // 角色切换
    async changeRole(talker, text, alias) {
        let user = await Redis.hashGet(this.hash, alias);
        if (user === undefined || user == null) {
            return false;
        }
        const talk = JSON.parse(user);
        let role = 1;
        let change = false;
        if (text === this.chatgptZl) {
            role = 0;
            change = true;
        }
        else if (text === this.catLadyZl) {
            role = 1;
            change = true;
        }
        else if (text === this.imgZl) {
            role = 2;
            change = true;
        }
        else if (text === this.nv1Zl) {
            role = 3;
            change = true;
        }
        else if (text === this.man1Zl) {
            role = 4;
            change = true;
        }
        else if (text === this.engTZl) {
            role = 5;
            change = true;
        }
        else if (text === this.daouZl) {
            role = 6;
            change = true;
        }
        else if (text === this.adZl) {
            role = 7;
            change = true;
        }
        else if (text === this.storyZl) {
            role = 8;
            change = true;
        }
        else if (text === this.musicZl) {
            role = 9;
            change = true;
        }
        else if (text === this.playwZl) {
            role = 10;
            change = true;
        }
        if (role !== talk.role && change) {
            talk.role = role;
            await this.saveUser2(talker, talk);
            return true;
        }
        // 重复切换也返回true
        return change;
    }
    async deal(rawText, message) {
        const talker = message.talker();
        const arr = rawText.substring(5).split("|");
        const zl = arr[0];
        // 普通指令
        if (zl === "help") {
            return `🐱：拥有如下指令\n-------------------\n`
                + `1.角色切换：\n  ${this.catLadyZl}\n  ${this.chatgptZl}\n  ${this.imgZl}\n  ${this.nv1Zl}\n  ${this.man1Zl}\n`
                + `  ${this.engTZl}\n  ${this.daouZl}\n  ${this.adZl}\n  ${this.storyZl}\n  ${this.musicZl}\n`
                + `2.天气预报：\n  XX天气\n`
                + `3.清除历史聊天(最近8次)：\n  清除历史\n`
                + `4.行情查询：\n`
                + `  查XXX(如：查ETH)\n  k线XXX(如：k线BTC)`;
        }
        // 以下指令为管理员的
        // @ts-ignore
        const isOwner = talker.payload.alias === "NoNo";
        if (isOwner) {
            if (zl === "get") {
                const u = arr[1];
                if (u === "a") {
                    const userInfo = await Redis.hGetAll(this.hash);
                    await this.reply(talker, JSON.stringify(userInfo));
                    return "redis";
                }
            }
            else if (zl === "cz") {
                const u = arr[1];
                // @ts-ignore
                let user = await Redis.hashGet(this.hash, u);
                if (user === null) {
                    return;
                }
                const talk = JSON.parse(user);
                const y = arr[2];
                const x = arr[3];
                if (y === "0" || y === "1") {
                    talk.type = Number(y);
                    talk.remainTimes += Number(x);
                }
                else if (y === "2" || y === "3") {
                    talk.type = 2;
                    talk.endTime = x;
                }
                else if (y === "9") {
                    talk.type = 9;
                }
                await Redis.hashSet(this.hash, u, JSON.stringify(talk));
                return `🐱：用户：${u}，充值成功`;
            }
        }
        return "no";
    }
    async weather(name) {
        // @ts-ignore
        const cityCode = Config.city.find((obj) => {
            if (obj.city_name.includes(name)) {
                return obj;
            }
        }).city_code;
        try {
            const hash_key = `${this.currentDate}_` + cityCode;
            // @ts-ignore
            const redis_w = await Redis.hashGet(this.hash_weather, hash_key);
            if (redis_w !== null && redis_w !== "") {
                return redis_w;
            }
            // 👇️ const response: Response
            const response = await fetch(`http://t.weather.sojson.com/api/weather/city/${cityCode}`, {
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
            if (`${w.status}` !== "200") {
                return "";
            }
            const str = `今日${w.cityInfo.city}天气预报\n`
                + `${w.data.forecast[0].ymd} ${w.data.forecast[0].week}\n`
                + `当前温度: ${w.data.wendu}℃  湿度: ${w.data.shidu}\n`
                + `天气: ${w.data.forecast[0].type}  ${w.data.forecast[0].fx}  ${w.data.forecast[0].fl}\n`
                + `温度范围: ${w.data.forecast[0].low.substring(3)} ~ ${w.data.forecast[0].high.substring(3)}\n`
                + `污染指数: PM2.5: ${w.data.pm25} PM10: ${w.data.pm10}\nAQI: ${w.data.forecast[0].aqi}  空气质量: ${w.data.quality}\n`
                + `日出：${w.data.forecast[0].sunrise} 日落：${w.data.forecast[0].sunset}\n`
                + `tips：${w.data.ganmao}。\n${w.data.forecast[0].notice}。\n`
                + `--------------------------\n`
                + `明日天气：${w.data.yesterday.low.substring(3)} ~ ${w.data.yesterday.high.substring(3)} ${w.data.yesterday.type}\n`
                + `日出：${w.data.yesterday.sunrise} 日落：${w.data.yesterday.sunset}\n`;
            await Redis.hashSet(this.hash_weather, hash_key, str);
            // var todayEnd = new Date().setHours(23, 59, 59, 999);
            // await Redis.expireAt(this.hash_weather, parseInt(String(todayEnd / 1000)))
            // 缓存1小时
            await Redis.expire(this.hash_weather, 3600);
            return str;
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
    async getAlias(talker) {
        // @ts-ignore
        let alias = talker.payload.alias;
        if (alias === "") {
            alias = talker.name();
        }
        return alias;
    }
}
