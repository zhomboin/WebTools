export interface SshKeyPairResult {
  publicKey: string
  privateKey: string
  fingerprint: string
}

// 种子经 crypto.getRandomValues 生成（CSPRNG）；ed25519-keygen 按需动态加载，不进主包。
// 注：ed25519-keygen 已并入 micro-key-producer，主入口在 0.6.2 加入导入即抛错的迁移提示，
// 此处使用其仍可用的 /ssh 子路径（基于 @noble/curves）。
export async function generateEd25519KeyPair(comment = ''): Promise<SshKeyPairResult> {
  const seed = crypto.getRandomValues(new Uint8Array(32))
  return ed25519KeysFromSeed(seed, comment)
}

export async function ed25519KeysFromSeed(
  seed: Uint8Array,
  comment = '',
): Promise<SshKeyPairResult> {
  if (seed.length !== 32) {
    throw new Error('Ed25519 种子必须是 32 字节')
  }
  const { getKeys } = await import('ed25519-keygen/ssh')
  const keys = getKeys(seed, comment.trim() === '' ? undefined : comment.trim())
  return {
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    fingerprint: keys.fingerprint,
  }
}
