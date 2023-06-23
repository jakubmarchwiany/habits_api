export {};
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // environment
            NODE_ENV: "development" | "production";

            // server running port
            PORT: string;

            // cors options
            WHITELISTED_DOMAINS: string;

            // authentication configuration
            JWT_SECRET: string;
            TOKEN_EXPIRE_AFTER: string;

            // database configuration
            MONGO_URL: string;
        }
    }
}
