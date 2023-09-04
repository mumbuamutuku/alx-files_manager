const redis = require('redis');

class RedisClient {
        constructor() {
                this.client = redis.createClient();

                this.client.on('error', (error) => {
                        console.error('Redis Error:', error);
                });
        }

        isAlive() {
                return this.client.connected;
        }

        async get(key) {
                return new Promise((resolve, reject) => {
                        this.client.get(key, (error, result) => {
                                if (error) {
                                        reject(error);
                                }
                                else {
                                        resolve(result);
                                }
                        });
                });
        }

        async set(key, value, duration) {
                return new Promise((resolve, reject) => {
                        this.client.setex(key, duration, value, (error, result) => {
                                if (error) {
                                        reject(error);
                                } else {
                                        resolve(result);
                                }
                        });
		});
        }

        async del(key) {
                return new Promise((resolve, reject) => {
                        this.client.del(key, (error, result) => {
                                if (error) {
                                        reject(error);
                                } else {
                                        resolve(result);
                                }
                        });
                });
        }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();

module.exports = redisClient;
