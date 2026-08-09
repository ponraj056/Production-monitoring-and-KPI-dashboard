CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'idle',
  line_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_logs (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER REFERENCES machines(id),
  units_produced INTEGER DEFAULT 0,
  defective_units INTEGER DEFAULT 0,
  shift VARCHAR(20),
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS downtime_logs (
  id SERIAL PRIMARY KEY,
  machine_id INTEGER REFERENCES machines(id),
  reason VARCHAR(100),
  downtime_minutes INTEGER,
  logged_at TIMESTAMP DEFAULT NOW()
);