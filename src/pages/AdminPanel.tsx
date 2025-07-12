import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Package, BarChart3 } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { ProductManagement } from '@/components/admin/ProductManagement';
import { UsageTracking } from '@/components/admin/UsageTracking';
export const AdminPanel = () => {
  const {
    user
  } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setIsAuthorized(false);
        return;
      }
      const {
        data: profile
      } = await supabase.from('profiles').select('super_admin').eq('user_id', user.id).single();
      setIsAuthorized(profile?.super_admin === true);
    };
    checkAdminAccess();
  }, [user]);
  if (isAuthorized === null) {
    return <LoadingSpinner />;
  }
  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-background w-full">
      <div className="w-full px-4 py-8 bg-white">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Manage users, subscriptions, products, and track usage
          </p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product Management
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Usage Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="w-full">
            <UserManagement />
          </TabsContent>

          <TabsContent value="products" className="w-full">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="usage" className="w-full">
            <UsageTracking />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};