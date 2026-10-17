import { describe, expect, it } from 'vitest'

import {
  byteSize,
  escapeUnicode,
  format,
  lineColumnAt,
  minify,
  parse,
  sortKeys,
  unescapeUnicode,
  validate,
} from './json'

describe('format / minify', () => {
  it('格式化嵌套结构（2 空格）', () => {
    expect(format('{"b":[{"c":1}]}')).toBe('{\n  "b": [\n    {\n      "c": 1\n    }\n  ]\n}')
  })

  it('格式化支持 4 空格缩进', () => {
    expect(format('{"a":1}', 4)).toBe('{\n    "a": 1\n}')
  })

  it('压缩去除空白', () => {
    expect(minify(' { "a" : [ 1, 2 ] , "b" : "x y" } ')).toBe('{"a":[1,2],"b":"x y"}')
  })

  it('保留字符串内容与数值精度语义', () => {
    expect(minify('{"n":1.5e3,"s":"a\\tb"}')).toBe('{"n":1500,"s":"a\\tb"}')
  })
})

describe('validate / parse 错误定位', () => {
  it('合法 JSON 通过校验', () => {
    expect(validate('{"a":[1,2,{"b":null}]}')).toEqual({ valid: true, error: null })
  })

  it('尾随逗号定位到出错行列', () => {
    const result = validate('{\n  "a": 1,\n}')
    expect(result.valid).toBe(false)
    if (!result.valid && result.error) {
      expect(result.error.line).toBe(3)
      expect(result.error.column).toBe(1)
      expect(result.error.message).toBe('对象键必须是字符串')
    }
  })

  it('缺少冒号', () => {
    const result = validate('{"a" 1}')
    expect(result.valid).toBe(false)
    if (!result.valid && result.error) {
      expect(result.error.position).toBe(5)
      expect(result.error.message).toBe("应为 ':'")
    }
  })

  it('数组元素间缺逗号', () => {
    const result = validate('[1 2]')
    expect(result.valid).toBe(false)
    if (!result.valid && result.error) {
      expect(result.error.message).toBe("应为 ',' 或 ']'")
    }
  })

  it('字符串未闭合', () => {
    const result = validate('{"a":"abc')
    expect(result.valid).toBe(false)
    if (!result.valid && result.error) {
      expect(result.error.message).toBe('字符串未闭合')
    }
  })

  it('非法转义字符', () => {
    const result = validate('{"a":"x\\qy"}')
    expect(result.valid).toBe(false)
    if (!result.valid && result.error) {
      expect(result.error.message).toBe("无效的转义字符 '\\q'")
    }
  })

  it('未转义控制字符', () => {
    const result = validate('{"a":"b\tc"}')
    expect(result.valid).toBe(false)
    if (!result.valid && result.error) {
      expect(result.error.message).toBe('字符串中存在未转义的控制字符')
    }
  })

  it('非法数字（前导零）', () => {
    expect(validate('[01]').valid).toBe(false)
  })

  it('非法字面量', () => {
    const result = validate('nul')
    expect(result.valid).toBe(false)
    if (!result.valid && result.error) {
      expect(result.error.message).toBe("无效的字面量，应为 'null'")
    }
  })

  it('JSON 结束后多余内容', () => {
    const result = validate('{} x')
    expect(result.valid).toBe(false)
    if (!result.valid && result.error) {
      expect(result.error.position).toBe(3)
    }
  })

  it('空输入不合法', () => {
    expect(validate('').valid).toBe(false)
    expect(validate('   ').valid).toBe(false)
  })

  it('重复键与 JSON.parse 语义一致（后者覆盖）', () => {
    const result = parse('{"a":1,"a":2}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(JSON.stringify(result.value)).toBe('{"a":2}')
    }
  })
})

describe('sortKeys', () => {
  it('深度排序对象键', () => {
    expect(sortKeys('{"b":1,"a":{"d":2,"c":3}}')).toBe('{\n  "a": {\n    "c": 3,\n    "d": 2\n  },\n  "b": 1\n}')
  })

  it('数组内对象同样排序', () => {
    expect(sortKeys('[{"z":1,"a":2}]')).toBe('[\n  {\n    "a": 2,\n    "z": 1\n  }\n]')
  })
})

describe('escapeUnicode / unescapeUnicode', () => {
  it('非 ASCII 字符转为 \\uXXXX', () => {
    expect(escapeUnicode('{"名":"值"}')).toBe('{\n  "\\u540d": "\\u503c"\n}')
  })

  it('BMP 外字符按代理对转义', () => {
    expect(escapeUnicode('"𝄞"', 2)).toBe('"\\ud834\\udd1e"')
  })

  it('反转义输出真实字符', () => {
    expect(unescapeUnicode('{"\\u540d":"\\u503c"}')).toBe('{\n  "名": "值"\n}')
  })
})

describe('工具函数', () => {
  it('byteSize 按 UTF-8 计字节数', () => {
    expect(byteSize('abc')).toBe(3)
    expect(byteSize('中文')).toBe(6)
    expect(byteSize('𝄞')).toBe(4)
  })

  it('lineColumnAt 计算行列', () => {
    expect(lineColumnAt('ab\ncd', 0)).toEqual({ line: 1, column: 1 })
    expect(lineColumnAt('ab\ncd', 3)).toEqual({ line: 2, column: 1 })
    expect(lineColumnAt('ab\r\ncd', 4)).toEqual({ line: 2, column: 1 })
  })
})
