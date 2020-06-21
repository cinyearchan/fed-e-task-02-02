### Webpack 打包

---



#### 背景

- ESM 存在环境兼容问题
- 模块文件过多，网络请求频繁
- 所有的前端资源都需要模块化

需求：

- 新特性代码编译
- 模块化 JavaScript 打包
- 支持不同类型的资源模块



#### 概要

模块打包器（Module bundler）

模块加载器（Loader）

代码拆分（Code Splitting）

资源模块（Asset Module）

> 打包工具解决的是前端整体的模块化，并不单指 JavaScript 模块化



#### 快速上手

```shell
# 安装
yarn add webpack webpack-cli --dev

# 使用
yarn webpack

```

package.json 中配置打包命令

```json
{
  "script": {
    "build": "webpack"
  }
}
```



#### Webpack 配置文件

4.0 以后的版本支持零配置的方式打包，按约定，`src/index.js` -> `dist/main.js`

##### 自定义配置 webpack.config.js

```js
const path = require('path')

module.exports = {
  entry: './src/main.js' // 入口文件 // 如果是相对路径，. / 不能省略
	output: {
    filename: 'bundle.js' // 输出文件名
    path: path.join(__dirname, 'output') // 输出文件路径
  }
}
```



##### Webpack 工作模式

默认以 production 模式进行打包

```shell
# 命令行中自定义工作模式
yarn webpack --mode development # 开发模式，打包后的文件会添加调试需要的内容
yarn webpack --mode none # 原始模式

```

配置文件中定义工作模式

```js
// webpack.config.js

module.exports = {
  mode: 'development'
}

```



##### 打包结果运行原理

先以 none 模式进行打包

```shell
yarn webpack --mode none
```



```js
// 打包后文件 大致结构
(function(modules) {
  // 工作入口函数
  
  // module cache 模块缓存
  var installedModules = [];
  
  // require funciton 用于加载模块
  function __webpack_require__(moduleId) {}
  
  // 在 require 函数上挂载数据和函数
  _webpack_require__.m = modules
  _webpack_require__.c = installedModules
  _webpack_require__.d = function () {}
  // ...
  
  // 最后，调用内部自定义 require 函数，加载入口模块
  // 参数中的数字，其实是模块数组中模块元素的下标
  return __webpack_require__(__webpack_require__.s = 0)
})([
  (function(module, __webpack_exports__, __webpack_require__){
    // 模块内容
  }),
  (function(module, __webpack_exports__, __webpack_require__){
    // 模块内容
  })
])

```



##### 资源模块加载

Webpack 默认只能处理 js 的打包，处理其他资源文件的打包需要配合 loader 使用

###### 以样式文件为例

```shell
# 安装 css-loader
yarn add css-loader --dev

# style-loader 将 (css -> js 转换成 js 模块的 css 文件)通过 style 标签在 JS 中挂载到页面中
yarn add style-loader --dev

```

配置文件

```js
// webpack.config.js
module.exports = {
  mode: 'none',
  entry: './src/main.css',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [ // css-loader 的作用只是将 css -> js 模块，但最终并没有加载到页面里，需要配合 style-loader 使用
      {
        test: /.css$/,
        use: [
          'style-loader', // use 顺序为从右往左
          'css-loader'
        ]
      }
    ]
  }
}
```

> Loader 是 Webpack 的核心特性，借助 Loader 可以加载任何类型的资源



##### 导入资源模块

- 打包入口从某种程度上说就是运行入口
- JavaScript 驱动整个前端应用的业务

- Webpack -- Entry --> main.js -- import --> (CSS、CSS)

```js
// src/main.js 文件
import 'main.css'


```



```js
// webpack.config.js
module.exports = {
  mode: 'none',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
}
```





> Webpack 建议根据代码的需要动态导入资源，需要资源的不是应用，而是代码
>
> - JS 驱动前端业务
> - 逻辑合理，JS 确实需要这些资源文件
> - 确保上线资源不缺失，都是必要的



##### 文件资源加载器

图片、字体等文件不便转换为 js，在 webpack 中配合文件资源加载器使用（基本上算是拷贝物理文件，更新相关路径）

```shell
# 安装 file-loader
yarn add file-loader --dev

```

```js
// webpack.config.js
{
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: 'dist/' // 指定打包后文件公共路径，注意，路径最后的 / 不能省略
  },
  module: {
    rules: [
      {
        test: /.png$/,
        use: 'file-loader'
      }
    ]
  }
}

```



##### URL 加载器

