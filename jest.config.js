module.exports = {
    testEnvironment: 'node', // For testing Node.js environment
    transform: {
      '^.+\\.js$': 'babel-jest', // If you're using Babel for ES6+ support
    },
    setupFiles: ['dotenv/config'], // If you're using environment variables
  };
  