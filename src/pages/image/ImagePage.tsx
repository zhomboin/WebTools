import ToolPageShell from '../../components/ToolPageShell'

const plannedTools = ['压缩', '格式转换']

export default function ImagePage() {
  return (
    <ToolPageShell title="图片处理" description="图片的本地压缩与格式转换。">
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