Data URLs 表示文件内容

`data:[<mediatype>][;base64],<data>` 即 “协议+（媒体类型和编码）+文件内容”，不会发送 http 请求去获取文件内容，可以直接解析出文件内容

例如：

`data:text/html;charset=UTF-8,<h1>html content</h1>` 解析出来是一段 包含 `<h1>html content</h1>` 的 html 代码

而图片、字体等无法直接用文本表示的二进制文件，则会通过 base64 进行编码转换为字符串

`data:image/png;base64,ivSSDFADFADSFADSFAFSADF`

webpack 打包静态资源文件时，便可通过这种方式进行处理

```shell
# url-loader
yarn add url-loader --dev

```

```js
// webpack.config.js
{
  module: {
    rules: [
      {
        test: /.png$/,
        use: 'url-loader'
      }
    ]
  }
}

```

最佳实践：

- 小文件使用 Data URLs，减少请求次数
- 大文件单独提取存放，提高加载速度

```js
// webpack.config.js
{
  module: {
    rules: [
      {
        test: /.png$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024 // 10 KB
          }
        }
      }
    ]
  }
}
```

- 超出 10KB 文件单独提取存放
- 小于 10 KB 文件转换为 Data URLs 嵌入代码中

> 如此一来，url-loader 需要与 file-loader 同时安装，文件超出 10KB 后，还是会调用 file-loader 进行处理



##### 常用加载器分类

- 编译转换类 css-loader ——将 css 代码转换为 bundle 中以 js 形式工作的 css 模块
- 文件操作类 file-loader ——将加载的资源文件拷贝到输出目录，并向外导出文件访问路径
- 代码检查类 eslint-loader ——只对代码进行校验（通过、不通过），不对代码做修改



##### 处理 ES2015

因为模块打包需要，所以处理 import 和 export，但对于其他 ES6 新特性，webpack 同样需要借助插件才能转换

```shell
# 安装相关插件及依赖
yarn add babel-loader @babel/core @babel/preset-env --dev

```

```js
// webpack.config.js
{
  module: {
    rules: [
      {
        test: /.js$/, // 在处理 js 文件时，便会用 babel-loader 取代默认加载器进行处理
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}

```

- Webpack 只是打包工具
- 加载器可以用来编译转换代码



##### 模块加载方式

- 遵循 ESM 标准的 import 声明
- 遵循 CommonJS 标准的 require 函数，注意默认导出的方式`const createHeading = require('./heading.js').default`
- 遵循 AMD 标准的 define 函数和 require 函数

另外，Loader 加载的非 JavaScript 也会触发资源加载，例如

- 样式代码中的 `@import` 指令和 `url` 函数

- html 代码中图片标签的 `src` 属性

对上述加载方式，使用相应插件进行处理

```shell
# 安装 html-loader
yarn add html-loader --dev

```

```js
// webpack.config.js
{
  module: {
    rules: [
      {
        test: /.html$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: ['img:src', 'a:href']
          }
        }
      }
    ]
  }
}

```



#### Webpack 核心工作原理

代码及资源文件散落在项目各处

1. Webpack 根据配置，找到入口文件
2. 以入口文件作为打包入口，根据出现的 import、require 等语句，解析推断出依赖的资源文件，再分别解析每个资源模块对应的依赖，最终形成整个项目文件之间依赖关系的依赖树
3. 遍历、递归依赖树，找到每个节点对应的资源文件
4. 根据配置文件的 rules 属性，找到对应模块的加载器，使用加载器加载相应的模块
5. 加载到的结果会被并入 bundle.js，从而实现整个项目的打包

> Loader 机制是 Webpack 的核心





#### 开发一个 Loader

##### Loader 的工作原理

Source ---> Loader1 ----> Loader2 -----> Loader3 ------>  Result(JavaScript 代码)

所以要求 Loader 返回的结果必须是 JavaScript 代码，返回的结果会被并入 bundle.js，如果结果不是 JS 代码，可能会导致 bundle.js 无法运行

- 方式一：自定义 markdown-loader 返回的结果交由 marked 加载器进行二次处理

about.md 文件

```markdown
# hello

world
```

main.js 

```js
import html from ‘./about.md’

console.log(about)

```

webpack.config.js

```js
{
  module: {
    rules: [
      {
        test: /.md$/,
        use: [
          './markdown-loader' // 自定义 markdown 文件加载器
        ]
      }
    ]
  }
}
```

借助第三方 markdown 加载器，将 markdown 内容转换为 js

