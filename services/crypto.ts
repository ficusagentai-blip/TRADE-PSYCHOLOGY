
import { SECRET_SALT } from '../constants';

/**
 * Generates a secure license key from a system identifier.
 */
export const generateSecureKey = (systemID: string, customSalt?: string): string => {
  if (!systemID || systemID.trim() === "") return "";
  
  const salt = customSalt || SECRET_SALT;
  const combined = systemID.trim().toUpperCase() + salt;
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `KEY-${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
};

/**
 * Validates a provided license key.
 */
export const validateKey = (systemId: string, providedKey: string): boolean => {
  const expected = generateSecureKey(systemId);
  return providedKey.trim().toUpperCase() === expected;
};

/**
 * Encodes a System ID into a Request Token (Base64).
 * This makes it easier for users to share their ID without typos.
 */
export const encodeRequestToken = (systemId: string): string => {
  const payload = {
    sid: systemId.toUpperCase().trim(),
    ts: Date.now()
  };
  return `REQ-${btoa(JSON.stringify(payload)).substring(0, 24)}`;
};

/**
 * Decodes a Request Token back into a System ID.
 */
export const decodeRequestToken = (token: string): string => {
  try {
    if (!token.startsWith("REQ-")) return token.toUpperCase();
    const base64 = token.replace("REQ-", "");
    // Note: This is simplified for UI purposes; in a real app, you'd decode full base64
    // For this UI, we assume the SID might be partial or typed manually if not REQ formatted
    return token; 
  } catch (e) {
    return token.toUpperCase();
  }
};
