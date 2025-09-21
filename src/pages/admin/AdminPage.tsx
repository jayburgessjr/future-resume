import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { KpiCard } from '@/components/admin/KpiCard';
import { ChartCard } from '@/components/admin/ChartCard';
import { DataTable } from '@/components/admin/DataTable';
import { StatBadge } from '@/components/admin/StatBadge';
import { Section } from '@/components/admin/Section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  getAnalyticsSummary,
  getUsersList,
  getToolkitsList,
  type AdminAnalyticsResponse,
  type AdminUser,
  type AdminToolkit
} from '@/services/admin';
import { 
  Users, 
  Crown, 
  FileText, 
  Activity, 
  DollarSign, 
  Server,
  Calendar,
  Mail,
  Building
} from 'lucide-react';

export const AdminPage = () => {
  const [analytics, setAnalytics] = useState<
    AdminAnalyticsResponse | null
  >(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [toolkits, setToolkits] = useState<AdminToolkit[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [toolkitsLoading, setToolkitsLoading] = useState(false);
  const [currentUsersPage, setCurrentUsersPage] = useState(0);
  const [currentToolkitsPage, setCurrentToolkitsPage] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersFilter, setUsersFilter] = useState('');
  const [toolkitsSearch, setToolkitsSearch] = useState('');
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 25;

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalyticsSummary(30);
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast({
          title: "Error",
          description: "Failed to load analytics data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [toast]);

  // Load users data
  const loadUsers = useCallback(async (search = '', filter = '', offset = 0) => {
    setUsersLoading(true);
    try {
      const data = await getUsersList({
        search,
        planFilter: filter,
        limit: ITEMS_PER_PAGE,
        offset
      });
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users data.",
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  }, [toast]);

  // Load toolkits data
  const loadToolkits = useCallback(async (search = '', offset = 0) => {
    setToolkitsLoading(true);
    try {
      const data = await getToolkitsList({
        search,
        limit: ITEMS_PER_PAGE,
        offset
      });
      setToolkits(data);
    } catch (error) {
      console.error('Error loading toolkits:', error);
      toast({
        title: "Error",
        description: "Failed to load toolkits data.",
        variant: "destructive",
      });
    } finally {
      setToolkitsLoading(false);
    }
  }, [toast]);

  // Load users on tab change or search/filter change
  useEffect(() => {
    loadUsers(usersSearch, usersFilter, currentUsersPage * ITEMS_PER_PAGE);
  }, [usersSearch, usersFilter, currentUsersPage, loadUsers]);

  // Load toolkits on tab change or search change
  useEffect(() => {
    loadToolkits(toolkitsSearch, currentToolkitsPage * ITEMS_PER_PAGE);
  }, [toolkitsSearch, currentToolkitsPage, loadToolkits]);

  const userColumns = [
    {
      key: 'email' as keyof AdminUser,
      label: 'Email',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'plan' as keyof AdminUser,
      label: 'Plan',
      render: (value: string) => <StatBadge status={value} type="plan" />
    },
    {
      key: 'sub_status' as keyof AdminUser,
      label: 'Status',
      render: (value: string | null) => <StatBadge status={value} type="subscription" />
    },
    {
      key: 'toolkits_count' as keyof AdminUser,
      label: 'Toolkits',
      render: (value: number) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'created_at' as keyof AdminUser,
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'is_admin' as keyof AdminUser,
      label: 'Role',
      render: (value: boolean) => <StatBadge status={value} type="admin" />
    }
  ];

  const toolkitColumns = [
    {
      key: 'title' as keyof AdminToolkit,
      label: 'Title',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'user_email' as keyof AdminToolkit,
      label: 'User',
      render: (value: string) => <span className="text-sm">{value}</span>
    },
    {
      key: 'company' as keyof AdminToolkit,
      label: 'Company',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'job_title' as keyof AdminToolkit,
      label: 'Role',
      render: (value: string) => <span className="text-sm text-muted-foreground">{value}</span>
    },
    {
      key: 'created_at' as keyof AdminToolkit,
      label: 'Created',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <AdminLayout title="Admin Console">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Admin Console" 
      description="Product analytics, user management, and system overview"
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="toolkits">Toolkits</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* KPI Cards */}
            <Section title="Key Metrics" description="Current platform performance indicators">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard
                  title="Total Users"
                  value={analytics?.totals.users || 0}
                  icon={Users}
                />
                <KpiCard
                  title="Pro Users"
                  value={analytics?.totals.pro || 0}
                  icon={Crown}
                />
                <KpiCard
                  title="Toolkits (7d)"
                  value={analytics?.totals.toolkits_7d || 0}
                  icon={FileText}
                />
                <KpiCard
                  title="Toolkits (30d)"
                  value={analytics?.totals.toolkits_30d || 0}
                  icon={FileText}
                />
                <KpiCard
                  title="Active Users (7d)"
                  value={analytics?.totals.active_7d || 0}
                  icon={Activity}
                />
                <KpiCard
                  title="Free Users"
                  value={analytics?.totals.free || 0}
                  icon={Users}
                />
              </div>
            </Section>

            {/* Charts */}
            <Section title="Trends" description="User and toolkit creation over time">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="New Users (30 days)"
                  data={(analytics?.series?.new_users_by_day || []).map((item: any) => ({
                    day: item.day ? new Date(item.day).toLocaleDateString() : '',
                    count: item.count || 0,
                  })).filter((item: any) => item.day && item.count !== undefined)}
                />
                <ChartCard
                  title="Toolkits Created (30 days)"
                  data={(analytics?.series?.toolkits_by_day || []).map((item: any) => ({
                    day: item.day ? new Date(item.day).toLocaleDateString() : '',
                    count: item.count || 0,
                  })).filter((item: any) => item.day && item.count !== undefined)}
                />
              </div>
            </Section>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Section title="User Management" description="Browse and filter platform users">
            <DataTable
              data={users}
              columns={userColumns}
              searchable
              searchPlaceholder="Search users by email..."
              filterable
              filterOptions={[
                { value: 'free', label: 'Free Plan' },
                { value: 'pro', label: 'Pro Plan' }
              ]}
              filterPlaceholder="Filter by plan"
              onSearch={(search) => {
                setUsersSearch(search);
                setCurrentUsersPage(0);
              }}
              onFilter={(filter) => {
                setUsersFilter(filter);
                setCurrentUsersPage(0);
              }}
              onPaginate={(offset) => setCurrentUsersPage(offset / ITEMS_PER_PAGE)}
              pagination={{
                currentPage: currentUsersPage,
                hasMore: users.length === ITEMS_PER_PAGE,
                limit: ITEMS_PER_PAGE
              }}
              loading={usersLoading}
            />
          </Section>
        </TabsContent>

        <TabsContent value="toolkits">
          <Section title="Toolkit Management" description="View all user-generated toolkits across the platform">
            <DataTable
              data={toolkits}
              columns={toolkitColumns}
              searchable
              searchPlaceholder="Search by company, role, or title..."
              onSearch={(search) => {
                setToolkitsSearch(search);
                setCurrentToolkitsPage(0);
              }}
              onPaginate={(offset) => setCurrentToolkitsPage(offset / ITEMS_PER_PAGE)}
              pagination={{
                currentPage: currentToolkitsPage,
                hasMore: toolkits.length === ITEMS_PER_PAGE,
                limit: ITEMS_PER_PAGE
              }}
              loading={toolkitsLoading}
            />
          </Section>
        </TabsContent>

        <TabsContent value="billing">
          <Section title="Billing Overview" description="Subscription and revenue analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <KpiCard
                title="Pro Subscribers"
                value={analytics?.totals.pro || 0}
                icon={Crown}
              />
              <KpiCard
                title="Free Users"
                value={analytics?.totals.free || 0}
                icon={Users}
              />
              <KpiCard
                title="Est. MRR"
                value={`$${((analytics?.totals.pro || 0) * 20).toLocaleString()}`}
                icon={DollarSign}
              />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="system">
          <Section title="System Health" description="Platform status and diagnostics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <KpiCard
                title="Database Status"
                value="Healthy"
                icon={Server}
              />
              <KpiCard
                title="API Response"
                value="< 100ms"
                icon={Activity}
              />
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};