```shell
yarn add marked --dev
```



markdown-loader.js

```js
const marked = require('marked')

module.exports = source => {
  const html = marked(source)
  
  // return `module.exports = ${JSON.stringify(html)}` // 处理换行、斜线
  // 或者
  return `export default ${JSON.stringify(html)}`
}
```

- 方式二：自定义 markdown-loader 返回 html 字符串交由 html-loader 处理

```shell
yarn add html-loader --dev
```

webpack.config.js

```js
{
  module: {
    rules: [
      {
        test: /.md$/,
        use: [
          'html-loader',
          './markdown-loader'
        ]
      }
    ]
  }
}
```

自定义 markdown-loader.js

```js
module.exports = source => {
  const html = marked(source)
  // 返回 html 字符串交由下一个 Loader 即 html-loader 处理
  return html
}
```

> 原理：Loader 负责资源文件从输入到输出的转换
>
> 对于同一个资源可以依次使用多个 Loader



---



#### 插件机制介绍

Loader 专注实现资源模块加载

Plugin 解决其他自动化工作

- 清除 dist 目录
- 拷贝静态文件至输出目录
- 压缩输出代码



##### 常用插件

- 自动清理输出目录的插件

```shell
yarn add clean-webpack-plugin --dev
```

```js
// webpack.config.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  plugins: [
    new CleanWebpackPlugin()
  ]
}
```



- 自动生成 html 插件

自动生成使用打包结果 bundle.js 的 html

```shell
yarn add html-webpack-plugin --dev
```

```js
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
    // publicPath: 'dist/' // 此时需要移除 publicPath，不然自动生成的 dist/index.html 中还是会引用 dist/bundle.js 而不是 bundle.js
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
}
```

此时运行 yarn webpack 会自动生成一个 index.html，且该文件会引用 bundle.js

此时也不再完全依赖根目录下的 index.html 了

###### 自定义 index.html 高级配置

```js
// webpack.config.js 中 plugins
new HtmlWebpackPlugin({
  title: 'title',
  meta: {
    viewport: 'width=device-width'
  }
})
```

或者指定模板

src/index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Webpack</title>
  </head>
  <body>
    <div class="container">
      <h1>
        <%= htmlWebpackPlugin.options.title%>
      </h1>
    </div>
  </body>
</html>
```

```js
// webpack.config.js

{
  plugins: [
    new HtmlWebpackPlugin({
      title: 'title',
      meta: {
        viewport: 'width=device-width'
      },
      template: './src/index.html'
    })
  ]
}
```

同时输出多个 html

```js
// webpack.config.js
{
  plugins: [
    // 用于生成 index.html
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin Sample',
      meta: {
        viewport: 'width=device-width'
      },
      template: './src/index.html'
    }),
    // 用于生成 about.html
    new HtmlWebpackPlugin({
      filename: 'about.html'
    })
  ]
}
```



- 静态文件拷贝插件

```shell
yarn add copy-webpack-plugin --dev
```

```js
// webpack.config.js
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  plugins: [
    new CopyWebpackPlugin([
      // 'public/**' // 文件夹或者通配符
      'public'
    ])
  ]
}
```



##### 插件机制的工作原理

通过 Webpack 钩子机制实现，要求必须是一个函数或者是一个包含 apply 方法的对象

自定义一个移除 bundle.js 每一行开头注释的插件

```js
// webpack.config.js

