
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
    path.join(__dirname, "traceit.db")
);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    student_id TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student'
      CHECK (role IN ('student', 'admin')),
    status TEXT NOT NULL DEFAULT 'Active'
      CHECK (status IN ('Active', 'Suspended')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    reporter_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL
      CHECK (type IN ('lost', 'found')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    brand TEXT DEFAULT 'Generic',
    color TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT DEFAULT '12:00',
    image_path TEXT,
    additional_details TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reporter_user_id)
      REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    claimant_user_id TEXT NOT NULL,
    private_detail TEXT NOT NULL,
    additional_description TEXT,
    proof_image_path TEXT,
    status TEXT NOT NULL DEFAULT 'Pending'
      CHECK (
        status IN (
          'Pending',
          'Under Review',
          'Approved',
          'Rejected',
          'Returned'
        )
      ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (item_id)
      REFERENCES items(id),
    FOREIGN KEY (claimant_user_id)
      REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0
      CHECK (read IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_items_type_status
    ON items(type, status);

  CREATE INDEX IF NOT EXISTS idx_items_category
    ON items(category);

  CREATE INDEX IF NOT EXISTS idx_claims_item
    ON claims(item_id);

  CREATE INDEX IF NOT EXISTS idx_claims_claimant
    ON claims(claimant_user_id);

  CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id, read);
`);

console.log("TraceIt database and tables are ready!");

module.exports = db;
