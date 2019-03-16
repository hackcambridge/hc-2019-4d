import * as path from 'path';
import { Configuration } from 'webpack';
import * as dotenv from 'dotenv';

dotenv.load();

export const webpackConfig: Configuration = {
  mode: process.env.NODE_ENV,
  watch: true,
  output: {
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        }
      }
    ]
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    extensions: ['.ts', '.js', '.json']
  },
  devtool: 'inline-source-map'
}
