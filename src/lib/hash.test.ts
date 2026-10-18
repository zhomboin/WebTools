import { describe, expect, it } from 'vitest'

import { digest, hmac, toHex } from './hash'

describe('digest（已知向量）', () => {
  const vectors: Array<[Parameters<typeof digest>[0], string, string]> = [
    ['SHA-1', 'abc', 'a9993e364706816aba3e25717850c26c9cd0d89d'],
    [
      'SHA-256',
      'abc',
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    ],
    [
      'SHA-384',
      'abc',
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    ],
    [
      'SHA-512',
      'abc',
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    ],
    ['MD5', 'abc', '900150983cd24fb0d6963f7d28e17f72'],
    ['MD5', '', 'd41d8cd98f00b204e9800998ecf8427e'],
    ['CRC32', 'abc', '352441c2'],
    ['CRC32', 'The quick brown fox jumps over the lazy dog', '414fa339'],
    [
      'SHA3-256',
      'abc',
      '3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532',
    ],
    [
      'SHA3-512',
      'abc',
      'b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0',
    ],
  ]

  for (const [algorithm, input, expected] of vectors) {
    it(`${algorithm}("${input.slice(0, 20)}")`, async () => {
      expect(await digest(algorithm, input)).toBe(expected)
    })
  }

  it('SHA-256 空输入', async () => {
    expect(await digest('SHA-256', '')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })
})

describe('hmac（已知向量）', () => {
  it('HMAC-SHA256', async () => {
    expect(await hmac('SHA-256', 'The quick brown fox jumps over the lazy dog', 'key')).toBe(
      'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8',
    )
  })

  it('HMAC-SHA1', async () => {
    expect(await hmac('SHA-1', 'The quick brown fox jumps over the lazy dog', 'key')).toBe(
      'de7c9b85b8b78aa6bc8a7a36f70a90701c9db4d9',
    )
  })

  it('不同口令产生不同签名', async () => {
    const a = await hmac('SHA-256', 'message', 'key-a')
    const b = await hmac('SHA-256', 'message', 'key-b')
    expect(a).not.toBe(b)
  })
})

describe('toHex', () => {
  it('字节转小写十六进制', async () => {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('abc'))
    expect(toHex(buffer)).toMatch(/^[0-9a-f]{64}$/)
  })
})
