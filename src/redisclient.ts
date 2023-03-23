import {createClient} from 'redis'
import {Config} from "./config.js";

// url: "redis://containers-us-west-161.railway.app:7743",
// password: "SiIzMAKOiPHtX8h3pgY5",
// username: "default"
export const client = createClient({
    url: Config.redisUrl,
    password: Config.redisPwd,
    username: Config.redisUser
});
client.on('connect', () => console.log('Redisclient Client start'));
client.on('error', (err: any) => console.log('Redisclient Client Error', err));

await client.connect();


// createClient({
//     // url: 'redis://default:SiIzMAKOiPHtX8h3pgY5@containers-us-west-161.railway.app:7743'
//     // url: Config.redisUrl
//     url: "containers-us-west-161.railway.app:7743",
//     password:"SiIzMAKOiPHtX8h3pgY5",
//     username:"default"
// });