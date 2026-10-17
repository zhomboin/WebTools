export interface JsonErrorLocation {
  message: string
  line: number
  column: number
  position: number
}

export type JsonParseResult = { ok: true; value: unknown } | { ok: false; error: JsonErrorLocation }

export class JsonToolError extends Error {
  readonly location: JsonErrorLocation

  constructor(location: JsonErrorLocation) {
    super(`第 ${location.line} 行第 ${location.column} 列：${location.message}`)
    this.name = 'JsonToolError'
    this.location = location
  }
}

export function byteSize(text: string): number {
  return new TextEncoder().encode(text).length
}

export function lineColumnAt(text: string, position: number): { line: number; column: number } {
  let line = 1
  let lineStart = 0
  const end = Math.min(position, text.length)
  for (let i = 0; i < end; i++) {
    if (text.charCodeAt(i) === 10) {
      line++
      lineStart = i + 1
    }
  }
  return { line, column: position - lineStart + 1 }
}

export function parse(text: string): JsonParseResult {
  return new JsonParser(text).parseDocument()
}

export function validate(text: string): { valid: boolean; error: JsonErrorLocation | null } {
  const result = parse(text)
  return result.ok ? { valid: true, error: null } : { valid: false, error: result.error }
}

export function format(text: string, indent: 2 | 4 = 2): string {
  return JSON.stringify(parseOrThrow(text), null, indent)
}

export function minify(text: string): string {
  return JSON.stringify(parseOrThrow(text))
}

export function sortKeys(text: string, indent: 2 | 4 = 2): string {
  return JSON.stringify(sortValue(parseOrThrow(text)), null, indent)
}

export function escapeUnicode(text: string, indent: 2 | 4 = 2): string {
  return JSON.stringify(parseOrThrow(text), null, indent).replace(/[\u0080-\uffff]/g, (ch) => {
    return `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`
  })
}

export function unescapeUnicode(text: string, indent: 2 | 4 = 2): string {
  return JSON.stringify(parseOrThrow(text), null, indent)
}

function parseOrThrow(text: string): unknown {
  const result = parse(text)
  if (!result.ok) {
    throw new JsonToolError(result.error)
  }
  return result.value
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue)
  }
  if (isPlainObject(value)) {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortValue(value[key])
    }
    return sorted
  }
  return value
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

class ParseError extends Error {
  readonly position: number

  constructor(message: string, position: number) {
    super(message)
    this.position = position
  }
}

const WHITESPACE = new Set([' ', '\t', '\n', '\r'])
const NUMBER_CHARS = new Set('0123456789-+.eE'.split(''))
const NUMBER_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/

class JsonParser {
  private readonly src: string
  private pos = 0

  constructor(src: string) {
    this.src = src
  }

  parseDocument(): JsonParseResult {
    try {
      this.skipWhitespace()
      const value = this.parseValue()
      this.skipWhitespace()
      if (this.pos < this.src.length) {
        throw this.error('JSON 结束后存在多余内容')
      }
      return { ok: true, value }
    } catch (err) {
      if (err instanceof ParseError) {
        const { line, column } = lineColumnAt(this.src, err.position)
        return { ok: false, error: { message: err.message, line, column, position: err.position } }
      }
      throw err
    }
  }

  private skipWhitespace(): void {
    while (this.pos < this.src.length && WHITESPACE.has(this.src[this.pos]!)) {
      this.pos++
    }
  }

  private peek(): string | undefined {
    return this.pos < this.src.length ? this.src[this.pos] : undefined
  }

  private parseValue(): unknown {
    const ch = this.peek()
    if (ch === '{') return this.parseObject()
    if (ch === '[') return this.parseArray()
    if (ch === '"') return this.parseString()
    if (ch === 't') return this.parseLiteral('true', true)
    if (ch === 'f') return this.parseLiteral('false', false)
    if (ch === 'n') return this.parseLiteral('null', null)
    if (ch === '-' || (ch !== undefined && isDigit(ch))) return this.parseNumber()
    throw this.error(`意外的字符 ${describeChar(ch)}`)
  }

