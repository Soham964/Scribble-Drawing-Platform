# ── Stage 1: Build with Maven ──────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Run the JAR ───────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/target/ScribbleApplication-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]
