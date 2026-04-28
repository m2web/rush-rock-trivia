/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_OPENAI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}