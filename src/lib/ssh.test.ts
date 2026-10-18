import { describe, expect, it } from 'vitest'

import { ed25519KeysFromSeed, generateEd25519KeyPair } from './ssh'

function base64Decode(text: string): Uint8Array {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function ascii(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes)
}

describe('generateEd25519KeyPair', () => {
  it('公钥为 ssh-ed25519 行且 blob 结构正确', async () => {
    const pair = await generateEd25519KeyPair('unit-test')
    expect(pair.publicKey).toMatch(/^ssh-ed25519 AAAA[+/A-Za-z0-9]+ unit-test$/)
    const blob = base64Decode(pair.publicKey.split(' ')[1]!)
    // SSH wire 格式：u32(11) + "ssh-ed25519" + u32(32) + 公钥
    expect(blob.length).toBe(4 + 11 + 4 + 32)
    expect(ascii(blob.slice(4, 15))).toBe('ssh-ed25519')
  })

  it('私钥为 OpenSSH PEM 且含 magic 头', async () => {
    const pair = await generateEd25519KeyPair()
    const lines = pair.privateKey.trimEnd().split('\n')
    expect(lines[0]).toBe('-----BEGIN OPENSSH PRIVATE KEY-----')
    expect(lines.at(-1)).toBe('-----END OPENSSH PRIVATE KEY-----')
    const body = lines.slice(1, -1).join('')
    expect(ascii(base64Decode(body).slice(0, 15))).toBe('openssh-key-v1\0')
  })

  it('指纹为 SHA256 格式', async () => {
    const pair = await generateEd25519KeyPair()
    expect(pair.fingerprint).toMatch(/^SHA256:[+/A-Za-z0-9]{43}=?$/)
  })

  it('两次生成结果不同（随机种子）', async () => {
    const a = await generateEd25519KeyPair()
    const b = await generateEd25519KeyPair()
    expect(a.publicKey).not.toBe(b.publicKey)
    expect(a.privateKey).not.toBe(b.privateKey)
  })

  it('空注释时公钥行无尾注', async () => {
    const pair = await generateEd25519KeyPair()
    expect(pair.publicKey).toMatch(/^ssh-ed25519 AAAA[+/A-Za-z0-9]+$/)
  })
})

describe('ed25519KeysFromSeed', () => {
  it('同一种子公钥确定一致', async () => {
    const seed = crypto.getRandomValues(new Uint8Array(32))
    const a = await ed25519KeysFromSeed(seed, 'same')
    const b = await ed25519KeysFromSeed(seed, 'same')
    expect(a.publicKey).toBe(b.publicKey)
    expect(a.fingerprint).toBe(b.fingerprint)
    // 私钥容器内的 check1/check2 为随机防篡改字节，两次导出的 PEM 不同属正常
    expect(a.privateKey).not.toBe(b.privateKey)
  })

  it('种子长度校验', async () => {
    await expect(ed25519KeysFromSeed(new Uint8Array(31))).rejects.toThrow(/32 字节/)
  })
})
