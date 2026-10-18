import ToolPageShell from '../../components/ToolPageShell'

import CurrentTimeSection from './sections/CurrentTimeSection'
import DurationSection from './sections/DurationSection'
import FormatParseSection from './sections/FormatParseSection'
import TimestampSection from './sections/TimestampSection'
import TimeZoneSection from './sections/TimeZoneSection'

export default function DatetimePage() {
  return (
    <ToolPageShell
      category="datetime"
      title="日期时间"
      description="时间获取、时间戳转换、时区转换、格式化解析与时间差计算。"
    >
      <CurrentTimeSection />
      <TimestampSection />
      <TimeZoneSection />
      <FormatParseSection />
      <DurationSection />
    </ToolPageShell>
  )
}