class MyPlugin {
  apply (compiler) {
    console.log('MyPlugin 启动')
    
    compiler.hooks.emit.tap('MyPlugin', compilation => {
      // compilation => 可以理解为此次打包的上下文
      for (const name in compilation.assets) {
        // console.log(name) // 处理的文件的文件名
        // console.log(compilation.assets[name].source()) // 文件内容
        if (name.endsWith('.js')) {
          const contents = compilation.assets[name].source()
          const withoutComments = contents.replace(/\/\*\*+\*\//g, '')
          compilation.assets[name] = {
            source: () => withoutComments,
            size: () => withoutComments.length
          }
        }
      }
    })
  }
}

module.exports = {
  plugins: [
    new MyPlugin()
  ]
}
```



> 通过在声明周期的钩子中挂载函数实现扩展



---



#### 思考：可改进之处以提高开发体验

- 以 HTTP Server 运行
- 自动编译 + 自动刷新
- 提供 Source Map 支持



---



#### Webpack 自动编译

watch 工作模式，监听文件变化，自动重新打包

```shell
yarn webpack --watch
```



#### Webpack 自动刷新浏览器

- browser-sync

```shell
browser-sync dist --files "**/*"
```

缺点——操作繁琐



#### Webpack Dev Server

集成 自动编译 + 自动刷新 等功能

```shell
yarn add webpack-dev-server --dev

yarn webpack-dev-server

# 打包结果并未写入磁盘，而是暂存在内存中

yarn webpack-dev-server --open # 打包完成后自动打开浏览器
```



##### 静态资源访问

> Dev Server 默认只会 serve 打包输出文件，只要是 Webpack 输出的文件，都可以直接被访问，但是，其他静态资源文件也需要 serve 呢？

之所以要设置这一步，而不是采用 copy-webpack-plugin，是因为，静态资源的拷贝如果在开发阶段频繁操作，影响开发体验，通常会在上线前执行拷贝操作，因此，开发阶段仅需提供静态资源文件的访问即可

```js
// webpack.config.js

module.exports = {
  devServer: {
    
    contentBase: './public' // 额外的静态资源路径 字符串或数组
  }
}
```

> contentBase 额外为开发服务器指定查找资源目录



##### 代理 API

开发阶段处理跨域问题，除了服务器支持 CORS，还可以通过配置代理来解决

```js
// webpack.config.js

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        // http://localhost:8080/api/users -> https://api.github.com/api/users
        target: 'https://api.github.com',
        // http://localhost:8080/api/users -> https://api.github.com/users
        pathRewrite: {
          '^/api': ''
        },
        // 不能使用 localhost:8080 作为请求 GitHub 的主机名
        changeOrigin: true
      }
    }
  }
}
```



#### Source Map

> 运行代码与开发代码完全不同，如果需要调试应用，错误信息无法定位，调试和报错都是基于运行代码

source map 用于映射运行代码与开发代码之间的关系

```js
{
  "version": 3, // source map 标准的版本
  "sources": ["记录转换之前源文件的名称"], // 可能是多个文件合并转换的，所以是数组
  "names": ["源代码中使用的成员名称"], // 原始对应名称，转换后会被其他字符代替
  "mappings": "base64-vlq编码字符串，转换后的字符与转换前的映射关系"
}
```

以 jquery.min.js 为例

```js
// 最末尾引入 source map 文件
//# sourceMappingURL=jquery-3.4.1.min.map

```

Source Map 解决了源代码与运行代码不一致所产生的问题



##### Webpack 配置 Source Map

快速开启

```js
// webpack.config.js
module.exports = {
  devtool: 'source-map'
}

```

Webpack 支持 12 种不同的方式，每种方式的效率和效果各不相同

- build 初次打包速度
- rebuild 监视模式下打包速度
- production 是否适合生产模式打包
- quality 打包后的代码质量——调试报错支持程度

| devtool                        | build   | rebuild | production | quality                      |
| ------------------------------ | ------- | ------- | ---------- | ---------------------------- |
| (none)                         | fastest | fastest | yes        | bundled code                 |
| eval                           | fastest | fastest | no         | generated code               |
| cheap-eval-source-map          | fast    | faster  | no         | transformed code(lines only) |
| cheap-module-eval-source-map   | slow    | faster  | no         | original source(lines only)  |
| eval-source-map                | slowest | fast    | no         | original source              |
| cheap-source-map               | fast    | slow    | yes        | transformed code(lines only) |
| cheap-module-source-map        | slow    | slower  | yes        | original source(lines only)  |
| inline-cheap-source-map        | fast    | slow    | no         | transformed code(lines only) |
| inline-cheap-module-source-map | slow    | slower  | no         | original source(lines only)  |
| source-map                     | slowest | slowest | yes        | original source              |
| inline-source-map              | slowest | slowest | no         | original source              |
| Hidden-source-map              | slowest | slowest | yes        | original source              |
| nosources-source-map           | slowest | slowest | yes        | without source content       |



###### Source Map 模式对比

生成模式对比文件

```js
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')

const allModes = [
  'eval',
  'cheap-eval-source-map',
  'cheap-module-eval-source-map',
  'eval-source-map',
  'cheap-source-map',
  'cheap-module-source-map',
  'inline-cheap-source-map',
  'inline-cheap-module-source-map',
  'source-map',
  'inline-source-map',
  'hidden-source-map',
  'nosources-source-map'
]

