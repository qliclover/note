import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// convert passwords
export async function hashPassword(password) {
  return bcrypt.hash(password,10);  
}

// compare password
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// give token
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {expiresIn:'7d'})
}

// verify token
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

// take verified token from requested cookie then return userId 
// otherwise return null
export function getUserIdFromRequest(request){
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const payload = verifyToken(token);
        return payload.userId;
    } catch {
        return null;
    }
}