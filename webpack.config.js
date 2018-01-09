const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack')

module.exports = {
	entry: './src/components/main.js',
	output:{
		path: path.resolve(__dirname, './dist'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: path.resolve(__dirname, './src'),
				use: [
					{
						loader: 'babel-loader',
						query: {
							presets: ['react', 'env']
						}
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader'
				]
			},
			{
				test: /\.less$/,
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader',
					'less-loader'
				]
			},
			{
				test: /\.(png|jpg)$/,
				use: 'url-loader?limit=8192&name=images/[name].[ext]'
			},
			{
				test: /\.json$/,
				use: 'json-loader'
			}
		]
	},
	plugins: [
		new htmlWebpackPlugin({
			title: 'Resume by React',
			filename: 'index.html',
			template: './src/index.html',
			inject: 'body'
		})
	],
	devServer: {
		contentBase: './dist',
		port: 8000
	}
}