module.exports = allModes.map(item => {
  return {
    devtool: item,
    mode: 'none',
    entry: './src/main.js',
    output: {
      filename: `js/${item}.js`
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          options: {
            presets: ['@babel/preset-env']
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: `${item}.html`
      })
    ]
  }
})
```



- eval 模式

```js
// eval 模式就是将 js 模块代码放入 eval 函数中执行
eval(`console.log(123)`)

eval(`console.log(123) //# sourceURL=./foo/bar.js`) // 手动指定 sourceURL

```

```js
// webpack.config.js
module.exports = {
  devtool: 'eval'
}

// 报错调试时，只能定位到文件，无法定位到具体的行列
// 不会生成具体的 source Map 文件，只是在 eval 内字符化的模块代码末尾添加了指向具体模块文件的链接

```

- eval-source-map

可以定位到行列

- cheap-eval-source-map

只能定位到行，显示的是 Loader 转换后的代码

- cheap-module-eval-source-map

只能定位到行，显示的是手写的、 Loader 转换前的源代码



> - eval ——是否使用 eval 执行模块代码
> - cheap —— Source Map 是否包含行信息
> - module —— 是否能够得到 Loader 处理之前的源代码



- inline-source-map

source map 文件不是形成单独的文件，而是以 dataURL 的形式嵌入到模块代码中

- hidden-source-map

生成了 source map 文件，但模块中并未引入，开发工具中看不到 source map

- nosources-source-map

提供行列信息，但在开发工具中看不到源代码，根据行列信息能够在原始代码中定位到错误，此模式能在生产模式下保护源代码



###### 选择 Source Map

- 开发 cheap-module-eval-source-map
  - 每行不超过 80 个字符
  - 代码经过 Loader 转换过后的差异较大
  - 首次打包速度慢无所谓，重写打包相对较快
- 生产 none
  - Source Map 会暴露源代码
  - 调试是开发阶段的工作，不应该在生产环境下调试
  - nosources-source-map 作为替代

> 模式的选择并无绝对，理解不同模式的差异，适配不同的环境



---



#### 自动刷新的问题

自动刷新时，页面上填写的内容、开发工具修改的内容都会因页面整体刷新而丢失

问题核心：自动刷新导致的页面状态丢失

目标：页面不刷新的前提下，模块也可以及时更新



---



#### HMR

模块热替换、模块热更新

应用运行过程中实时替换某个模块，应用运行状态不受影响

热替换只将修改的模块实时替换至应用中

HMR 集成在 webpack-dev-server 中，

- 运行 webpack-dev-server 时添加 hot 参数

  ```shell
  webpack-dev-server --dev
  ```

  

- 在配置文件中开启

  ```js
  // webpack.config.js
  
  const webpack = require('webpack')
  
  module.exports = {
    devServer: {
      hot: true
    },
    plugins: [
      new webpack.hotModuleReplacementPlugin()
    ]
  }
  
  ```

  ```shell
  # 直接启动 dev server
  yarn webpack-dev-server --open
  
  ```

  

##### 疑问

样式文件的修改实时替换，显示上是热更新，但 js 模块的修改还是会引发自动刷新，热更新不起作用

> webpack 中的 HMR 并不是开箱即用的，需要手动处理模块热替换逻辑
>
> - 样式文件的修改看起来热更新，实际上是 Loader 在处理逻辑中加入了热更新，在内部进行了判断
> - 脚本文件逻辑各不相同，并无通用的规律，无法做到统一、兼容所有的 HMR 处理逻辑，需要开发者自己编写处理逻辑
> - vue、react 等框架下的开发，每种文件都是有规律的，通过脚手架创建的项目内部因此都集成了 HMR 方案

因此，我们需要手动处理 JS 模块更新后的热更新



##### 使用 HMR API

```js
module.hot.accept('依赖模块的路径', () => {
  // 依赖模块更新的处理逻辑
})
```

- ###### 处理 JS 模块热替换

```js
module.hot.accept('依赖模块的路径', () => {
  // 依赖模块更新的处理逻辑
  
  // 注意 模块状态的保留与还原
})


// 示例
import createEditor from './editor'

const editor = createEditor()
document.body.appendChild(editor)

// ================= 以下用于处理 HMR，与业务代码无关

let lastEditor = editor
module.hot.accept('./editor', () => {
  const value = lastEditor.innerHTML
  document.body.removeChild(lastEditor)
  const newEditor = createEditor()
  newEditor.innerHTML = value
  document.body.appendChild(newEditor)
  lastEditor = newEditor
})

// js 代码逻辑各不相同，因此相应的 HMR 代码处理逻辑也各不相同
// 但基本原则是，HMR 处理前后，模块的状态需要保持一致

