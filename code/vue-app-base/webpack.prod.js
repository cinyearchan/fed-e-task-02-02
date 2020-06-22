const common = require('./webpack.common')
const merge = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/favicon.ico'
        }
      ]
    })
  ]
})