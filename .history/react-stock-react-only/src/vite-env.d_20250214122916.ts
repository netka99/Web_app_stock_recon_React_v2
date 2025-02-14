/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_APP_SETTINGS_API: string;
    VITE_APP_SALES_API=http:string;
VITE_APP_RETURNS_API=http:string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }