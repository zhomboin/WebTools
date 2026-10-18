export interface PasswordOptions {
  length: number
  lowercase: boolean
  uppercase: boolean
  digits: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

export type RandomInt = (maxExclusive: number) => number

export type StrengthLevel = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong'

export interface StrengthEstimate {
  entropyBits: number
  level: StrengthLevel
  label: string
}

export class PasswordOptionsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PasswordOptionsError'
  }
}

export const MIN_LENGTH = 4
export const MAX_LENGTH = 128
export const DEFAULT_LENGTH = 20

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{}<>?,.;:~'

const AMBIGUOUS = new Set(['i', 'l', '1', 'I', 'L', 'o', '0', 'O', '|', '`'])

// 拒绝采样避免模偏差：只接受落在 [0, limit) 的随机数，limit 为 maxExclusive 的整数倍
export function createSecureRandom(): RandomInt {
  return (maxExclusive) => {
    if (!Number.isInteger(maxExclusive) || maxExclusive < 1) {
      throw new Error('maxExclusive 必须是正整数')
    }
    if (maxExclusive === 1) {
      return 0
    }
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive
    const buffer = new Uint32Array(1)
    for (;;) {
      crypto.getRandomValues(buffer)
      const value = buffer[0]!
      if (value < limit) {
        return value % maxExclusive
      }
    }
  }
}

export function buildPool(options: PasswordOptions): { pool: string; requiredSets: string[] } {
  const selected: string[] = []
  if (options.lowercase) selected.push(LOWERCASE)
  if (options.uppercase) selected.push(UPPERCASE)
  if (options.digits) selected.push(DIGITS)
  if (options.symbols) selected.push(SYMBOLS)
  if (selected.length === 0) {
    throw new PasswordOptionsError('至少选择一种字符类型')
  }
  const applyFilter = (set: string) =>
    options.excludeAmbiguous ? [...set].filter((ch) => !AMBIGUOUS.has(ch)).join('') : set
  const requiredSets = selected.map(applyFilter).filter((set) => set.length > 0)
  return { pool: requiredSets.join(''), requiredSets }
}

export function generatePassword(
  options: PasswordOptions,
  random: RandomInt = createSecureRandom(),
): string {
  const length = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.floor(options.length)))
  const { pool, requiredSets } = buildPool(options)
  const chars: string[] = []
  for (const set of requiredSets) {
    chars.push(set[random(set.length)]!)
  }
  while (chars.length < length) {
    chars.push(pool[random(pool.length)]!)
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1)
    const tmp = chars[i]!
    chars[i] = chars[j]!
    chars[j] = tmp
  }
  return chars.slice(0, length).join('')
}

export function estimateStrength(options: PasswordOptions): StrengthEstimate {
  const { pool } = buildPool(options)
  const length = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.floor(options.length)))
  const entropyBits = Math.round(length * Math.log2(pool.length))
  if (entropyBits < 40) return { entropyBits, level: 'very-weak', label: '很弱' }
  if (entropyBits < 56) return { entropyBits, level: 'weak', label: '弱' }
  if (entropyBits < 72) return { entropyBits, level: 'fair', label: '中等' }
  if (entropyBits < 90) return { entropyBits, level: 'strong', label: '强' }
  return { entropyBits, level: 'very-strong', label: '很强' }
}

export function defaultOptions(): PasswordOptions {
  return {
    length: DEFAULT_LENGTH,
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
  }
}
