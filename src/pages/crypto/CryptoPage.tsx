import ToolPageShell from '../../components/ToolPageShell'

const plannedTools = ['密码生成', 'SSH 密钥对生成', '常见加密', '常见 Hash 算法']

export default function CryptoPage() {
  return (
    <ToolPageShell title="安全工具" description="密码生成、SSH 密钥对、加密与 Hash 计算。">
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
