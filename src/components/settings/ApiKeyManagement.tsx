import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Copy, Trash2, Eye, EyeOff, Key, Clock, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  permissions: {
    read?: boolean;
    write?: boolean;
    webhook?: boolean;
  };
  rate_limit_per_hour: number;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface CreateApiKeyData {
  name: string;
  permissions: {
    read: boolean;
    write: boolean;
    webhook: boolean;
  };
  rateLimit: number;
  expiresAt?: string;
}

export const ApiKeyManagement = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState<CreateApiKeyData>({
    name: '',
    permissions: { read: true, write: false, webhook: false },
    rateLimit: 1000
  });
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadApiKeys();
    }
  }, [user]);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('api-key-management', {
        method: 'GET'
      });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyData.name.trim()) {
      toast.error('Please provide a name for the API key');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('api-key-management', {
        method: 'POST',
        body: JSON.stringify({
          name: newKeyData.name,
          permissions: newKeyData.permissions,
          rateLimit: newKeyData.rateLimit,
          expiresAt: newKeyData.expiresAt
        })
      });

      if (error) throw error;

      setNewApiKey(data.key);
      setNewKeyData({
        name: '',
        permissions: { read: true, write: false, webhook: false },
        rateLimit: 1000
      });
      
      await loadApiKeys();
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase.functions.invoke('api-key-management', {
        method: 'DELETE',
        body: JSON.stringify({ keyId })
      });

      if (error) throw error;

      await loadApiKeys();
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const toggleApiKeyStatus = async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('api-key-management', {
        method: 'PUT',
        body: JSON.stringify({ keyId, is_active: !isActive })
      });

      if (error) throw error;

      await loadApiKeys();
      toast.success(`API key ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error('Failed to update API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getPermissionsBadges = (permissions: ApiKey['permissions']) => {
    const badges = [];
    if (permissions.read) badges.push(<Badge key="read" variant="secondary">Read</Badge>);
    if (permissions.write) badges.push(<Badge key="write" variant="secondary">Write</Badge>);
    if (permissions.webhook) badges.push(<Badge key="webhook" variant="secondary">Webhook</Badge>);
    return badges;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          Create and manage API keys for accessing the Figmant API. Use these keys in your Figma plugins or external applications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New API Key */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Your API Keys</h3>
            <p className="text-sm text-muted-foreground">
              {apiKeys.length} of 10 API keys created
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Configure your new API key with the appropriate permissions and settings.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Figma Plugin Key"
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="read-perm" className="text-sm">Read Access</Label>
                      <Switch
                        id="read-perm"
                        checked={newKeyData.permissions.read}
                        onCheckedChange={(checked) => 
                          setNewKeyData(prev => ({ 
                            ...prev, 
                            permissions: { ...prev.permissions, read: checked }
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="write-perm" className="text-sm">Write Access</Label>
                      <Switch
                        id="write-perm"
                        checked={newKeyData.permissions.write}
                        onCheckedChange={(checked) => 
                          setNewKeyData(prev => ({ 
                            ...prev, 
                            permissions: { ...prev.permissions, write: checked }
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="webhook-perm" className="text-sm">Webhook Access</Label>
                      <Switch
                        id="webhook-perm"
                        checked={newKeyData.permissions.webhook}
                        onCheckedChange={(checked) => 
                          setNewKeyData(prev => ({ 
                            ...prev, 
                            permissions: { ...prev.permissions, webhook: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="rateLimit">Rate Limit (requests per hour)</Label>
                  <Select
                    value={newKeyData.rateLimit.toString()}
                    onValueChange={(value) => setNewKeyData(prev => ({ ...prev, rateLimit: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1,000</SelectItem>
                      <SelectItem value="2500">2,500</SelectItem>
                      <SelectItem value="5000">5,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={createApiKey} disabled={creating} className="flex-1">
                    {creating ? 'Creating...' : 'Create API Key'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Show new API key */}
        {newApiKey && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h4 className="font-medium text-green-800">API Key Created Successfully!</h4>
                <p className="text-sm text-green-700">
                  Copy this API key now. You won't be able to see it again for security reasons.
                </p>
                <div className="flex items-center gap-2 p-3 bg-white rounded border">
                  <code className="flex-1 text-sm font-mono">{newApiKey}</code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(newApiKey)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button size="sm" variant="outline" onClick={() => setNewApiKey(null)}>
                  I've copied the key
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Keys List */}
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No API Keys</h3>
            <p>Create your first API key to get started with the Figmant API.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className="border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <div className="flex gap-1">
                          {getPermissionsBadges(apiKey.permissions)}
                        </div>
                        <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                          {apiKey.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {apiKey.key_preview}
                        </code>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rate Limit:</span>
                          <p className="font-medium">{apiKey.rate_limit_per_hour}/hour</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Used:</span>
                          <p className="font-medium">{formatDate(apiKey.last_used_at)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p className="font-medium">{formatDate(apiKey.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleApiKeyStatus(apiKey.id, apiKey.is_active)}
                      >
                        {apiKey.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the API key "{apiKey.name}"? 
                              This action cannot be undone and will immediately revoke access for any applications using this key.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteApiKey(apiKey.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete API Key
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Usage Instructions */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">How to use your API key</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">1. In your Figma plugin code, replace the placeholder:</p>
                <code className="block bg-background p-2 rounded mt-1 text-xs">
                  const API_KEY = "your_api_key_here"; // Replace API_KEY_PLACEHOLDER
                </code>
              </div>
              <div>
                <p className="font-medium">2. Make API calls to:</p>
                <code className="block bg-background p-2 rounded mt-1 text-xs">
                  https://mxxtvtwcoplfajvazpav.supabase.co/functions/v1/figmant-plugin-api
                </code>
              </div>
              <div>
                <p className="font-medium">3. Include the API key in your request headers:</p>
                <code className="block bg-background p-2 rounded mt-1 text-xs">
                  {`{ "Authorization": "Bearer your_api_key_here" }`}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};