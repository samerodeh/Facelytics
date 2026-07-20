import axios from 'axios';

/**
 * Extract a human-readable message from an unknown error thrown by an API call.
 * Prefers FastAPI's `{ detail }` payload, then the Axios/Error message.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    return detail || error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}
