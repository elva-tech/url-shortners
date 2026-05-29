const formatMessage = (level, tag, message) => {
  return `[${new Date().toISOString()}] [${level}] [${tag}] ${message}`;
};

const logger = {
  request: (message) => {
    console.log(formatMessage('INFO', 'REQUEST', message));
  },
  redirect: (message) => {
    console.log(formatMessage('INFO', 'REDIRECT', message));
  },
  duplicate: (message) => {
    console.log(formatMessage('INFO', 'DUPLICATE', message));
  },
  create: (message) => {
    console.log(formatMessage('INFO', 'CREATE', message));
  },
  error: (message) => {
    console.error(formatMessage('ERROR', 'SERVER', message));
  },
};

module.exports = logger;
