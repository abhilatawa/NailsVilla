# syntax=docker/dockerfile:1

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -B dependency:go-offline

COPY src/ src/
RUN ./mvnw -B -DskipTests package && \
    mv target/nailsvilla-backend.jar target/app.jar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S nailsvilla && adduser -S nailsvilla -G nailsvilla
COPY --from=build /app/target/app.jar app.jar
USER nailsvilla

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
