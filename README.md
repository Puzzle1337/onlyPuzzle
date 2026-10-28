# OnlyPuzzle

一个前后端分离的用户认证系统，用于练习 Spring Boot + React 全栈开发。

## 技术栈

### 后端

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Java | 21 | 运行环境 |
| Spring Boot | 4.0.9 | Web 框架 |
| MyBatis Spring Boot Starter | 4.0.1 | ORM |
| MySQL | 8.x | 数据库 |
| spring-security-crypto | — | BCrypt 密码哈希 |
| jjwt | 0.12.5 | JWT 签发与解析 |
| Lombok | — | 简化实体类 |

### 前端

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| React | 19 | UI 框架 |
| Vite | 8 | 构建工具 |
| TypeScript | 6 | 类型系统 |
| axios | 1.21 | HTTP 请求 |
| oxlint | — | Lint |
## 功能特性
### 已完成

- 用户注册：参数校验 → 用户名重复检查 → BCrypt 哈希 → 落库
- 用户登录：密码校验（BCrypt `matches`）→ 签发 JWT
- JWT 鉴权：`HandlerInterceptor` 拦截请求，验签后将 `userId` 注入请求上下文
- CORS 跨域：`WebMvcConfigurer` 配置放行来源与预检请求
- 全局异常处理：`@RestControllerAdvice` 统一包装 `Result` 响应
- 前端 axios 封装：请求拦截器自动携带 `Authorization`，响应拦截器统一处理 401

### 架构要点

```
浏览器（axios 自动挂 token）
  → OPTIONS 预检
  → CORS 放行
  → JwtAuthInterceptor.preHandle（验签 + 塞 userId）
  → Controller → Service → MyBatis → MySQL
  → GlobalExceptionHandler 兜底
  → Result 格式返回
```

## API 接口

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | `/user/register` | 否 | 注册 |
| POST | `/user/login` | 否 | 登录，返回 JWT |
| GET | `/user/info` | 是 | 获取当前用户 ID |

## 快速开始

### 环境

- JDK 21
- MySQL 5.7
- Node.js 18+
- Maven

### 数据库

```sql
CREATE DATABASE onlypuzzle;
USE onlypuzzle;

CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 后端

```bash
cd backend
# 修改 src/main/resources/application.properties 中的数据库密码
mvn spring-boot:run
# 或 ./mvnw spring-boot:run
```

后端运行于 `http://localhost:8080`。

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端运行于 `http://localhost:5173`。

## 配置

`backend/src/main/resources/application.properties`：

- `spring.datasource.*`：MySQL 连接
- `spring.data.redis.*`：Redis 连接（已引入依赖，待接入）
- `mybatis.mapper-locations`：Mapper XML 路径


