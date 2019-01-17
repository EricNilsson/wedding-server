import { createError } from 'apollo-errors';

export const CodeNotFoundError = createError('CodeNotFoundError', {
    message: 'Code not found'
});
