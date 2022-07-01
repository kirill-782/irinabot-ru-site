export const BASE_PATH = "https://api.irinabot.ru";

export interface ApiConfig {
  // Basic Auth
  username?: string;
  password?: string;

  bearerToken?: string;

  type?: "basic" | "bearer";

  basePath?: string;
}
