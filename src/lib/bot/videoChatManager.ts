import { store } from '@/store/store';
import { telegramApi } from '@/features/telegram/telegramApi';
import { setVideoChatActive } from '@/features/telegram/telegramSlice';

const CHECK_INTERVAL = 23 * 60 * 60 * 1000; // 23 часа

export function startVideoChatScheduler(): void {
  const checkAndRenew = async () => {
    const activeChats = Object.entries(store.getState().telegram.activeVideoChats)
      .filter(([active]) => active)
      .map(([chatId]) => chatId);

    for (const chatId of activeChats) {
      try {
        const result = await store.dispatch(
          telegramApi.endpoints.sendVideoChat.initiate({
            chat_id: Number(chatId),
            title: 'Авто-видеочат',
          })
        ).unwrap();

        if (!result.ok) {
          store.dispatch(setVideoChatActive({ chatId, active: false }));
        }
      } catch (error) {
        console.error(`Ошибка обновления видеочата в ${chatId}:`, error);
        store.dispatch(setVideoChatActive({ chatId, active: false }));
      }
    }
  };

  const interval = setInterval(checkAndRenew, CHECK_INTERVAL);
  
  process.on('exit', () => clearInterval(interval));
  process.on('SIGINT', () => clearInterval(interval));
  process.on('SIGTERM', () => clearInterval(interval));

  console.log('Сервис видеочатов запущен');
}