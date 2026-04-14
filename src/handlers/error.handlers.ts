import type { HandleResult, ServerMessage } from '../types';

export const createErrorMessage = (errorMessage: string): ServerMessage => {
  return {
    type: 'ERROR',
    payload: { error: errorMessage },
  };
};

export const createErrorResponse = (errorMessage: string): HandleResult => {
  return {
    broadcast: [],
    personal: [createErrorMessage(errorMessage)],
  };
};
