# 第一阶段：构建 (使用基于 Eclipse Temurin 的 Maven 镜像)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
# 跳过测试打包，加快构建速度
RUN mvn clean package -DskipTests

# 第二阶段：运行 (使用 Eclipse Temurin JRE，这是 OpenJDK 的官方替代品)
FROM eclipse-temurin:17-jre
WORKDIR /app
# 从第一阶段复制打包好的 jar 文件
COPY --from=build /app/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 启动命令
ENTRYPOINT ["java","-jar","app.jar"]