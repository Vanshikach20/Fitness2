# Fitness Activity Tracker (Spring Boot)

A simple Spring Boot REST API for tracking fitness workouts using in-memory storage.

## Features
- CRUD operations for Workout entity
- Monthly calories summary
- Filter workouts by activity type

## Endpoints
- `GET /api/workouts` — List all workouts
- `GET /api/workouts/{id}` — Get workout by ID
- `POST /api/workouts` — Add new workout
- `PUT /api/workouts/{id}` — Update workout
- `DELETE /api/workouts/{id}` — Delete workout
- `GET /api/workouts/summary/monthly?year=YYYY&month=MM` — Monthly calories summary
- `GET /api/workouts/filter?activityName=...` — Filter by activity name

## How to Run
1. Ensure you have Java 17+ and Maven installed.
2. Build and run the project:
   ```sh
   mvn spring-boot:run
   ```
3. Access the API at `http://localhost:8080/api/workouts`

## Project Structure
- `model` — Entity classes
- `repository` — In-memory data logic
- `service` — Business logic
- `controller` — REST endpoints

---
This project uses in-memory collections for demonstration and is not intended for production use.
