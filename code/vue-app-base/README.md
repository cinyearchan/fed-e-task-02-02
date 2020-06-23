# vue-app-base

1. 这是一个使用 Vue CLI 创建出来的 Vue 项目基础结构
2. 移除掉了 vue-cli-service（包含 webpack 等工具的黑盒工具）
3. 利用 Webpack 结合相关工具实现 vue-cli-service 集成的开发、测试、生产构建等功能

### 功能讲解

- 开发
```shell
yarn serve
# 或者
npm run serve
```

实现开发模式下打包、开发服务器的创建等功能

- 测试
```shell
yarn lint
# 或者
npm run lint
```

实现代码检测，规则与 vue-cli-serve 初始化的默认配置一致

- 生产
```shell
yarn build
# 或者
npm run build
```

实现生产模式下的打包构建