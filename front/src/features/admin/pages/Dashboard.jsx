import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Home,
  Users,
  TrendingUp,
  AlertCircle,
  Settings,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useGetAdminProperties, useGetUsers, useGetRoleRequests, useTriggerMarketUpdate } from "@/features/admin/hooks/useAdmin";
import { LoadingSpinner, ErrorAlert, EmptyState } from "@/shared/components/LoadingAndErrorStates";

/**
 * AdminDashboard - Main admin dashboard with metrics and navigation
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showMetrics, setShowMetrics] = useState(true);

  // Fetch data
  const { data: propertiesData, isLoading: propsLoading, error: propsError } = useGetAdminProperties({
    enabled: true,
  });
  const { data: usersData, isLoading: usersLoading } = useGetUsers({ enabled: true });
  const { data: roleRequestsData } = useGetRoleRequests({ enabled: true });
  const { mutate: triggerMarketUpdate, isPending: updatePending } =
    useTriggerMarketUpdate();

  // Process properties data
  const properties = Array.isArray(propertiesData?.results)
    ? propertiesData.results
    : Array.isArray(propertiesData)
      ? propertiesData
      : [];

  const propertyStats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "ACTIVE").length,
    sold: properties.filter((p) => p.status === "SOLD").length,
    underReview: properties.filter((p) => p.status === "UNDER_REVIEW").length,
    inactive: properties.filter((p) => p.status === "INACTIVE").length,
  };

  // Process users data
  const users = Array.isArray(usersData?.results)
    ? usersData.results
    : Array.isArray(usersData)
      ? usersData
      : [];

  const userStats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN" || u.user_role === "ADMIN").length,
    agents: users.filter((u) => u.role === "AGENT" || u.user_role === "AGENT").length,
    owners: users.filter((u) => u.role === "OWNER" || u.user_role === "OWNER").length,
    customers: users.filter(
      (u) => !["ADMIN", "AGENT", "OWNER"].includes(u.role || u.user_role)
    ).length,
  };

  // Process role requests data
  const roleRequests = Array.isArray(roleRequestsData?.results)
    ? roleRequestsData.results
    : Array.isArray(roleRequestsData)
      ? roleRequestsData
      : [];

  const pendingRequests = roleRequests.filter((r) => r.status === "PENDING").length;

  // Chart data for property status distribution
  const propertyStatusChart = [
    { name: "Active", value: propertyStats.active, fill: "#10b981" },
    { name: "Sold", value: propertyStats.sold, fill: "#ef4444" },
    { name: "Under Review", value: propertyStats.underReview, fill: "#eab308" },
    { name: "Inactive", value: propertyStats.inactive, fill: "#6b7280" },
  ];

  // Chart data for user roles distribution
  const userRoleChart = [
    { name: "Admins", value: userStats.admins, fill: "#3b82f6" },
    { name: "Agents", value: userStats.agents, fill: "#8b5cf6" },
    { name: "Owners", value: userStats.owners, fill: "#ec4899" },
    { name: "Customers", value: userStats.customers, fill: "#f59e0b" },
  ];

  if (propsLoading || usersLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (propsError) {
    return <ErrorAlert error={propsError} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage properties, users, and system settings
          </p>
        </div>
        <Button
          onClick={() => setShowMetrics(!showMetrics)}
          variant="outline"
        >
          {showMetrics ? "Hide" : "Show"} Metrics
        </Button>
      </div>

      {/* Quick Stats */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {propertyStats.total}
              </div>
              <p className="text-xs text-green-600 mt-1">
                ✓ {propertyStats.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {userStats.total}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {userStats.agents} agents, {userStats.owners} owners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sold Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {propertyStats.sold}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Completed transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {pendingRequests}
              </div>
              <Button
                size="sm"
                variant="link"
                className="px-0 mt-1"
                onClick={() => navigate("/dashboard/admin/role-requests")}
              >
                View Requests →
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {showMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Property Status Distribution</CardTitle>
              <CardDescription>
                Current breakdown of property statuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyStatusChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyStatusChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Roles Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Roles Distribution</CardTitle>
              <CardDescription>Breakdown of user types in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userRoleChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userRoleChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/dashboard/admin/properties")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home size={20} />
              Manage Properties
            </CardTitle>
            <CardDescription>View and manage all properties</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Go to Properties
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/dashboard/admin/users")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Manage Users
            </CardTitle>
            <CardDescription>View and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Go to Users
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/dashboard/admin/role-requests")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Role Requests
            </CardTitle>
            <CardDescription>
              {pendingRequests > 0 && (
                <Badge variant="destructive">{pendingRequests} Pending</Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Review Requests
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/dashboard/admin/market-update")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Market Update
            </CardTitle>
            <CardDescription>Trigger pricing engine update</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Update Market Data
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              System Settings
            </CardTitle>
            <CardDescription>Configure system parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle size={20} />
              System Logs
            </CardTitle>
            <CardDescription>View system activity logs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
