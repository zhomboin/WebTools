import ToolPageShell from '../../components/ToolPageShell'

const plannedTools = ['时间获取', '日期格式化', '日期转换', '时区转换']

export default function DatetimePage() {
  return (
    <ToolPageShell title="日期时间" description="时间获取、格式化、转换与时区转换。">
      <div className="tool-placeholder">
        <p>该类工具正在建设中，计划提供：</p>
        <ul>
          {plannedTools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>
    </ToolPageShell>
  )
}
