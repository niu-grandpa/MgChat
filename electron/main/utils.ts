import crypto from 'crypto';
import { SECRET_KEY } from '../../SECRET_KET';

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

/**
 * 数据加密
 * @param data
 * @returns
 */
export function encrypt(data: any) {
  const cipher = crypto.createCipheriv(algorithm, SECRET_KEY, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * 数据解密
 * @param encryptedText
 * @returns
 */
export function decrypt(encryptedText: any) {
  try {
    const decipher = crypto.createDecipheriv(algorithm, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    return null;
  }
}
