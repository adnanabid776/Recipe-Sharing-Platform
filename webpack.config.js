// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development', // or 'production' or 'none'
  entry: './js-files/index.js', // Assuming your main JS entry point is index.js in js-files
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // If you're using Babel for ES6+ support
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // For handling CSS imports in JS
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource', // For handling image imports
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource', // For handling font imports
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Assuming your main HTML file is at the root
      filename: 'index.html',
    }),
    // Add other plugins here if needed
  ],
  resolve: {
    extensions: ['.js'], // Allows importing .js files without specifying the extension
  },
  devServer: {
    static: './dist',
    port: 8080,
    open: true,
  },
};