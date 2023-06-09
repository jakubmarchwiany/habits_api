export {};
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            NODE_ENV: "development" | "production";
            // Authentication configuration
            JWT_SECRET: string;
            TOKEN_EXPIRE_AFTER: string;
        }
    }
}
