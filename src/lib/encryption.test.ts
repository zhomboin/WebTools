import { describe, expect, it } from 'vitest'

import {
  EncryptionError,
  base64ToBytes,
  bytesToBase64,
  decryptText,
  encryptText,
  generateRsaKeyPair,
  pemToBytes,
  rsaDecrypt,
  rsaEncrypt,
} from './encryption'

const SAMPLE = '所有处理均在本地浏览器完成 — All local, no upload. 🔒'

describe('base64 工具', () => {
  it('往返一致', () => {
    const bytes = new TextEncoder().encode(SAMPLE)
    expect(new TextDecoder().decode(base64ToBytes(bytesToBase64(bytes)))).toBe(SAMPLE)
  })

  it('非法 Base64 抛错', () => {
    expect(() => base64ToBytes('!!!not-base64!!!')).toThrow(EncryptionError)
  })
})

describe('对称加解密（口令 + PBKDF2）', () => {
  it('AES-GCM 往返一致（含中文与 emoji）', async () => {
    const payload = await encryptText('AES-GCM', SAMPLE, '口令 123')
    expect(await decryptText('AES-GCM', payload, '口令 123')).toBe(SAMPLE)
  })

  it('AES-CBC 往返一致', async () => {
    const payload = await encryptText('AES-CBC', SAMPLE, 'password')
    expect(await decryptText('AES-CBC', payload, 'password')).toBe(SAMPLE)
  })

  it('空文本往返', async () => {
    const payload = await encryptText('AES-GCM', '', 'pw')
    expect(await decryptText('AES-GCM', payload, 'pw')).toBe('')
  })

  it('错误口令抛错', async () => {
    const payload = await encryptText('AES-GCM', SAMPLE, 'correct')
    await expect(decryptText('AES-GCM', payload, 'wrong')).rejects.toThrow(EncryptionError)
  })

  it('损坏数据抛错', async () => {
    const payload = await encryptText('AES-GCM', SAMPLE, 'pw')
    const tampered = payload.slice(0, -4) + 'AAAA'
    await expect(decryptText('AES-GCM', tampered, 'pw')).rejects.toThrow(EncryptionError)
    await expect(decryptText('AES-GCM', 'aGk=', 'pw')).rejects.toThrow(/不完整/)
  })

  it('随机 salt/iv：两次加密产生不同密文', async () => {
    const a = await encryptText('AES-GCM', SAMPLE, 'pw')
    const b = await encryptText('AES-GCM', SAMPLE, 'pw')
    expect(a).not.toBe(b)
  })

  it('密文结构为 salt(16)+iv(12)+cipher', async () => {
    const payload = await encryptText('AES-GCM', 'x', 'pw')
    expect(base64ToBytes(payload).length).toBeGreaterThan(16 + 12 + 16)
  })

  it('空口令抛错', async () => {
    await expect(encryptText('AES-GCM', 'x', '')).rejects.toThrow(EncryptionError)
  })
})

describe('RSA-OAEP', () => {
  it('生成密钥对并加解密往返', async () => {
    const pair = await generateRsaKeyPair()
    expect(pair.publicKeyPem).toContain('-----BEGIN PUBLIC KEY-----')
    expect(pair.privateKeyPem).toContain('-----BEGIN PRIVATE KEY-----')
    const cipher = await rsaEncrypt(pair.publicKeyPem, SAMPLE)
    expect(await rsaDecrypt(pair.privateKeyPem, cipher)).toBe(SAMPLE)
  })

  it('密钥不匹配时解密抛错', async () => {
    const pairA = await generateRsaKeyPair()
    const pairB = await generateRsaKeyPair()
    const cipher = await rsaEncrypt(pairA.publicKeyPem, 'secret')
    await expect(rsaDecrypt(pairB.privateKeyPem, cipher)).rejects.toThrow(EncryptionError)
  })

  it('无效 PEM 抛错', async () => {
    await expect(rsaEncrypt('not a pem', 'x')).rejects.toThrow(EncryptionError)
  })

  it('pemToBytes 提取 DER 并拒绝缺段 PEM', () => {
    const pem = '-----BEGIN PUBLIC KEY-----\nQUJD\n-----END PUBLIC KEY-----'
    expect(new TextDecoder().decode(pemToBytes(pem, 'PUBLIC KEY'))).toBe('ABC')
    expect(() => pemToBytes('-----BEGIN OTHER KEY-----\nQUJD\n-----END OTHER KEY-----', 'PUBLIC KEY')).toThrow(
      EncryptionError,
    )
  })
})
