import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SyncSetup from '@/features/sync-create-connections';
import SyncMappings from '@/features/sync-create-mappings';
import SyncIssues from '@/features/sync-detail-issues';
import SyncOperations from '@/features/sync-detail-operations';
import SyncSettings from '@/features/sync-settings';

const Sync = () => {
  const [activeTab, setActiveTab] = useState('setup');

  return (
    <div className="container mx-auto py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="mappings">Table Mappings</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <SyncSetup />
        </TabsContent>

        <TabsContent value="mappings">
          <SyncMappings />
        </TabsContent>

        <TabsContent value="issues">
          <SyncIssues />
        </TabsContent>

        <TabsContent value="operations">
          <SyncOperations />
        </TabsContent>

        <TabsContent value="settings">
          <SyncSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sync;
