import { ListenerFactory } from '@/strategies/listener';
import { SqlProvider } from '@/types/provider';

export async function setupListener(provider: SqlProvider, connectionConfig: any, tableName: string, webhookUrl?: string): Promise<void> {
  try {
    // Get the appropriate strategy for this provider
    const strategy = ListenerFactory.listener(provider);
    await strategy.listen(connectionConfig, tableName, webhookUrl); // it will throw an error if the providers not found
  } catch (error) {
    console.error(`Failed to setup listener for ${provider}:`, error);
    throw error;
  }
}

