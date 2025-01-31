import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 3, // 5 requests
  duration: 300, // per 60 seconds
});

export const checkRateLimit = async (ip: string) => {
  try {
    await rateLimiter.consume(ip);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
