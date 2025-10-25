/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_JSON_URL?: string;
  readonly VITE_FEEDBACK_FORM_URL?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
