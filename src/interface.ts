export interface IConfig {
    openaiApiKey: string;
    openaiOrganizationID?: string;
    chatgptTriggerKeyword: string;
    redisUrl: string;
    redisPwd: string;
    redisUser: string;
    city: object;
}
