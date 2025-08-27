export function rateLimit(req, res, next) {
  // TODO: plug real limiter like express-rate-limit/redis-store
  next();
}


