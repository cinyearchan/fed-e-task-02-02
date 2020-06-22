const common = require('./webpack.common')
const merge = require('webpack-merge')
const path = require('path')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    hot: true,
    contentBase: path.join(__dirname, 'public'),
    // compress: true,
    port: 9000
  }
})