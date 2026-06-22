import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { HikingSession } from '@/types/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('hiking-session', {
    name: '등산 진행 알림',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 180, 250],
  });
}

export const notificationService = {
  async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    return (await Notifications.getPermissionsAsync()).status;
  },

  async requestPermission(): Promise<boolean> {
    await ensureChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.status === Notifications.PermissionStatus.GRANTED) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === Notifications.PermissionStatus.GRANTED;
  },

  async scheduleForSession(session: HikingSession): Promise<boolean> {
    if (!(await this.requestPermission())) return false;
    const totalSeconds = Math.max(180, session.estimatedDurationMinutes * 60);
    const notices = [
      {
        seconds: Math.max(60, Math.round(totalSeconds / 2)),
        title: `${session.mountainName} 등산 중`,
        body: `${session.goalName}까지 예상 시간의 절반을 이동했어요. 안전하게 걸으세요.`,
      },
      {
        seconds: Math.max(120, totalSeconds - 600),
        title: '예상 도착 시간이 가까워졌어요',
        body: `${session.goalName}까지 약 10분 남았어요.`,
      },
      {
        seconds: totalSeconds + 900,
        title: '예상 시간보다 오래 등산 중이에요',
        body: '현재 상태와 남은 체력을 확인하고 안전하게 이동하세요.',
      },
    ];
    const unique = notices.filter((notice, index, all) => all.findIndex((item) => item.seconds === notice.seconds) === index);
    for (const notice of unique) {
      await Notifications.scheduleNotificationAsync({
        content: { title: notice.title, body: notice.body, data: { hikingSessionId: session.id } },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: notice.seconds,
          repeats: false,
          channelId: 'hiking-session',
        },
      });
    }
    return true;
  },

  async sendStarted(session: HikingSession): Promise<void> {
    if ((await this.getPermissionStatus()) !== Notifications.PermissionStatus.GRANTED) return;
    await Notifications.scheduleNotificationAsync({
      content: { title: `${session.mountainName} 등산이 시작됐어요.`, body: `${session.goalName}까지 안전하게 이동하세요.` },
      trigger: null,
    });
  },

  async cancelSessionNotifications(sessionId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const matching = scheduled.filter((item) => item.content.data?.hikingSessionId === sessionId);
    await Promise.all(matching.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  },
};
