const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag while rendering')) {
    return;
  }
  originalError(...args);
};