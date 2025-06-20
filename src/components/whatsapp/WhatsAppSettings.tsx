'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Clock, 
  MessageSquare, 
  Users,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
  conditions: any;
  template: string;
  recipients: string;
}

interface CronStatus {
  status: string;
  automationRules: AutomationRule[];
  availableTypes: string[];
  nextScheduled: {
    daily: string;
    weekly: string;
    monthly: string;
    payment_reminders: string;
  };
}

export default function WhatsAppSettings() {
  const [cronStatus, setCronStatus] = useState<CronStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [apiConfig, setApiConfig] = useState({
    apiUrl: '',
    accessToken: '',
    phoneNumberId: '',
    webhookToken: '',
    webhookSecret: ''
  });

  useEffect(() => {
    loadCronStatus();
    loadApiConfig();
  }, []);

  const loadCronStatus = async () => {
    try {
      const response = await fetch('/api/cron/whatsapp-notifications');
      if (response.ok) {
        const data = await response.json();
        setCronStatus(data);
      }
    } catch (error) {
      console.error('Error loading cron status:', error);
    }
  };

  const loadApiConfig = async () => {
    try {
      const response = await fetch('/api/whatsapp/test');
      if (response.ok) {
        const data = await response.json();
        // Don't load actual secrets, just show configuration status
        setApiConfig({
          apiUrl: data.environment.hasApiUrl ? 'Configured' : 'Not configured',
          accessToken: data.environment.hasAccessToken ? 'Configured' : 'Not configured',
          phoneNumberId: data.environment.hasPhoneNumberId ? 'Configured' : 'Not configured',
          webhookToken: data.environment.hasWebhookToken ? 'Configured' : 'Not configured',
          webhookSecret: data.environment.hasWebhookSecret ? 'Configured' : 'Not configured'
        });
      }
    } catch (error) {
      console.error('Error loading API config:', error);
    }
  };

  const toggleAutomationRule = async (ruleId: string, enabled: boolean) => {
    try {
      setLoading(true);
      
      // In a real app, this would call an API to update the rule
      // For now, we'll just update the local state
      if (cronStatus) {
        const updatedRules = cronStatus.automationRules.map(rule =>
          rule.id === ruleId ? { ...rule, enabled } : rule
        );
        setCronStatus({
          ...cronStatus,
          automationRules: updatedRules
        });
      }

      toast.success(`Automation rule ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling automation rule:', error);
      toast.error('Failed to update automation rule');
    } finally {
      setLoading(false);
    }
  };

  const runManualCron = async (type: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/cron/whatsapp-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'demo-secret'}`
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`${type} notifications processed successfully`);
        console.log('Cron result:', result);
      } else {
        toast.error(`Failed to run ${type} notifications`);
      }
    } catch (error) {
      console.error('Error running manual cron:', error);
      toast.error('Failed to run notifications');
    } finally {
      setLoading(false);
    }
  };

  const testWhatsAppConnection = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: testPhone,
          message: 'Test connection dari WhatsApp Settings'
        })
      });

      if (response.ok) {
        toast.success('Test message sent successfully!');
      } else {
        const error = await response.json();
        toast.error(`Test failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error testing WhatsApp:', error);
      toast.error('Failed to test WhatsApp connection');
    } finally {
      setLoading(false);
    }
  };

  const getRuleIcon = (trigger: string) => {
    switch (trigger) {
      case 'hafalan_completed':
        return <FileText className="h-4 w-4" />;
      case 'attendance_absent':
        return <Calendar className="h-4 w-4" />;
      case 'payment_due':
        return <CreditCard className="h-4 w-4" />;
      case 'monthly_report':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatNextScheduled = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="automation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="test">Test & Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automation Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cronStatus ? (
                <div className="space-y-4">
                  {cronStatus.automationRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getRuleIcon(rule.trigger)}
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-gray-500">
                            Trigger: {rule.trigger} • Recipients: {rule.recipients}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(enabled) => toggleAutomationRule(rule.id, enabled)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Loading automation rules...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduled Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cronStatus ? (
                <div className="space-y-4">
                  {Object.entries(cronStatus.nextScheduled).map(([type, nextTime]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium capitalize">{type.replace('_', ' ')}</h4>
                        <p className="text-sm text-gray-500">
                          Next run: {formatNextScheduled(nextTime)}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runManualCron(type)}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Run Now
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Loading schedule information...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>WhatsApp API URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={apiConfig.apiUrl} readOnly />
                    {apiConfig.apiUrl === 'Configured' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>

                <div>
                  <Label>Access Token</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={apiConfig.accessToken} readOnly />
                    {apiConfig.accessToken === 'Configured' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>

                <div>
                  <Label>Phone Number ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={apiConfig.phoneNumberId} readOnly />
                    {apiConfig.phoneNumberId === 'Configured' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>

                <div>
                  <Label>Webhook Token</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={apiConfig.webhookToken} readOnly />
                    {apiConfig.webhookToken === 'Configured' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Configuration Notes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• API credentials are configured via environment variables</li>
                  <li>• Webhook URL should be set to: {process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook</li>
                  <li>• Make sure to verify webhook in Facebook Business Manager</li>
                  <li>• Test phone number should be added to WhatsApp Business account</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Test WhatsApp Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Test Phone Number</Label>
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="628123456789"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter phone number in international format (without +)
                </p>
              </div>

              <Button
                onClick={testWhatsAppConnection}
                disabled={loading || !testPhone}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Test Message'}
              </Button>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Test Guidelines:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Use a phone number that's registered with WhatsApp</li>
                  <li>• Phone number should be added to your WhatsApp Business account</li>
                  <li>• Check WhatsApp Business API logs for delivery status</li>
                  <li>• Test messages may take a few seconds to arrive</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
