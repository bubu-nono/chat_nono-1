import { client } from "./redisclient.js";
export const Redis = {
    async inc(key, c) {
        return client.incrBy(key, c);
    },
    async hashInc(hashkey, key, c) {
        return client.hIncrBy(hashkey, key, c);
    },
    async hashGet(hashkey, key) {
        return client.hGet(hashkey, key);
    },
    async hashSet(hashkey, key, value) {
        return client.hSet(hashkey, key, value);
    },
    async hashSetExp(hashkey, key, value) {
        return client.hSet(hashkey, key, value);
    },
    async hGetAll(hashkey) {
        return client.hGetAll(hashkey);
    },
    async expireAt(key, c) {
        return client.expireAt(key, c);
    },
    async expire(key, c) {
        return client.expire(key, c);
    },
    async get(key) {
        return client.get(key);
    },
    async getSetEx(key, value, c) {
        const g = client.get(key);
        await this.setEx(key, value, c);
        return g;
    },
    async setEx(key, value, c) {
        return client.setEx(key, c, value);
    },
    async del(key) {
        return client.del(key);
    },
};
