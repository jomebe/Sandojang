import { getDatabase } from '@/storage/database';
import type { Mountain, MountainWithProgress } from '@/types/models';

interface MountainRow {
  id: string;
  name_ko: string;
  region: string;
  altitude_meters: number;
  latitude: number;
  longitude: number;
  description: string | null;
  record_count?: number;
  last_climbed_at?: string | null;
}

function mapMountain(row: MountainRow): Mountain {
  return {
    id: row.id,
    nameKo: row.name_ko,
    region: row.region,
    altitudeMeters: row.altitude_meters,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description ?? undefined,
  };
}

export const mountainService = {
  async getAll(): Promise<Mountain[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MountainRow>('SELECT * FROM mountains ORDER BY name_ko COLLATE NOCASE');
    return rows.map(mapMountain);
  },

  async getAllWithProgress(): Promise<MountainWithProgress[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MountainRow>(`
      SELECT m.*, COUNT(c.id) AS record_count, MAX(c.climbed_at) AS last_climbed_at
      FROM mountains m
      LEFT JOIN climb_records c ON c.mountain_id = m.id
      GROUP BY m.id
      ORDER BY m.name_ko COLLATE NOCASE
    `);
    return rows.map((row) => ({
      ...mapMountain(row),
      climbed: Number(row.record_count ?? 0) > 0,
      recordCount: Number(row.record_count ?? 0),
      lastClimbedAt: row.last_climbed_at ?? undefined,
    }));
  },

  async getById(id: string): Promise<Mountain | undefined> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<MountainRow>('SELECT * FROM mountains WHERE id = ?', id);
    return row ? mapMountain(row) : undefined;
  },
};
