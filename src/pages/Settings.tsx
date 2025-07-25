import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, Activity, Key, Zap, TestTube } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { ApiKeyManagement } from '@/components/settings/ApiKeyManagement';
import { AutomationSettings } from '@/components/settings/AutomationSettings';
import { FeatureSettings } from '@/components/settings/FeatureSettings';
import { AdminHealthDashboard } from '@/components/settings/AdminHealthDashboard';
const Settings = () => {
  const {
    profile,
    loading
  } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get('tab') || 'profile';
  const isAdmin = profile?.super_admin || false;

  // Define available tabs based on user role
  const userTabs = [{
    value: 'profile',
    label: 'Profile',
    icon: User
  }, {
    value: 'notifications',
    label: 'Notifications',
    icon: Bell
  }, {
    value: 'features',
    label: 'Features',
    icon: TestTube
  }, {
    value: 'automation',
    label: 'Automation',
    icon: Zap
  }, {
    value: 'privacy',
    label: 'Privacy',
    icon: Shield
  }, {
    value: 'api-keys',
    label: 'API Keys',
    icon: Key
  }];
  const adminTabs = [...userTabs, {
    value: 'health',
    label: 'System Health',
    icon: Activity
  }];
  const availableTabs = isAdmin ? adminTabs : userTabs;
  if (loading) {
    return <div className="w-full p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
          <div className="h-12 bg-muted rounded"></div>
        </div>
      </div>;
  }
  return <div className="p-5 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences{isAdmin && ' and monitor system health'}
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-7' : 'grid-cols-6'}`}>
          {availableTabs.map(tab => <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>)}
        </TabsList>

        <TabsContent value="profile" className="w-full">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications" className="w-full">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="features" className="w-full">
          <FeatureSettings />
        </TabsContent>

        <TabsContent value="automation" className="w-full">
          <AutomationSettings />
        </TabsContent>

        <TabsContent value="privacy" className="w-full">
          <PrivacySettings />
        </TabsContent>

        <TabsContent value="api-keys" className="w-full">
          <ApiKeyManagement />
        </TabsContent>

        {isAdmin && <TabsContent value="health" className="w-full">
            <AdminHealthDashboard />
          </TabsContent>}
      </Tabs>
    </div>;
};
export default Settings;