const { createClient } = require('redis');

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'cache'}:6379`
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

module.exports = redisClient;
