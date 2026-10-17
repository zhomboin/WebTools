import { describe, expect, it } from 'vitest'

import {
  diffDuration,
  formatCustom,
  formatInTimeZone,
  fromTimestamp,
  isValidTimeZone,
  listTimeZones,
  parseCustom,
  relativeTime,
  toDatetimeLocalValue,
  toUnixTimestamp,
} from './datetime'

describe('fromTimestamp / toUnixTimestamp', () => {
  it('10 位数字自动识别为秒', () => {
    const result = fromTimestamp('1700000000')
    expect(result.ok).toBe(true)
    expect(result.unit).toBe('s')
    expect(result.date?.toISOString()).toBe('2023-11-14T22:13:20.000Z')
  })

  it('13 位数字自动识别为毫秒', () => {
    const result = fromTimestamp('1700000000000')
    expect(result.ok).toBe(true)
    expect(result.unit).toBe('ms')
    expect(result.date?.toISOString()).toBe('2023-11-14T22:13:20.000Z')
  })

  it('支持负数时间戳', () => {
    const result = fromTimestamp('-1')
    expect(result.ok).toBe(true)
    expect(result.date?.toISOString()).toBe('1969-12-31T23:59:59.000Z')
  })

  it('显式指定单位', () => {
    expect(fromTimestamp('1000', 's').date?.toISOString()).toBe('1970-01-01T00:16:40.000Z')
    expect(fromTimestamp('1000', 'ms').date?.toISOString()).toBe('1970-01-01T00:00:01.000Z')
  })

  it('非法输入与超范围', () => {
    expect(fromTimestamp('abc').ok).toBe(false)
    expect(fromTimestamp('1.5').ok).toBe(false)
    expect(fromTimestamp('').ok).toBe(false)
    expect(fromTimestamp('999999999999999999999999').ok).toBe(false)
  })

  it('toUnixTimestamp 返回秒与毫秒', () => {
    expect(toUnixTimestamp(new Date('2023-11-14T22:13:20.000Z'))).toEqual({
      seconds: 1700000000,
      milliseconds: 1700000000000,
    })
  })
})

describe('时区', () => {
  it('同一时刻在不同时区格式化不同', () => {
    const date = new Date(Date.UTC(2026, 0, 2, 12, 0, 0))
    expect(formatInTimeZone(date, 'UTC', 'en-US', { dateStyle: 'medium', timeStyle: 'medium' })).toBe(
      'Jan 2, 2026, 12:00:00 PM',
    )
    expect(
      formatInTimeZone(date, 'Asia/Shanghai', 'en-US', { dateStyle: 'medium', timeStyle: 'medium' }),
    ).toBe('Jan 2, 2026, 8:00:00 PM')
  })

  it('时区校验', () => {
    expect(isValidTimeZone('Asia/Shanghai')).toBe(true)
    expect(isValidTimeZone('Not/AZone')).toBe(false)
  })

  it('组件式选项可与 timeZoneName 组合（dateStyle/timeStyle 不允许）', () => {
    const date = new Date(Date.UTC(2026, 0, 2, 12, 0, 0))
    const text = formatInTimeZone(date, 'Asia/Shanghai', 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZoneName: 'shortOffset',
    })
    expect(text).toContain('GMT+8')
  })

  it('时区列表包含常见时区', () => {
    const zones = listTimeZones()
    expect(zones).toContain('Asia/Shanghai')
    expect(zones).toContain('America/New_York')
    expect(zones.length).toBeGreaterThan(100)
  })
})

describe('relativeTime', () => {
  const base = new Date('2026-10-17T12:00:00Z')

  it('相同时间为"现在"', () => {
    expect(relativeTime(base, base)).toBe('现在')
  })

  it('未来与过去', () => {
    expect(relativeTime(new Date('2026-10-17T15:00:00Z'), base)).toBe('3小时后')
    expect(relativeTime(new Date('2026-10-17T09:00:00Z'), base)).toBe('3小时前')
  })

  it('更大单位', () => {
    expect(relativeTime(new Date('2026-10-24T12:00:00Z'), base)).toBe('下周')
    expect(relativeTime(new Date('2026-11-06T12:00:00Z'), base)).toBe('3周后')
    expect(relativeTime(new Date('2027-11-17T12:00:00Z'), base)).toBe('明年')
  })
})

describe('diffDuration', () => {
  it('分解天时分秒', () => {
    const a = new Date('2026-10-17T12:00:00Z')
    const b = new Date('2026-10-14T08:30:20Z')
    const d = diffDuration(a, b)
    expect(d).toMatchObject({ days: 3, hours: 3, minutes: 29, seconds: 40 })
    expect(d.humanize).toBe('3 天 3 小时 29 分钟 40 秒')
  })

  it('相同时间', () => {
    const d = diffDuration(new Date(0), new Date(0))
    expect(d.humanize).toBe('0 秒')
    expect(d.totalMs).toBe(0)
  })
})

describe('formatCustom / parseCustom', () => {
  it('本地时间格式化', () => {
    const date = new Date(2026, 9, 17, 23, 5, 9, 123)
    expect(formatCustom(date, 'yyyy-MM-dd HH:mm:ss')).toBe('2026-10-17 23:05:09')
    expect(formatCustom(date, 'yyyy/MM/dd')).toBe('2026/10/17')
    expect(formatCustom(date, 'HH:mm:ss.SSS')).toBe('23:05:09.123')
    expect(formatCustom(date, 'yyyy-MM-ddTHH:mm')).toBe('2026-10-17T23:05')
    expect(toDatetimeLocalValue(date)).toBe('2026-10-17T23:05')
  })

  it('指定时区格式化', () => {
    const date = new Date(Date.UTC(2026, 0, 2, 12, 0, 0))
    expect(formatCustom(date, 'yyyy-MM-dd HH:mm', 'UTC')).toBe('2026-01-02 12:00')
    expect(formatCustom(date, 'yyyy-MM-dd HH:mm', 'Asia/Shanghai')).toBe('2026-01-02 20:00')
  })

  it('按模式解析并往返一致', () => {
    const text = '2026-10-17 23:05:09'
    const date = parseCustom(text, 'yyyy-MM-dd HH:mm:ss')
    expect(date).not.toBeNull()
    expect(date?.getFullYear()).toBe(2026)
    expect(date?.getMonth()).toBe(9)
    expect(date?.getDate()).toBe(17)
    expect(date?.getHours()).toBe(23)
    expect(date?.getMinutes()).toBe(5)
    expect(date?.getSeconds()).toBe(9)
    expect(formatCustom(date!, 'yyyy-MM-dd HH:mm:ss')).toBe(text)
  })

  it('解析含毫秒与中文分隔符', () => {
    const date = parseCustom('2026年10月17日 08:03:04.500', 'yyyy年MM月dd日 HH:mm:ss.SSS')
    expect(date?.getMilliseconds()).toBe(500)
    expect(date?.getHours()).toBe(8)
  })

  it('解析不合法的日期返回 null', () => {
    expect(parseCustom('2026-02-30', 'yyyy-MM-dd')).toBeNull()
    expect(parseCustom('2026-13-01', 'yyyy-MM-dd')).toBeNull()
    expect(parseCustom('2026-10-17 25:00', 'yyyy-MM-dd HH:mm')).toBeNull()
    expect(parseCustom('not-a-date', 'yyyy-MM-dd')).toBeNull()
    expect(parseCustom('2026-10-1', 'yyyy-MM-dd')).toBeNull()
  })
})