```

- ###### 处理图片模块热替换

```js
const img = new Image()
img.src = background
document.body.appendChild(img)

module.hot.accept('./better.png', () => {
  img.src = background
  // 没错，图片路径保持一致，资源更新后会变自动实现替换
})
```



##### HMR 注意事项

1. 处理 HMR 的代码报错会导致自动刷新，此时 HMR 代码中的错误信息不易发现

```js
// 推荐使用 hotOnly 模式

// webpack.config.js
module.exports = {
  devServer: {
    // hot: true
    hotOnly: true // 如果 HMR 代码报错，不会自动刷新，可以及时发现错误信息
  }
}

```

2. 没启动 HMR 的情况下，使用 HMR API

```js
// 添加判断逻辑，判断是否开启 HMR
if (module.hot) {
  module.hot.accept('./xxx', () => {
    // ....
  })
}
```

3. 代码当中多了一些与业务无关的代码

当关闭 HMR 、移除 HMR 插件，且代码中有对 HMR 的开启进行过判断时

HMR 的代码在打包过程中会被移除，这些与业务无关的代码最终也不会影响程序的正常运行

```js
// 关闭了 HMR，移除了 HMR 插件

// 打包前
if (module.hot) {
  module.hot.accept('./xxx', () => {
    // ...
  })
}

// 打包后
if (false) {}

```



---



#### 生产环境优化

生产环境和开发环境有很大的差异

生产环境注重运行效率；开发环境注重开发效率

mode （模式）字段用预设配置，区分不同环境

为不同的工作环境创建不同的配置



##### 不同环境下的配置

1. 配置文件根据环境不同导出不同配置——适合中小型项目

```js
// webpack.config.js
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = (env, argv) => {
  const config = {
    mode: 'development',
    entry: './src/main.js',
    output: {
      filename: 'js/bundle.js'
    },
    devtool: 'cheap-eval-module-source-map',
    devServer: {
      hot: true,
      contentBase: 'public'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          use: {
            loader: 'file-loader',
            options: {
              outputPath: 'img',
              name: '[name].[ext]'
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'webpack tutorial',
        template: './src/index.html'
      }),
      new webpack.HotModuleReplacementPlugin()
    ]
  }
  
  if (env === 'production') {
    config.mode = 'production'
    config.devtool = false
    config.plugins = [
      ...config.plugins,
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin(['public'])
    ]
  }
  
  return config
}
```

```shell
# 以开发模式运行
yarn webpack

# 以生产模式运行
yarn webpack --env production
```



2. 一个环境对应一个配置文件——适合大型项目

- webpack.common.js 基础、通用配置
- webpack.dev.js 开发配置
- webpack.prod.js 生产配置

```js
// webpack.common.js

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
	entry: './src/main.js',
  output: {
    filename: 'js/bundle.js'
  },
  devtool: 'cheap-eval-module-source-map',
  devServer: {
    hot: true,
    contentBase: 'public'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'img',
            name: '[name].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'webpack tutorial',
      template: './src/index.html'
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
}
```

```js
// webpack.dev.js

// 开发相关配置
```

```js
// webpack.prod.js

const common = require('./webpack.common')
const merge = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common, { // 不能用 Object.assign()，应该用 _.merge 或者 webpack-merge
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin(['public'])
  ]
})
```

使用时，由于没有 webpack 默认配置文件，启动时需要手动指定配置文件

```shell
yarn webpack --config webpack.prod.js
```

或者将命令及参数集成到 package.json 文件中

```json
{
  "script": {
    "build": "webpack --config webpack.prod.js"
  }
}
```



---

#### Webpack 4 优化配置



##### DefinePlugin

Webpack 内置插件，为代码注入全局成员

在 production 模式下，该插件会默认启用，并向全局注入 process.env.NODE_ENV

```js
// webpack.config.js
const webpack = require('webpack')

module.exports = {
  mode: 'none',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      // API_BASE_URL: 'https://api.example.com' // 如果别处引用该值 console.log(API_BASE_URL) ==> console.log(https://api.example.com)
      // 原因在于该值应该是一个符合要求的 JS 代码片段
      API_BASE_URL: '"https://api.example.com"' // 或者 JSON.stringify('https://api.example.com')
    })
  ]
}
```



##### Tree-shaking

"摇掉"代码中未引用部分——未引用代码（dead-code）

生产模式下会自动开启，打包过程中，会自动优化去除未引用的代码

> Tree-shaking 不是指某个配置选项，而是一组功能搭配使用后的优化效果
>
> production 下自动开启

开发模式等其他模式下如果要实现 tree-shaking，应该怎么办？

```js
// webpack.config.js

