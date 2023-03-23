import {client} from "./redisclient.js";

export const Redis = {
    async inc(key: string, c: number) {
        return client.incrBy(key, c);
    },

    async hashInc(hashkey: string, key: string, c: number) {
        return client.hIncrBy(hashkey, key, c);
    },

    async hashGet(hashkey: string, key: string) {
        return client.hGet(hashkey, key);
    },

    async hashSet(hashkey: string, key: string, value: string) {
        return client.hSet(hashkey, key, value);
    },

    async hashSetExp(hashkey: string, key: string, value: string) {
        return client.hSet(hashkey, key, value,);
    },

    async hGetAll(hashkey: string) {
        return client.hGetAll(hashkey);
    },

    async expireAt(key: string, c: number) {
        return client.expireAt(key, c);
    },

    async expire(key: string, c: number) {
        return client.expire(key, c);
    },

    async get(key: string) {
        return client.get(key);
    },

    async getSetEx(key: string, value: string, c: number) {
        const g = client.get(key);
        await this.setEx(key, value, c);
        return g;
    },

    async setEx(key: string, value: string, c: number) {
        return client.setEx(key, c, value);
    },

    async del(key: string) {
        return client.del(key);
    },
}