  private parseObject(): Record<string, unknown> {
    this.pos++
    const obj: Record<string, unknown> = {}
    this.skipWhitespace()
    if (this.consume('}')) return obj
    for (;;) {
      this.skipWhitespace()
      if (this.peek() !== '"') throw this.error('对象键必须是字符串')
      const key = this.parseString()
      this.skipWhitespace()
      if (!this.consume(':')) throw this.error("应为 ':'")
      this.skipWhitespace()
      obj[key] = this.parseValue()
      this.skipWhitespace()
      if (this.consume(',')) continue
      if (this.consume('}')) return obj
      throw this.error("应为 ',' 或 '}'")
    }
  }

  private parseArray(): unknown[] {
    this.pos++
    const arr: unknown[] = []
    this.skipWhitespace()
    if (this.consume(']')) return arr
    for (;;) {
      this.skipWhitespace()
      arr.push(this.parseValue())
      this.skipWhitespace()
      if (this.consume(',')) continue
      if (this.consume(']')) return arr
      throw this.error("应为 ',' 或 ']'")
    }
  }

  private parseString(): string {
    this.pos++
    const parts: string[] = []
    for (;;) {
      if (this.pos >= this.src.length) throw this.errorAt(this.pos, '字符串未闭合')
      const ch = this.src[this.pos]!
      if (ch === '"') {
        this.pos++
        return parts.join('')
      }
      if (ch === '\\') {
        this.pos++
        parts.push(this.parseEscape())
        continue
      }
      if (ch.charCodeAt(0) < 0x20) throw this.error('字符串中存在未转义的控制字符')
      parts.push(ch)
      this.pos++
    }
  }

  private parseEscape(): string {
    if (this.pos >= this.src.length) throw this.errorAt(this.pos, '字符串未闭合')
    const ch = this.src[this.pos]!
    this.pos++
    switch (ch) {
      case '"':
        return '"'
      case '\\':
        return '\\'
      case '/':
        return '/'
      case 'b':
        return '\b'
      case 'f':
        return '\f'
      case 'n':
        return '\n'
      case 'r':
        return '\r'
      case 't':
        return '\t'
      case 'u': {
        let hex = ''
        for (let i = 0; i < 4; i++) {
          if (this.pos >= this.src.length) throw this.errorAt(this.pos, 'Unicode 转义不完整')
          const c = this.src[this.pos]!
          if (!isHex(c)) throw this.error(`无效的 Unicode 转义字符 '${c}'`)
          hex += c
          this.pos++
        }
        return String.fromCharCode(Number.parseInt(hex, 16))
      }
      default:
        throw this.error(`无效的转义字符 '\\${ch}'`)
    }
  }

  private parseLiteral(word: string, value: unknown): unknown {
    for (let i = 0; i < word.length; i++) {
      if (this.src[this.pos + i] !== word[i]) {
        throw this.errorAt(this.pos, `无效的字面量，应为 '${word}'`)
      }
    }
    this.pos += word.length
    return value
  }

  private parseNumber(): number {
    const start = this.pos
    while (this.pos < this.src.length && NUMBER_CHARS.has(this.src[this.pos]!)) {
      this.pos++
    }
    const raw = this.src.slice(start, this.pos)
    if (!NUMBER_PATTERN.test(raw)) {
      throw this.errorAt(start, `无效的数字 ${describeChar(raw)}`)
    }
    const value = Number(raw)
    if (!Number.isFinite(value)) {
      throw this.errorAt(start, '数字超出可表示范围')
    }
    return value
  }

  private consume(ch: string): boolean {
    if (this.src[this.pos] === ch) {
      this.pos++
      return true
    }
    return false
  }

  private error(message: string): ParseError {
    return this.errorAt(this.pos, message)
  }

  private errorAt(position: number, message: string): ParseError {
    return new ParseError(message, position)
  }
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}

function isHex(ch: string): boolean {
  return isDigit(ch) || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F')
}

function describeChar(ch: string | undefined): string {
  return ch === undefined ? "（输入结束）" : `'${ch}'`
}
