import { setBaseUrl } from "@workspace/api-client-react";

export function initApiClient() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || "";
  setBaseUrl(baseUrl);
}
