const path = require('path');

module.exports = {
  entry: {
    main: './src/index.js',  // Your main app logic
    auth: './auth.js',   // Your authentication logic
  },
  output: {
    filename: '[name].bundle.js',  // Generates main.bundle.js and auth.bundle.js
    path: path.resolve(__dirname, 'dist'),  // Output directory
  },
  mode: 'development',  // Change to 'production' for final deployment
  watch: true // Always npm run build
};
