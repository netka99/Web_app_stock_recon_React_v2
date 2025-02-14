/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_APP_SETTINGS_API: string;
    VITE_APP_SALES_API:string;
   VITE_APP_RETURNS_API:string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  } 