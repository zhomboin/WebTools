export type TimestampUnit = 'auto' | 's' | 'ms'

export interface TimestampParseResult {
  ok: boolean
  date?: Date
  unit?: 's' | 'ms'
  error?: string
}

export interface DurationBreakdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
  humanize: string
}

const MAX_DATE_MS = 8.64e15

export function fromTimestamp(input: string, unit: TimestampUnit = 'auto'): TimestampParseResult {
  const trimmed = input.trim()
  if (trimmed === '' || !/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: '时间戳必须是整数（允许负数）' }
  }
  const digits = trimmed.startsWith('-') ? trimmed.slice(1) : trimmed
  const resolved: 's' | 'ms' =
    unit === 'auto' ? (digits.length >= 12 ? 'ms' : 's') : unit
  const value = Number(trimmed)
  const ms = resolved === 's' ? value * 1000 : value
  if (!Number.isFinite(ms) || Math.abs(ms) > MAX_DATE_MS) {
    return { ok: false, error: '超出可表示的日期范围' }
  }
  return { ok: true, date: new Date(ms), unit: resolved }
}

export function toUnixTimestamp(date: Date): { seconds: number; milliseconds: number } {
  const milliseconds = date.getTime()
  return { seconds: Math.floor(milliseconds / 1000), milliseconds }
}

export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function listTimeZones(): string[] {
  return Intl.supportedValuesOf('timeZone')
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

export function formatInTimeZone(
  date: Date,
  timeZone: string,
  locale = 'zh-CN',
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(date)
}

export function relativeTime(target: Date, base: Date = new Date(), locale = 'zh-CN'): string {
  const diffMs = target.getTime() - base.getTime()
  const abs = Math.abs(diffMs)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: 'second', ms: 1000 },
    { unit: 'minute', ms: 60_000 },
    { unit: 'hour', ms: 3_600_000 },
    { unit: 'day', ms: 86_400_000 },
    { unit: 'week', ms: 604_800_000 },
    { unit: 'month', ms: 2_629_800_000 },
    { unit: 'year', ms: 31_557_600_000 },
  ]
  let chosen = units[0]!
  for (const u of units) {
    if (abs >= u.ms) {
      chosen = u
    }
  }
  const value = Math.round(diffMs / chosen.ms)
  return rtf.format(value, chosen.unit)
}

export function diffDuration(a: Date, b: Date): DurationBreakdown {
  const totalMs = Math.abs(a.getTime() - b.getTime())
  const totalSeconds = Math.floor(totalMs / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []
  if (days > 0) parts.push(`${days} 天`)
  if (hours > 0) parts.push(`${hours} 小时`)
  if (minutes > 0) parts.push(`${minutes} 分钟`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} 秒`)
  return { days, hours, minutes, seconds, totalMs, humanize: parts.join(' ') }
}

interface DateParts {
  yyyy: string
  MM: string
  dd: string
  HH: string
  mm: string
  ss: string
  SSS: string
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0')
}

function getLocalParts(date: Date): DateParts {
  return {
    yyyy: String(date.getFullYear()).padStart(4, '0'),
    MM: pad(date.getMonth() + 1),
    dd: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    SSS: pad(date.getMilliseconds(), 3),
  }
}

function getZonedParts(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const map: Record<string, string> = {}
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') {
      map[part.type] = part.value
    }
  }
  return {
    yyyy: map['year'] ?? '',
    MM: map['month'] ?? '',
    dd: map['day'] ?? '',
    HH: map['hour'] ?? '',
    mm: map['minute'] ?? '',
    ss: map['second'] ?? '',
    SSS: pad(date.getMilliseconds(), 3),
  }
}

export function formatCustom(date: Date, pattern: string, timeZone?: string): string {
  const parts = timeZone ? getZonedParts(date, timeZone) : getLocalParts(date)
  return pattern.replace(/yyyy|SSS|MM|dd|HH|mm|ss/g, (token) => parts[token as keyof DateParts] ?? token)
}

export function toDatetimeLocalValue(date: Date): string {
  return formatCustom(date, 'yyyy-MM-ddTHH:mm')
}

function escapeRegExp(ch: string): string {
  return /[.*+?^${}()|[\]\\]/.test(ch) ? `\\${ch}` : ch
}

export function parseCustom(text: string, pattern: string): Date | null {
  let regexSource = ''
  const tokenOrder: string[] = []
  let i = 0
  while (i < pattern.length) {
    if (pattern.slice(i, i + 4) === 'yyyy') {
      regexSource += '(\\d{4})'
      tokenOrder.push('yyyy')
      i += 4
    } else if (pattern.slice(i, i + 3) === 'SSS') {
      regexSource += '(\\d{3})'
      tokenOrder.push('SSS')
      i += 3
    } else if (['MM', 'dd', 'HH', 'mm', 'ss'].includes(pattern.slice(i, i + 2))) {
      regexSource += '(\\d{2})'
      tokenOrder.push(pattern.slice(i, i + 2))
      i += 2
    } else {
      regexSource += escapeRegExp(pattern[i]!)
      i += 1
    }
  }
  const match = new RegExp(`^\\s*${regexSource}\\s*$`).exec(text)
  if (!match) {
    return null
  }
  const values: Record<string, number> = {}
  tokenOrder.forEach((token, index) => {
    values[token] = Number(match[index + 1])
  })
  const year = values['yyyy'] ?? 1970
  const month = values['MM'] ?? 1
  const day = values['dd'] ?? 1
  const hour = values['HH'] ?? 0
  const minute = values['mm'] ?? 0
  const second = values['ss'] ?? 0
  const millisecond = values['SSS'] ?? 0
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  if (hour > 23 || minute > 59 || second > 59 || millisecond > 999) return null
  const date = new Date(year, month - 1, day, hour, minute, second, millisecond)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}
