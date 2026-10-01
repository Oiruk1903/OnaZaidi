# ---------- build stage ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom first so dependency resolution is cached
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---------- runtime stage ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user
RUN addgroup -S onazaidi && adduser -S onazaidi -G onazaidi
USER onazaidi

COPY --from=build /app/target/*.jar app.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
