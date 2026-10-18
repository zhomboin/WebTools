import { describe, expect, it } from 'vitest'

import {
  estimateStrength,
  generatePassword,
  buildPool,
  defaultOptions,
  PasswordOptionsError,
} from './password'

const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGIT = '0123456789'
const SYMBOL = '!@#$%^&*()-_=+[]{}<>?,.;:~'
const AMBIGUOUS = new Set(['i', 'l', '1', 'I', 'L', 'o', '0', 'O', '|', '`'])

// 确定性随机源：按给定序列循环取值
function sequenceRandom(values: number[]): (max: number) => number {
  let index = 0
  return (max) => values[index++ % values.length]! % max
}

describe('generatePassword', () => {
  it('长度正确且只包含所选字符集', () => {
    const options = { ...defaultOptions(), length: 32 }
    for (let i = 0; i < 20; i++) {
      const password = generatePassword(options)
      expect(password).toHaveLength(32)
      const pool = LOWER + UPPER + DIGIT + SYMBOL
      for (const ch of password) {
        expect(pool).toContain(ch)
      }
    }
  })

  it('每个启用的字符类型至少出现一个字符', () => {
    const options = { ...defaultOptions(), length: 12 }
    for (let i = 0; i < 50; i++) {
      const password = generatePassword(options)
      expect([...password].some((ch) => LOWER.includes(ch))).toBe(true)
      expect([...password].some((ch) => UPPER.includes(ch))).toBe(true)
      expect([...password].some((ch) => DIGIT.includes(ch))).toBe(true)
      expect([...password].some((ch) => SYMBOL.includes(ch))).toBe(true)
    }
  })

  it('排除易混淆字符', () => {
    const options = { ...defaultOptions(), excludeAmbiguous: true }
    for (let i = 0; i < 20; i++) {
      for (const ch of generatePassword(options)) {
        expect(AMBIGUOUS.has(ch)).toBe(false)
      }
    }
  })

  it('仅选择单一字符集时正确', () => {
    const options = { ...defaultOptions(), uppercase: false, digits: false, symbols: false }
    const password = generatePassword(options)
    expect(password).toHaveLength(defaultOptions().length)
    for (const ch of password) {
      expect(LOWER).toContain(ch)
    }
  })

  it('未选择任何字符类型时抛错', () => {
    const options = {
      length: 16,
      lowercase: false,
      uppercase: false,
      digits: false,
      symbols: false,
      excludeAmbiguous: false,
    }
    expect(() => generatePassword(options)).toThrow(PasswordOptionsError)
  })

  it('长度被限制在 [4, 128]', () => {
    expect(generatePassword({ ...defaultOptions(), length: 1 })).toHaveLength(4)
    expect(generatePassword({ ...defaultOptions(), length: 500 })).toHaveLength(128)
  })

  it('注入确定性随机源时输出可复现', () => {
    const randomA = sequenceRandom([3, 7, 1, 9, 0, 5, 2, 8, 4, 6])
    const randomB = sequenceRandom([3, 7, 1, 9, 0, 5, 2, 8, 4, 6])
    const options = { ...defaultOptions(), length: 16 }
    expect(generatePassword(options, randomA)).toBe(generatePassword(options, randomB))
  })

  it('拒绝采样：随机源返回越界值时被跳过', () => {
    // max=10 时 limit = ⌊2^32/10⌋*10，返回 limit（越界）应被拒绝并重取
    let calls = 0
    const random = (_max: number) => {
      calls++
      if (calls === 1) return Number.MAX_SAFE_INTEGER // 越界值，应被拒绝并重取
      return 0
    }
    expect(() => generatePassword({ ...defaultOptions(), length: 8 }, random)).not.toThrow()
  })
})

describe('buildPool', () => {
  it('排除易混淆后各集合仍非空', () => {
    const { requiredSets } = buildPool({ ...defaultOptions(), excludeAmbiguous: true })
    expect(requiredSets).toHaveLength(4)
    const { pool } = buildPool({ ...defaultOptions(), excludeAmbiguous: true })
    expect(pool).not.toContain('0')
    expect(pool).not.toContain('l')
    expect(pool).toContain('a')
    expect(pool).toContain('!')
  })

  it('字符池大小符合预期', () => {
    expect(buildPool(defaultOptions()).pool).toHaveLength(26 + 26 + 10 + SYMBOL.length)
    expect(buildPool({ ...defaultOptions(), symbols: false }).pool).toHaveLength(26 + 26 + 10)
  })
})

describe('estimateStrength', () => {
  it('熵计算与分级正确', () => {
    const poolSize = 26 + 26 + 10 + SYMBOL.length // 94
    const bits20 = Math.round(20 * Math.log2(poolSize))
    expect(estimateStrength(defaultOptions()).entropyBits).toBe(bits20)
    expect(estimateStrength(defaultOptions()).level).toBe('very-strong')

    const digitsOnly = {
      length: 6,
      lowercase: false,
      uppercase: false,
      digits: true,
      symbols: false,
      excludeAmbiguous: false,
    }
    expect(estimateStrength(digitsOnly).entropyBits).toBe(Math.round(6 * Math.log2(10)))
    expect(estimateStrength(digitsOnly).level).toBe('very-weak')
  })

  it('各级别边界', () => {
    const base = defaultOptions()
    expect(estimateStrength({ ...base, length: 8 }).level).toBe('weak') // ≈52 bits
    expect(estimateStrength({ ...base, length: 10 }).level).toBe('fair') // ≈66 bits
    expect(estimateStrength({ ...base, length: 13 }).level).toBe('strong') // ≈85 bits
    expect(estimateStrength({ ...base, length: 20 }).level).toBe('very-strong') // ≈131 bits
  })
})
