-- Script to seed test events
-- PowerShell: Get-Content seed-events.sql | docker exec -i booking-api-postgres psql -U booking_user -d booking_db

INSERT INTO event (name, "totalSeats") VALUES 
  ('Tech Conference 2025', 100),
  ('JavaScript Workshop', 30),
  ('NestJS Meetup', 50),
  ('PostgreSQL Deep Dive', 25),
  ('DevOps Summit', 200);

-- Check inserted events
SELECT * FROM event;

