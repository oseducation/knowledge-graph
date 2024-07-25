/* eslint-disable no-undef */

const HtmlWebPackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const path = require('path');
var mode = process.env.NODE_ENV || 'development';

module.exports = {
  devtool: (mode === 'development') ? 'inline-source-map' : false,
  entry: './src/index.tsx',
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  devServer: {
    historyApiFallback: true,
    port: 9091,
    proxy: {
      '/api': {
        target: process.env.KG_SERVER_URL_DOCKER ?? 'http://localhost:9081',
        xfwd: true,
      },
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.(css|scss)$/,
        use: [
          'style-loader',
          'css-loader'
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      filename: 'index.html'
    })
  ]
};
