const path = require('path');

module.exports = {
  entry: './src/index.js',  // Path to your main JS file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')  // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),  // Public directory for HTML, etc.
    },
    compress: true,
    port: 8080,
  },
};