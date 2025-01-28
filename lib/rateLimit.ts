import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
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
