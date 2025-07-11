import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, User } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface UserSubscription {
  user_id: string;
  plan_type: string;
  status: string;
  analyses_used: number;
  analyses_limit: number;
}

interface UserWithSubscription extends UserProfile {
  subscription?: UserSubscription;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with subscriptions
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch subscriptions
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*');

      if (subscriptionsError) throw subscriptionsError;

      // Combine data
      const usersWithSubscriptions = profiles.map(profile => {
        const subscription = subscriptions?.find(sub => sub.user_id === profile.user_id);
        return { ...profile, subscription };
      });

      setUsers(usersWithSubscriptions);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (userId: string, updates: Partial<UserSubscription>) => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Subscription updated successfully');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{user.full_name || 'No name'}</h3>
                      <Badge variant="secondary">{user.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.subscription && (
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span>Plan: <strong>{user.subscription.plan_type}</strong></span>
                        <span>Status: <Badge variant={user.subscription.status === 'active' ? 'default' : 'secondary'}>
                          {user.subscription.status}
                        </Badge></span>
                        <span>Usage: {user.subscription.analyses_used}/{user.subscription.analyses_limit}</span>
                      </div>
                    )}
                  </div>
                  <Dialog open={editDialogOpen && selectedUser?.id === user.id} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User Subscription</DialogTitle>
                      </DialogHeader>
                      {selectedUser && (
                        <SubscriptionEditForm
                          user={selectedUser}
                          onSave={(updates) => updateSubscription(selectedUser.user_id, updates)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SubscriptionEditFormProps {
  user: UserWithSubscription;
  onSave: (updates: Partial<UserSubscription>) => void;
}

const SubscriptionEditForm = ({ user, onSave }: SubscriptionEditFormProps) => {
  const [planType, setPlanType] = useState(user.subscription?.plan_type || 'trial');
  const [status, setStatus] = useState(user.subscription?.status || 'active');
  const [analysesLimit, setAnalysesLimit] = useState(user.subscription?.analyses_limit || 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      plan_type: planType,
      status,
      analyses_limit: analysesLimit,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="planType">Plan Type</Label>
        <Select value={planType} onValueChange={setPlanType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="monthly_25">Monthly 25</SelectItem>
            <SelectItem value="yearly_25">Yearly 25</SelectItem>
            <SelectItem value="monthly_50">Monthly 50</SelectItem>
            <SelectItem value="yearly_50">Yearly 50</SelectItem>
            <SelectItem value="monthly_100">Monthly 100</SelectItem>
            <SelectItem value="yearly_100">Yearly 100</SelectItem>
            <SelectItem value="unlimited_admin">Unlimited Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="analysesLimit">Analyses Limit</Label>
        <Input
          type="number"
          value={analysesLimit}
          onChange={(e) => setAnalysesLimit(Number(e.target.value))}
          min="0"
        />
      </div>

      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  );
};