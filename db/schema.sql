-- Masters table
CREATE TABLE IF NOT EXISTS masters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 0,
  isAvailable INTEGER NOT NULL DEFAULT 1,
  geo_lat REAL,
  geo_lng REAL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  customerName TEXT,
  customerPhone TEXT,
  geo_lat REAL,
  geo_lng REAL,
  assignedMasterId INTEGER,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (assignedMasterId) REFERENCES masters(id)
);

-- ADL media table
CREATE TABLE IF NOT EXISTS adl_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  gps_lat REAL,
  gps_lng REAL,
  capturedAt TEXT,
  meta TEXT,
  FOREIGN KEY (orderId) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_assignedMasterId ON orders(assignedMasterId);
CREATE INDEX IF NOT EXISTS idx_adl_orderId ON adl_media(orderId);


