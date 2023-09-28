
export interface ReplStoreParam {
  serializedState?: string
  versions?: VersionRecord
}

export type VersionKey = 'Vue' | 'Vant'
export type VersionRecord = Record<VersionKey, string>

export type PendingCompiler = Promise<typeof import('vue/compiler-sfc')> | null
