import { isAxiosError } from 'axios';

export function toReadableError(
  error: unknown,
  statusMessages?: Record<number, string>,
): Error {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status && statusMessages?.[status]) {
      return new Error(statusMessages[status]);
    }
    const apiMessage = (
      error.response?.data as { message?: string | string[] } | undefined
    )?.message;
    if (apiMessage) {
      return new Error(
        Array.isArray(apiMessage) ? apiMessage.join('\n') : apiMessage,
      );
    }
    if (!error.response) {
      return new Error(
        'Impossible de joindre le serveur. Vérifiez votre connexion.',
      );
    }
  }
  return new Error('Une erreur est survenue');
}
