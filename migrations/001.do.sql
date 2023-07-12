
-- Add SQL in this file to create the database tables for your API
CREATE TABLE user (
  id INTEGER PRIMARY KEY,
  fullName TEXT,
  email TEXT,
  provider TEXT,
  token OBJECT,
  providerId INTEGER
)

