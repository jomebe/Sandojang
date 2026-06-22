import * as SQLite from 'expo-sqlite';

import seedMountains from '@/data/mountains.json';
import type { Mountain } from '@/types/models';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) databasePromise = initializeDatabase();
  return databasePromise;
}

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('sandojang.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS mountains (
      id TEXT PRIMARY KEY NOT NULL,
      name_ko TEXT NOT NULL,
      region TEXT NOT NULL,
      altitude_meters INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS climb_records (
      id TEXT PRIMARY KEY NOT NULL,
      mountain_id TEXT NOT NULL REFERENCES mountains(id),
      climbed_at TEXT NOT NULL,
      memo TEXT NOT NULL DEFAULT '',
      weather TEXT NOT NULL DEFAULT '',
      difficulty TEXT NOT NULL,
      companions TEXT NOT NULL DEFAULT '',
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      photo_uris TEXT NOT NULL DEFAULT '[]',
      verification_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS climb_records_mountain_idx ON climb_records(mountain_id);
    CREATE INDEX IF NOT EXISTS climb_records_date_idx ON climb_records(climbed_at DESC);
    CREATE TABLE IF NOT EXISTS hiking_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      mountain_id TEXT NOT NULL REFERENCES mountains(id),
      mountain_name TEXT NOT NULL,
      status TEXT NOT NULL,
      goal_name TEXT NOT NULL,
      started_at TEXT NOT NULL,
      paused_at TEXT,
      total_paused_ms INTEGER NOT NULL DEFAULT 0,
      estimated_duration_minutes INTEGER NOT NULL,
      estimated_arrival_at TEXT NOT NULL,
      finished_at TEXT,
      verification_type TEXT NOT NULL,
      last_known_latitude REAL,
      last_known_longitude REAL,
      memo TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS hiking_sessions_status_idx ON hiking_sessions(status);
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY NOT NULL,
      climb_record_id TEXT NOT NULL REFERENCES climb_records(id) ON DELETE CASCADE,
      uri TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM mountains');
  if (!row?.count) await seedDatabase(db);
  return db;
}

async function seedDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const mountain of seedMountains as Mountain[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO mountains
          (id, name_ko, region, altitude_meters, latitude, longitude, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        mountain.id,
        mountain.nameKo,
        mountain.region,
        mountain.altitudeMeters,
        mountain.latitude,
        mountain.longitude,
        mountain.description ?? null,
      );
    }
  });
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM photos');
    await db.runAsync('DELETE FROM climb_records');
    await db.runAsync('DELETE FROM hiking_sessions');
  });
}
