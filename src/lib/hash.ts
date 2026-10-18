export type WebCryptoHashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
export type WasmHashAlgorithm = 'MD5' | 'CRC32' | 'SHA3-256' | 'SHA3-512'
export type HashAlgorithm = WebCryptoHashAlgorithm | WasmHashAlgorithm

export const WEBCRYPTO_HASH_ALGORITHMS: readonly WebCryptoHashAlgorithm[] = [
  'SHA-1',
  'SHA-256',
  'SHA-384',
  'SHA-512',
]

export const WASM_HASH_ALGORITHMS: readonly WasmHashAlgorithm[] = ['MD5', 'CRC32', 'SHA3-256', 'SHA3-512']

export const ALL_HASH_ALGORITHMS: readonly HashAlgorithm[] = [
  ...WEBCRYPTO_HASH_ALGORITHMS,
  ...WASM_HASH_ALGORITHMS,
]

export function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let hex = ''
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0')
  }
  return hex
}

export async function digest(algorithm: HashAlgorithm, text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  if ((WEBCRYPTO_HASH_ALGORITHMS as readonly string[]).includes(algorithm)) {
    const buffer = await crypto.subtle.digest(algorithm, data)
    return toHex(buffer)
  }
  // MD5 / CRC32 / SHA-3 不在 WebCrypto 中，按需动态加载 hash-wasm，不进主包
  const { crc32, md5, sha3 } = await import('hash-wasm')
  switch (algorithm) {
    case 'MD5':
      return md5(data)
    case 'CRC32':
      // hash-wasm 的 crc32 运行时返回无符号 32 位数字，但其类型声明误标为 string
      return ((await crc32(data)) as unknown as number).toString(16).padStart(8, '0')
    case 'SHA3-256':
      return sha3(data, 256)
    case 'SHA3-512':
      return sha3(data, 512)
    default:
      throw new Error(`不支持的算法：${algorithm}`)
  }
}

export async function hmac(
  algorithm: WebCryptoHashAlgorithm,
  message: string,
  key: string,
): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return toHex(signature)
}
