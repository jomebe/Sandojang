import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { getDatabase } from '@/storage/database';
import type { BackupPayload, ClimbRecord, HikingSession } from '@/types/models';
import { createId } from '@/utils/idUtils';
import { validateBackup } from '@/utils/importExportValidation';

function recordValues(record: ClimbRecord): (string | number)[] {
  return [
    record.id,
    record.mountainId,
    record.climbedAt,
    record.memo,
    record.weather,
    record.difficulty,
    record.companions,
    record.durationMinutes,
    JSON.stringify(record.photoUris),
    record.verificationType,
    record.createdAt,
    record.updatedAt,
  ];
}

function sessionValues(session: HikingSession): (string | number | null)[] {
  return [
    session.id,
    session.mountainId,
    session.mountainName,
    session.status,
    session.goalName,
    session.startedAt,
    session.pausedAt ?? null,
    session.totalPausedMs,
    session.estimatedDurationMinutes,
    session.estimatedArrivalAt,
    session.finishedAt ?? null,
    session.verificationType,
    session.lastKnownLatitude ?? null,
    session.lastKnownLongitude ?? null,
    session.memo,
    session.createdAt,
    session.updatedAt,
  ];
}

export const backupService = {
  createPayload(records: ClimbRecord[], sessions: HikingSession[]): BackupPayload {
    return { version: 1, exportedAt: new Date().toISOString(), records, sessions };
  },

  async exportToFile(records: ClimbRecord[], sessions: HikingSession[]): Promise<string> {
    const directory = FileSystem.cacheDirectory;
    if (!directory) throw new Error('내보낼 임시 폴더를 열 수 없어요.');
    const uri = `${directory}산도장-백업-${new Date().toISOString().slice(0, 10)}.json`;
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(this.createPayload(records, sessions), null, 2));
    if (!(await Sharing.isAvailableAsync())) throw new Error('이 기기에서는 파일 공유를 사용할 수 없어요.');
    await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: '산도장 데이터 내보내기' });
    return uri;
  },

  async pickAndImport(): Promise<{ records: number; missingPhotos: number }> {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (result.canceled) throw new Error('가져오기를 취소했어요.');
    const asset = result.assets[0];
    if (!asset) throw new Error('선택한 파일을 읽을 수 없어요.');
    const text = await FileSystem.readAsStringAsync(asset.uri);
    let parsed: unknown;
    try { parsed = JSON.parse(text) as unknown; }
    catch { throw new Error('백업 파일의 JSON 형식이 올바르지 않아요.'); }
    const payload = validateBackup(parsed);
    const db = await getDatabase();
    const mountainRows = await db.getAllAsync<{ id: string }>('SELECT id FROM mountains');
    const mountainIds = new Set(mountainRows.map((row) => row.id));
    if (payload.records.some((record) => !mountainIds.has(record.mountainId))) {
      throw new Error('현재 산 목록에 없는 산의 기록이 포함되어 있어요.');
    }
    let missingPhotos = 0;
    for (const record of payload.records) {
      for (const uri of record.photoUris) {
        if (uri.startsWith('file://') && !(await FileSystem.getInfoAsync(uri)).exists) missingPhotos += 1;
      }
    }
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM photos');
      await db.runAsync('DELETE FROM climb_records');
      await db.runAsync('DELETE FROM hiking_sessions');
      for (const record of payload.records) {
        await db.runAsync(
          `INSERT INTO climb_records
           (id, mountain_id, climbed_at, memo, weather, difficulty, companions, duration_minutes,
            photo_uris, verification_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ...recordValues(record),
        );
        for (const uri of record.photoUris) {
          await db.runAsync(
            'INSERT INTO photos (id, climb_record_id, uri, created_at) VALUES (?, ?, ?, ?)',
            createId('photo'), record.id, uri, record.createdAt,
          );
        }
      }
      for (const session of payload.sessions) {
        await db.runAsync(
          `INSERT INTO hiking_sessions
           (id, mountain_id, mountain_name, status, goal_name, started_at, paused_at, total_paused_ms,
            estimated_duration_minutes, estimated_arrival_at, finished_at, verification_type,
            last_known_latitude, last_known_longitude, memo, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ...sessionValues(session),
        );
      }
    });
    return { records: payload.records.length, missingPhotos };
  },
};
