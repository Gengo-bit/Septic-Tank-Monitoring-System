const path = require('path');

module.exports = {
  entry: './src/index.js',  // Main JavaScript file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',  // Change to 'production' for deployment
};
