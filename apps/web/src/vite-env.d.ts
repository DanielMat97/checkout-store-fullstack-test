/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_MODE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BASE_FEE?: string;
  readonly VITE_DELIVERY_FEE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
