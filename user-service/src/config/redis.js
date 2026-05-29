const Redis = require("ioredis");
const { config } = require(".");
const logger = require("./logger");

class RedisClient {
    static instance;
    static isConnected = false;

    constructor() {}

    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(config.REDIS_URL, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
            });

            RedisClient.setupEventListeners();
        }

        return RedisClient.instance;
    }

    static setupEventListeners() {

        RedisClient.instance.on("connect", () => {
            RedisClient.isConnected = true;
            logger.info("Redis connected successfully");
        });

        RedisClient.instance.on("ready", () => {
            RedisClient.isConnected = true;
            logger.info("Redis client is ready");
        });

        RedisClient.instance.on("error", (error) => {
            RedisClient.isConnected = false;
            logger.error(`Redis Error: ${error.message}`);
        });

        RedisClient.instance.on("close", () => {
            RedisClient.isConnected = false;
            logger.warn("Redis connection closed");
        });

        RedisClient.instance.on("reconnecting", () => {
            logger.warn("Reconnecting to Redis...");
        });

        RedisClient.instance.on("end", () => {
            RedisClient.isConnected = false;
            logger.warn("Redis connection ended");
        });
    }

    static async disconnect() {
        if (RedisClient.instance) {
            await RedisClient.instance.quit();
            RedisClient.isConnected = false;
            logger.info("Redis disconnected");
        }
    }
}

module.exports = RedisClient;