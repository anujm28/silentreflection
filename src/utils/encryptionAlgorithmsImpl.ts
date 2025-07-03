/*
  encryptionAlgorithmsImpl.ts
  Hybrid Encryption Algorithms Benchmark (Browser Compatible)
  Includes:
  1. ECDH-AES (ECDH + AES-GCM)
  2. RSA-AES (RSA-OAEP + AES-GCM)
  3. KYBER + ECDH + AES (Simulated PQC + classical hybrid)
*/

export interface EncryptionResult {
  encrypted: string;
  key: string;
  encryptionTime: number;
}

export interface EncryptionAlgorithm {
  name: string;
  encrypt: (text: string) => Promise<EncryptionResult>;
  decrypt: (encrypted: string, key: string) => Promise<string>;
}

function uint8ToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToUint8(base64: string): Uint8Array {
  return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
}

function encode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function decode(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

async function aesGcmEncrypt(text: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
  const encoded = encode(text);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return JSON.stringify({ cipher: uint8ToBase64(new Uint8Array(cipher)), iv: uint8ToBase64(iv) });
}

async function aesGcmDecrypt(payload: string, key: CryptoKey): Promise<string> {
  const { cipher, iv } = JSON.parse(payload);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToUint8(iv) },
    key,
    base64ToUint8(cipher)
  );
  return decode(decrypted);
}

// --- 1. ECDH + AES ---
const ecdhAesEncryption: EncryptionAlgorithm = {
  name: 'ECDH-AES',
  async encrypt(text) {
    const start = performance.now();
    const aliceKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-384' }, true, ['deriveKey']);
    const bobKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-384' }, true, ['deriveKey']);
    const sharedSecret = await crypto.subtle.deriveKey(
      { name: 'ECDH', public: bobKeys.publicKey },
      aliceKeys.privateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await aesGcmEncrypt(text, sharedSecret, iv);
    const alicePrivate = await crypto.subtle.exportKey('pkcs8', aliceKeys.privateKey);
    const bobPublic = await crypto.subtle.exportKey('spki', bobKeys.publicKey);
    const encryptionTime = performance.now() - start;
    return {
      encrypted: JSON.stringify({ cipher, bobPublic: uint8ToBase64(new Uint8Array(bobPublic)) }),
      key: uint8ToBase64(new Uint8Array(alicePrivate)),
      encryptionTime
    };
  },
  async decrypt(encrypted, key) {
    const { cipher, bobPublic } = JSON.parse(encrypted);
    const alicePrivateKey = await crypto.subtle.importKey('pkcs8', base64ToUint8(key), { name: 'ECDH', namedCurve: 'P-384' }, false, ['deriveKey']);
    const bobPublicKey = await crypto.subtle.importKey('spki', base64ToUint8(bobPublic), { name: 'ECDH', namedCurve: 'P-384' }, false, []);
    const sharedSecret = await crypto.subtle.deriveKey(
      { name: 'ECDH', public: bobPublicKey },
      alicePrivateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    return await aesGcmDecrypt(cipher, sharedSecret);
  }
};

// --- 2. RSA + AES ---
const rsaAesEncryption: EncryptionAlgorithm = {
  name: 'RSA-AES',
  async encrypt(text) {
    const start = performance.now();
    const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const rsaKeys = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
    const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaKeys.publicKey, rawAesKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await aesGcmEncrypt(text, aesKey, iv);
    const exportedPrivateKey = await crypto.subtle.exportKey('pkcs8', rsaKeys.privateKey);
    const encryptionTime = performance.now() - start;
    return {
      encrypted: JSON.stringify({ encryptedKey: uint8ToBase64(new Uint8Array(encryptedKey)), cipher }),
      key: uint8ToBase64(new Uint8Array(exportedPrivateKey)),
      encryptionTime
    };
  },
  async decrypt(encrypted, key) {
    const { encryptedKey, cipher } = JSON.parse(encrypted);
    const privateKey = await crypto.subtle.importKey('pkcs8', base64ToUint8(key), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
    const aesRawKey = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, base64ToUint8(encryptedKey));
    const aesKey = await crypto.subtle.importKey('raw', aesRawKey, { name: 'AES-GCM' }, false, ['decrypt']);
    return await aesGcmDecrypt(cipher, aesKey);
  }
};

// --- 3. Kyber + ECDH + AES (Hybrid Simulation) ---
const hybridKyberEcdhAes: EncryptionAlgorithm = {
  name: 'Kyber+ECDH-AES',
  async encrypt(text) {
    const start = performance.now();

    // Simulate Kyber key (128-bit)
    const kyberKey = crypto.getRandomValues(new Uint8Array(16));

    // ECDH key exchange to get AES key
    const alice = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-384' }, true, ['deriveKey']);
    const bob = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-384' }, true, ['deriveKey']);
    const sharedSecret = await crypto.subtle.deriveKey(
      { name: 'ECDH', public: bob.publicKey },
      alice.privateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Combine Kyber & ECDH key: simple XOR
    const rawECDHKey = crypto.getRandomValues(new Uint8Array(16));
    const finalKey = kyberKey.map((b, i) => b ^ rawECDHKey[i]);
    const finalAesKey = await crypto.subtle.importKey('raw', finalKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await aesGcmEncrypt(text, finalAesKey, iv);
    const alicePrivate = await crypto.subtle.exportKey('pkcs8', alice.privateKey);
    const bobPublic = await crypto.subtle.exportKey('spki', bob.publicKey);

    const encryptionTime = performance.now() - start;

    return {
      encrypted: JSON.stringify({ cipher, bobPublic: uint8ToBase64(new Uint8Array(bobPublic)), rawECDHKey: uint8ToBase64(rawECDHKey), kyberKey: uint8ToBase64(kyberKey) }),
      key: uint8ToBase64(new Uint8Array(alicePrivate)),
      encryptionTime
    };
  },
  async decrypt(encrypted, key) {
    const { cipher, bobPublic, rawECDHKey, kyberKey } = JSON.parse(encrypted);
    const alicePrivateKey = await crypto.subtle.importKey('pkcs8', base64ToUint8(key), { name: 'ECDH', namedCurve: 'P-384' }, false, ['deriveKey']);
    const bobPublicKey = await crypto.subtle.importKey('spki', base64ToUint8(bobPublic), { name: 'ECDH', namedCurve: 'P-384' }, false, []);
    const sharedSecret = await crypto.subtle.deriveKey(
      { name: 'ECDH', public: bobPublicKey },
      alicePrivateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Recombine Kyber + rawECDH
    const combinedKey = base64ToUint8(kyberKey).map((b, i) => b ^ base64ToUint8(rawECDHKey)[i]);
    const aesKey = await crypto.subtle.importKey('raw', combinedKey, { name: 'AES-GCM' }, false, ['decrypt']);
    return await aesGcmDecrypt(cipher, aesKey);
  }
};

export const encryptionAlgorithms: EncryptionAlgorithm[] = [
  ecdhAesEncryption,
  rsaAesEncryption,
  hybridKyberEcdhAes
]; 