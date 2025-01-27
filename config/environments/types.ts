export interface Config {
  env: string;
  server: {
    port: number;
    host: string;
  };
  database: {
    uri: string;
    name: string;
  };
  mongodb: {
    uri: string;
    dbName: string;
    options: Record<string, unknown>;
  };
  auth: {
    nextAuthUrl: string;
    nextAuthSecret: string;
    jwtSecret: string;
  };
  storage: {
    uploadDir: string;
    maxFileSize: number;
    allowedFormats: string[];
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  logging: {
    level: string;
    saveToFile: boolean;
  };
  cleanup: {
    afterEach: boolean;
    afterAll: boolean;
  };
  defaultTimeout: number;
} 