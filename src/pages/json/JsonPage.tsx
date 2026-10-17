import ToolPageShell from '../../components/ToolPageShell'

const plannedTools = ['格式化', '压缩', '校验']

export default function JsonPage() {
  return (
    <ToolPageShell title="JSON 处理" description="JSON 数据的格式化、压缩与语法校验。">
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
