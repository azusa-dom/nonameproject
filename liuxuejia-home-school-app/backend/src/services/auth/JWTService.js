import jwt from 'jsonwebtoken';

export const JWTService = {
  sign(payload, options = {}) {
    return jwt.sign(payload, process.env.JWT_SECRET || 'dev', { expiresIn: '7d', ...options });
  },
  verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev');
  }
};


