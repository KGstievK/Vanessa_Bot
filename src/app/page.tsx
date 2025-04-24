'use client';

import { useGetMeQuery } from '@/features/telegram/telegramApi';

// Расширяем тип для информации о боте
interface BotUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

export default function Home() {
  const { 
    data: botInfo, 
    isLoading, 
    error 
  } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Приводим тип к нашему расширенному интерфейсу
  const botData = botInfo?.result as BotUser | undefined;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Telegram Bot Admin Panel</h1>
        
        {isLoading && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">Loading bot information...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error loading bot information. Please check your environment variables.
          </div>
        )}
        
        {botData && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Bot Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium text-gray-600">ID:</p>
                <p className="text-gray-800">{botData.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium text-gray-600">Username:</p>
                <p className="text-gray-800">@{botData.username}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium text-gray-600">First Name:</p>
                <p className="text-gray-800">{botData.first_name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium text-gray-600">Can Join Groups:</p>
                <p className="text-gray-800">
                  {botData.can_join_groups ? '✅ Yes' : '❌ No'}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Bot Features</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Automatically deletes system messages</li>
                <li>Blocks suspicious links and domains</li>
                <li>24/7 video chat support with automatic restart</li>
                <li>Admin command controls with permission management</li>
                <li>User restriction system for violators</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}