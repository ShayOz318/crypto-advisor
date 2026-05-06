# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and pom first for layer caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -q

# Copy source and build, skipping tests (tests require env vars)
COPY src src
RUN ./mvnw package -DskipTests -q

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Render injects PORT at runtime; fall back to 8080 locally
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]