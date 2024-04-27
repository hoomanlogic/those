var path = require('path');

module.exports = {
  mode: 'none',
  entry: './test/test.js',
  output: {
      path: path.resolve(__dirname, 'test/'),
      filename: 'exec_test.js'
  },
  module: {
    rules: [
        {
            test: /\.js$/,
            // exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }
    ]
  }
};