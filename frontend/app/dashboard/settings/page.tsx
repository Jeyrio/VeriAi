'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Zap,
  Database,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload,
  Key,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

interface UserSettings {
  profile: {
    displayName: string;
    email: string;
    avatar: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    verificationComplete: boolean;
    challengeUpdates: boolean;
    marketplaceActivity: boolean;
  };
  privacy: {
    publicProfile: boolean;
    showActivity: boolean;
    showCollection: boolean;
  };
  verification: {
    defaultModel: string;
    autoVerify: boolean;
    retentionDays: number;
  };
  api: {
    hasApiKey: boolean;
    rateLimit: number;
    lastUsed: string;
  };
}

const mockSettings: UserSettings = {
  profile: {
    displayName: 'Anonymous User',
    email: 'user@example.com',
    avatar: ''
  },
  notifications: {
    email: true,
    push: false,
    verificationComplete: true,
    challengeUpdates: true,
    marketplaceActivity: false
  },
  privacy: {
    publicProfile: false,
    showActivity: true,
    showCollection: true
  },
  verification: {
    defaultModel: 'gpt-4',
    autoVerify: false,
    retentionDays: 30
  },
  api: {
    hasApiKey: false,
    rateLimit: 100,
    lastUsed: '2024-01-10T15:30:00Z'
  }
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { address } = useAccount();
  const [settings, setSettings] = useState<UserSettings>(mockSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const generateApiKey = () => {
    setSettings(prev => ({
      ...prev,
      api: {
        ...prev.api,
        hasApiKey: true,
        lastUsed: new Date().toISOString()
      }
    }));
    toast.success('API key generated successfully!');
  };

  const revokeApiKey = () => {
    setSettings(prev => ({
      ...prev,
      api: {
        ...prev.api,
        hasApiKey: false
      }
    }));
    toast.success('API key revoked');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.profile.displayName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, displayName: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>Wallet Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={address || 'Not connected'}
                    disabled
                    className="flex-1"
                  />
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    Connected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="verification-complete">Verification Complete</Label>
                    <p className="text-sm text-muted-foreground">When verification finishes</p>
                  </div>
                  <Switch
                    id="verification-complete"
                    checked={settings.notifications.verificationComplete}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, verificationComplete: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="challenge-updates">Challenge Updates</Label>
                    <p className="text-sm text-muted-foreground">Updates on your challenges</p>
                  </div>
                  <Switch
                    id="challenge-updates"
                    checked={settings.notifications.challengeUpdates}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, challengeUpdates: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketplace-activity">Marketplace Activity</Label>
                    <p className="text-sm text-muted-foreground">NFT sales and purchases</p>
                  </div>
                  <Switch
                    id="marketplace-activity"
                    checked={settings.notifications.marketplaceActivity}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, marketplaceActivity: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your privacy and data visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-profile">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                </div>
                <Switch
                  id="public-profile"
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, publicProfile: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-activity">Show Activity</Label>
                  <p className="text-sm text-muted-foreground">Display your recent activities</p>
                </div>
                <Switch
                  id="show-activity"
                  checked={settings.privacy.showActivity}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, showActivity: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-collection">Show Collection</Label>
                  <p className="text-sm text-muted-foreground">Make your NFT collection public</p>
                </div>
                <Switch
                  id="show-collection"
                  checked={settings.privacy.showCollection}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, showCollection: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Verification Settings */}
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Verification Preferences
              </CardTitle>
              <CardDescription>
                Configure your default verification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="default-model">Default AI Model</Label>
                <Select
                  value={settings.verification.defaultModel}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    verification: { ...prev.verification, defaultModel: value }
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-verify">Auto-Verify</Label>
                  <p className="text-sm text-muted-foreground">Automatically verify generated content</p>
                </div>
                <Switch
                  id="auto-verify"
                  checked={settings.verification.autoVerify}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    verification: { ...prev.verification, autoVerify: checked }
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="retention-days">Data Retention (Days)</Label>
                <Select
                  value={settings.verification.retentionDays.toString()}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    verification: { ...prev.verification, retentionDays: parseInt(value) }
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="-1">Forever</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  How long to store verification data locally
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Theme Settings */}
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Access
              </CardTitle>
              <CardDescription>
                Manage your API keys and access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.api.hasApiKey ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>API Key</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={showApiKey ? 'vrai_1234567890abcdef...' : '••••••••••••••••••••'}
                    disabled
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </Button>
                    <Button variant="destructive" size="sm" onClick={revokeApiKey}>
                      <Trash2 className="h-3 w-3 mr-2" />
                      Revoke
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Rate Limit: {settings.api.rateLimit} requests/hour</div>
                    <div>Last Used: {new Date(settings.api.lastUsed).toLocaleDateString()}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">No API key generated</p>
                  <Button onClick={generateApiKey} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Generate API Key
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Verifications</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">NFTs Owned</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Challenges</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Member Since</span>
                  <span className="font-medium">Dec 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}