export type SymmetricAlgorithm = 'AES-GCM' | 'AES-CBC'

export interface RsaKeyPairPem {
  publicKeyPem: string
  privateKeyPem: string
}

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EncryptionError'
  }
}

const PBKDF2_ITERATIONS = 100_000
const SALT_BYTES = 16
const GCM_IV_BYTES = 12
const CBC_IV_BYTES = 16

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  try {
    const binary = atob(base64.trim())
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  } catch {
    throw new EncryptionError('无效的 Base64 数据')
  }
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  algorithm: SymmetricAlgorithm,
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: algorithm, length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function ivBytesOf(algorithm: SymmetricAlgorithm): number {
  return algorithm === 'AES-GCM' ? GCM_IV_BYTES : CBC_IV_BYTES
}

// 输出格式：base64(salt[16] || iv[12|16] || ciphertext)
export async function encryptText(
  algorithm: SymmetricAlgorithm,
  plaintext: string,
  password: string,
): Promise<string> {
  if (password === '') {
    throw new EncryptionError('口令不能为空')
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(ivBytesOf(algorithm)))
  const key = await deriveKey(password, salt, algorithm)
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: algorithm, iv },
      key,
      new TextEncoder().encode(plaintext),
    ),
  )
  const payload = new Uint8Array(salt.length + iv.length + cipher.length)
  payload.set(salt, 0)
  payload.set(iv, salt.length)
  payload.set(cipher, salt.length + iv.length)
  return bytesToBase64(payload)
}

export async function decryptText(
  algorithm: SymmetricAlgorithm,
  payloadBase64: string,
  password: string,
): Promise<string> {
  const payload = base64ToBytes(payloadBase64)
  const ivLength = ivBytesOf(algorithm)
  const minLength = SALT_BYTES + ivLength + 16
  if (payload.length < minLength) {
    throw new EncryptionError('密文数据不完整')
  }
  const salt = payload.subarray(0, SALT_BYTES)
  const iv = payload.subarray(SALT_BYTES, SALT_BYTES + ivLength)
  const cipher = payload.subarray(SALT_BYTES + ivLength)
  const key = await deriveKey(password, salt, algorithm)
  try {
    const plain = await crypto.subtle.decrypt({ name: algorithm, iv }, key, cipher)
    return new TextDecoder().decode(plain)
  } catch {
    throw new EncryptionError('解密失败：口令错误或数据损坏')
  }
}

function toPem(label: string, buffer: ArrayBuffer): string {
  const base64 = bytesToBase64(new Uint8Array(buffer))
  const lines = base64.match(/.{1,64}/g) ?? []
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----\n`
}

export function pemToBytes(pem: string, label: string): Uint8Array<ArrayBuffer> {
  const pattern = new RegExp(`-----BEGIN ${label}-----([\\s\\S]+?)-----END ${label}-----`)
  const match = pattern.exec(pem)
  if (!match) {
    throw new EncryptionError(`无效的 PEM 数据：缺少 ${label} 段`)
  }
  return base64ToBytes(match[1]!.replace(/\s+/g, ''))
}

export async function generateRsaKeyPair(): Promise<RsaKeyPairPem> {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 3072,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt'],
  )
  const spki = await crypto.subtle.exportKey('spki', pair.publicKey)
  const pkcs8 = await crypto.subtle.exportKey('pkcs8', pair.privateKey)
  return {
    publicKeyPem: toPem('PUBLIC KEY', spki),
    privateKeyPem: toPem('PRIVATE KEY', pkcs8),
  }
}

export async function rsaEncrypt(publicKeyPem: string, plaintext: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'spki',
    pemToBytes(publicKeyPem, 'PUBLIC KEY'),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  )
  try {
    const cipher = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      key,
      new TextEncoder().encode(plaintext),
    )
    return bytesToBase64(new Uint8Array(cipher))
  } catch (err) {
    if (err instanceof EncryptionError) {
      throw err
    }
    throw new EncryptionError('加密失败：明文过长（RSA-OAEP 上限约 300 字节）或密钥无效')
  }
}

export async function rsaDecrypt(privateKeyPem: string, ciphertextBase64: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToBytes(privateKeyPem, 'PRIVATE KEY'),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt'],
  )
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      key,
      base64ToBytes(ciphertextBase64),
    )
    return new TextDecoder().decode(plain)
  } catch {
    throw new EncryptionError('解密失败：密钥不匹配或数据损坏')
  }
}
