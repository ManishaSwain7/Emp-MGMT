# Emp-MGMT (Employee Management System)

A Java Spring Boot application for managing employees and departments. This project demonstrates RESTful APIs for CRUD operations, built with Maven and ready for cloud deployment using Docker and Vercel.

## Features
- Manage employees and departments
- RESTful API endpoints
- Spring Data JPA for database access
- Maven for build automation
- Dockerfile for containerization
- GitHub Actions workflow for CI/CD and Vercel deployment

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.9.9+


### Build and Run Locally
```sh
mvn clean package
java -jar target/CopilotW-1.0-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`.

### Docker
To build and run the Docker container:
```sh
docker build -t emp-mgmt .
docker run -p 8080:8080 emp-mgmt
```

### Deployment
- The project is configured for automated deployment to Vercel using GitHub Actions.
- Ensure you have a Vercel project and set the `VERCEL_TOKEN` secret in your GitHub repository.

## Project Structure
- `src/main/java/com/copilotw/` - Application source code
- `src/main/resources/` - Application properties
- `src/test/java/com/copilotw/` - Unit tests
- `Dockerfile` - Container build instructions
- `.github/workflows/vercel-deploy.yml` - CI/CD workflow

## API Endpoints
- `/employees` - CRUD operations for employees
- `/departments` - CRUD operations for departments

## License
This project is licensed under the MIT License.
