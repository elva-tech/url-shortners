const DEFAULT_DLT_HEADER = 'ELVATK';
const DLT_HEADER_PATTERN = /^[A-Z]{6}$/;

const validateDltHeader = (input) => {
  if (input === undefined || input === null || input === '') {
    return { valid: false, error: 'DLT header is required when DLT mode is enabled' };
  }

  if (typeof input !== 'string') {
    return { valid: false, error: 'DLT header must be a string' };
  }

  const normalized = input.trim().toUpperCase();

  if (!DLT_HEADER_PATTERN.test(normalized)) {
    return {
      valid: false,
      error: 'DLT header must be exactly 6 letters (A–Z only)',
    };
  }

  const reserved = new Set(['CREATE']);
  if (reserved.has(normalized)) {
    return { valid: false, error: 'DLT header is reserved' };
  }

  return { valid: true, normalized };
};

module.exports = {
  DEFAULT_DLT_HEADER,
  DLT_HEADER_PATTERN,
  validateDltHeader,
};
