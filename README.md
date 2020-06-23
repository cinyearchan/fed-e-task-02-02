### 简答题

1. Webpack 的构建流程主要有哪些环节？如果可以请尽可能详尽的描述 Webpack 打包的整个过程

   构建流程主要运行在 nodejs 环境下，配置文件遵循 CommonJS 规范

   工作过程：

   1. 代码及资源文件散落在项目各处，Webpack 根据配置，找到入口文件
   2. 以入口文件作为打包入口，根据出现的 import、require 等语句，解析推断出依赖的资源文件，再分别解析每个资源模块对应的依赖，最终形成整个项目文件之间依赖关系的依赖树
   3. 遍历、递归依赖树，找到每个节点对应的资源文件
   4. 根据配置文件的 rules 属性，找到对应模块的加载器，使用加载器加载相应的模块
   5. 加载的结果会被并入 bundle.js（打包输入文件），从而实现整个项目的打包

   

2. Loader 和 Plugin 有哪些不同？请描述一下开发 Loader 和 Plugin 的思路

  - Loader 专注实现资源模块加载，对模块文件进行编译转换

    - 在 module.rules 数组中进行配置，用于告诉 Webpack 在遇到指定文件时使用对应 Loader 去加载和转换
    - 开发思路：
      1. Source -> Loader1 -> Loader2 -> Loader3 -> Result(JavaScript Code)
      2. 开发的 Loader 将资源加载进来后，中间对资源进行编译，最后要求返回的结果一定是可执行的 JavaScript 代码，返回的结果会被并入 bundle.js，如果结果不是 JS 代码，可能会导致 bundle.js 无法运行
  - Plugin 解决其他自动化工作，例如：清除 dist 目录、拷贝静态文件至输出目录、压缩输出代码
    - 在 plugins 数组中进行配置

    - 其工作原理是通过 Webpack 的钩子机制实现的，要求必须是一个函数或者是一个包含 apply 方法的对象

    - 开发思路：

      ```js
      class MyPlugin {
        apply (compiler) {
          compiler.hooks.emit.tap('MyPlugin', compilation => {
            // compilation 可以理解为此次打包的上下文
            for (const name in compilation) {
              // name 处理的文件的文件名
              // compilation.assets[name].source() // 文件内容
              
              // 举例：对 js 文件移除内部注释
              if (name.endsWith('.js')) {
                const contents = compilation.assets[name].source()
                const withoutComments = contents.replace(/\/\*\*+\*\//g, '')
                // 重新设置对应文件内容
                compilation.assets[name] = {
                  source: () => withoutComments,
                  size: () => withoutComments.length
                }
              }
            }
          })
        }
      }
      ```

      

---



### 实践

使用 Webpack 实现 Vue 项目打包任务

> [项目代码](https://github.com/cinyearchan/fed-e-task-02-02/tree/master/code/vue-app-base)