module.exports = {
  mode: 'none',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  },
  optimization: {
    usedExports: true, // 只会导出用到的模块到 webpack 入口函数里
    minimize: true // 压缩代码，同时会去除未引用代码
  }
}

// usedExports 相当于标记未引用代码
// minimize 相当于剪除这些未引用代码
```



##### 合并模块

concatenateModules

```js
// webpack.config.js

module.exports = {
  mode: 'none',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  },
  optimization: {
    usedExports: true,
    concatenateModules: true, // bundle.js 中作为参数传递进去的模块列表数组，一个模块对应一个函数，此时，多个函数会被合并为一个函数，模块被合并
    minimize: true
  }
}
```

> 尽可能的将所有模块合并输出到一个函数中，既提升了运行效率，又减少了代码体积，该特性又被称为“Scope Hoisting”



##### Tree-shaking & Babel

搭配 babel 转换代码导致 tree-shaking 失效的问题

- Tree-Shaking 前提是 ES Modules，即由 Webpack 打包的代码必须使用 ESM
- Webpack 一般交由 Loader 加载模块，Webpack 打包 Loader 加载过来的结果
- 为了转换代码中的 ES 新特性，一般使用 babel-loader 加载模块、做转换
- babel-loader 处理过程中，有可能将 ES Modules -> CommonJS
- `@babel/preset-env` 中也有将 ES Modules 转换为 CommonJS 的插件

此时，webpack 打包时，拿到的代码可能就是 CommonJS 模块的代码，以致 tree-shaking 失效

现状：

Babel-loader 中 injectCaller.js 里对当前环境支持 ESM 已做标记

@babel/preset-env 中据此便不会自动转换 ESM -> CommonJS

webpack 打包时得到的还是 ESM



测试：

```js
// webpack.config.js

module.exports = {
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [ '@babel/preset-env', { modules: 'commonjs' } ] // preset-env 强制将 ESM -> CommonJS
            ]
          }
        }
      }
    ]
  },
  optimization: {
    usedExports: true
  }
}

// 以上便会导致 usedExports 失败，进而 tree-shaking 失效

// 如不确定 loader 是否会自动转换 ESM -> CommonJS
// 可将 preset 中 modules 设置为 false
['@babel/preset-env', { modules: false }]
// 此时，preset-env 不会开启 ESM 转换的插件

```



##### sideEffects

允许用户通过配置的方式标识代码是否有副作用，从而提高 tree-shaking 的压缩空间

副作用：模块执行时除了导出成员之外所做的事情

一般用于 npm 包标记是否有副作用

```js
// webpack.config.js

