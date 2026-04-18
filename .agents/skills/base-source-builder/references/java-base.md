# Java Base Source

Default target: Spring Boot enterprise-style application using layered architecture.

## 1. Default Stack

- Java: 17 by default
- Framework: Spring Boot 3
- Build tool: Maven by default, Gradle when requested
- Test framework: JUnit 5
- Formatting: Spotless + Google Java Format
- Mapping: MapStruct
- Boilerplate reduction: Lombok

If the user does not specify framework details, generate a Spring Boot base source first.
Ask for the Java version before scaffolding. Recommend Java 17 or Java 21, but allow another version if the user explicitly requests it.

## 1.1 Version Guidance

- Recommended versions:
  - Java 17
  - Java 21
- Default version: Java 17

Reasoning:

- Java 17 is a widely adopted LTS baseline for enterprise systems.
- Java 21 is a modern LTS option for new projects.

If the user requests another version:

- accept it when Spring Boot and the toolchain can support it
- set compiler configuration to the exact requested version
- warn if compatibility should be checked manually

## 2. Standard Directory Structure

```text
project-name/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/company/project/
│   │   │       ├── ProjectApplication.java
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       │   ├── impl/
│   │   │       │   └── interfaces may stay in service/ when small
│   │   │       ├── repository/
│   │   │       ├── domain/
│   │   │       ├── dto/
│   │   │       ├── exception/
│   │   │       └── mapper/
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-local.yml
│   └── test/
│       └── java/
│           └── com/company/project/
│               ├── controller/
│               ├── service/
│               └── ProjectApplicationTests.java
├── .editorconfig
├── .gitignore
├── pom.xml or build.gradle
└── src/test/resources/
```

## 3. Naming Rules

- Package names: lowercase dot notation only.
- Root package pattern: `com.<organization>.<project>`
- Class names: `PascalCase`
- Interface names: `PascalCase`
- REST controllers: `<Feature>Controller`
- Service interfaces: `<Feature>Service`
- Service implementations: `<Feature>ServiceImpl`
- Repositories: `<Feature>Repository`
- Entities or domain models: `PascalCase`
- DTOs: `<Feature>Request`, `<Feature>Response`, `<Feature>Dto`
- Exception handlers: `GlobalExceptionHandler`
- Mappers: `<Feature>Mapper`
- Test classes: `<TargetClassName>Test` or `<TargetClassName>Tests`
- Resource files: `kebab-case` or ecosystem-native names such as `application.yml`

## 4. Required Files

- `pom.xml` or `build.gradle`
- `.editorconfig`
- `.gitignore`
- `src/main/java/.../ProjectApplication.java`
- `src/main/java/.../config/`
- `src/main/java/.../controller/`
- `src/main/java/.../service/`
- `src/main/java/.../repository/`
- `src/main/java/.../domain/`
- `src/main/java/.../dto/`
- `src/main/java/.../exception/`
- `src/main/java/.../mapper/`
- `src/main/resources/application.yml`
- `src/main/resources/application-local.yml`
- `src/test/java/.../ProjectApplicationTests.java`

## 5. Default Format Rules

Configure these in the build file:

- Java version targeting the selected version
- Spring Boot plugin for the chosen build tool
- test plugin/runtime for JUnit 5
- Spotless with Google Java Format
- Lombok dependency and annotation processing
- MapStruct dependency and annotation processing

Expected developer commands:

- Maven:
  - `mvn spotless:apply`
  - `mvn test`
  - `mvn package`
  - `mvn spring-boot:run`
- Gradle:
  - `gradlew spotlessApply`
  - `gradlew test`
  - `gradlew build`
  - `gradlew bootRun`

## 6. Spring Boot Base Source Expectations

- `ProjectApplication.java` must be the `@SpringBootApplication` entry point.
- Use layered architecture by default. Only move to stricter hexagonal or DDD modules when the user explicitly asks.
- Include at least one starter controller, DTO pair, service interface, service implementation, repository stub, mapper, and centralized exception handler when creating an API base source.
- Test skeleton must compile and run with Spring Boot test support.
- Keep domain models separate from transport DTOs.
- Put object conversion in `mapper/`, not in controllers.
- The generated build file must reflect the selected Java version exactly.
