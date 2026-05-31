import { setBaseUrl } from "@workspace/api-client-react";

export function initApiClient() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const baseUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    (domain ? `https://${domain}/api` : "/api");
  setBaseUrl(baseUrl);
}