module.exports = {
  mode: 'none',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  },
  optimization: {
    sideEffects: true // 该特性在 production 模式下自动开启
  }
}
```

开启该特性后，webpack 在打包时便会检查当前代码所属的 package.json 文件中是否有 `"sideEffects": false`，该文件所辖的文件中没有用到的部分都会被 tree-shaking 移除

> package.json 中 `"sideEffects: false"` 会标识当前 package.json 所影响的项目当中所有代码都没有副作用

> 使用该特性的前提：确保代码真的没有副作用，不然会造成误删
>
> `@import './index.css'` 这也是副作用代码
>
> 在 package.json 中手动标识副作用文件
>
> ```json
> {
>   "sideEffects": [
>     "./src/extend.js",
>     "*.css"
>   ]
> }
> ```
>
> 如此，副作用代码则会被打包到 bundle.js 中



##### 代码分割 Code Splitting

- 所有代码最终都被打包到一起，bundle 体积过大
- 并不是每个模块在启动时都是必要的

解决方案：

分包，按需加载

- 多入口打包 Multi Entry

  常见于多页应用程序，一个页面对应一个打包入口，公共部分单独提取

  ```js
  // webpack.config.js
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  
  module.exports = {
    mode: 'none',
    entry: {
      index: './src/index.js',
      album: './src/album.js'
    },
    output: {
      filename: '[name].bundle.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Multi Entry',
        template: './src/index.html',
        filename: 'index.html',
        chunks: ['index'] // 生成的 html 中只会注入当前 chunk 的 bundle
      }),
      new HtmlWebpackPlugin({
        title: 'Multi Entry',
        template: './src/album.html',
        filename: 'album.index',
        chunks: ['album'] // 生成的 html 中只会注入当前 chunk 的 bundle
      })
    ]
  }
  ```

  - 提取公共模块 Split Chunks

    不同入口中肯定会有公共模块

    ```js
    // webpack.config.js
    // 在上述的 webpack.config.js 中添加
    module.exports = {
      optimization: {
        splitChunks: {
          chunks: 'all' // 会将所有公共模块都提取到单独的 bundle
        }
      }
    }
    ```

    

- 动态导入

  按需加载是指，需要用到某个模块时，再加载这个模块

  而采用动态导入的模块会被自动分包

  使用 `import()` 函数取代 `import from` 静态导入

  单页应用中 react、vue 的路由组件便可使用动态导入
  
  - 魔法注释 Magic Comments
  
    使用动态导入，打包后分包的文件，文件名 1.bundle.js 可读性降低，不易区分，可使用魔法注释为这些文件命名
  
    ```js
    // 动态导入时添加注释
    import(/* webpackChunkName: 'posts' */'./posts/posts').then(({ default: posts }) => {
      // ...
    })
    ```
  
    打包后文件名为 posts.bundle.js
  
    借此，灵活组织动态加载的输出文件



##### MiniCssExtractPlugin

提取 CSS 到单个文件，实现 css 的按需加载

```shell
# 安装插件
yarn add mini-css-extract-plugin --dev
```

```js
// webpack.config.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'none',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 'style-loader', // 将样式通过 style 标签注入
          MiniCssExtractPlugin.loader, // 通过 link 方式引入
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Dynamic import',
      template: './src/index.html',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin()
  ]
}
```

> 建议：当样式文件超过 150KB 时才考虑这种方式，以减少请求



##### OptimizeCssAssetsWebpackPlugin

压缩输出的 CSS 文件

在上一小节的基础上，生产模式下，还应对提取出来的样式文件进行压缩，webpack 内置的压缩插件是针对 JS 的

```shell
# 安装插件
yarn add optimize-css-assets-webpack-plugin --dev
```

```js
// webpack.config.js
// 在上一小节的基础上
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  plugins: [
    new OptimizeCssAssetsWebpackPlugin()
  ]
}

// webpack 建议压缩类的插件应该配置在 minimizer 特性开启时启动，以便统一控制
module.exports = {
  optimization: {
    minimizer: [ // 注意：此时 webpack 认为用户要自定义压缩操作，此处配置的压缩插件会覆盖内置的压缩插件，进而可能导致其他类型的代码（例如 JS 代码）不会被压缩
      // yarn add terser-webpack-plugin --dev
      // const TerserWebpackPlugin = require('terser-webpack-plugin')
      new TerserWebpackPlugin(), // JS 压缩
      new OptimizeCssAssetsWebpackPlugin()
    ]
  }
}

// 如果把压缩插件配置在 plugins 中，无论何种模式该插件都会工作，对相关文件进行压缩，影响效率
// 如果配置在 minimizer 特性中
// minimizer 特性在生产模式下会自动开启
// 而在开发模式下，如果没有指定压缩，启用该特性，则不会进行压缩操作，进而提高开发时的效率

```



##### 输出文件名 Hash

substitutions

部署前端资源文件时，会启用服务器的静态资源缓存，浏览器也会缓存静态文件资源，以减少重复的请求，提高应用响应速度

鉴于缓存失效时间设定与资源文件更新之间的不确定性，建议生产模式下，文件名使用 Hash

对浏览器而言，相同文件全新的文件名会让浏览器重新请求该资源，进而不用过多关注缓存失效时间的设定

```js
// webpack.config.js
module.exports = {
  output: {
    filename: '[name]-[hash].bundle.js' // 整个项目级别的，项目中任何文件发生改动，hash 都会变
    // [name]-[chunkhash].bundle.js 同一路文件的 chunkhash 是相同的，同一路任何文件发生改动，该路chunkhash 改变，同时包括引用该路文件的文件的 chunkhash 也会被动改变
    // [name]-[contenthash].bundle.js 文件级别，不同的文件便有不同的 hash，文件改动，hash 改变，同时，引用该文件的文件的 hash 也会被动的改变
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]-[hash].bundle.css'
      // 嫌哈希值太长的话，可以手动指定哈希值长度
      // [name]-[hash:8].bundle.css
      // 推荐使用 8 位 contenthash
    })
  ]
}

// contenthash 是用于解决缓存问题的最好方式，精确做到与文件相关的改动 hash
```

