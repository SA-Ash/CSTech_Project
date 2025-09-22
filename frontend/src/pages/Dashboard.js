import React from 'react';
import { useGetAgentsQuery, useGetLeadsByAgentQuery } from '../services/api';
import { FiUsers, FiFileText, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { data: agentsData, isLoading: agentsLoading } = useGetAgentsQuery();
  const { data: leadsData, isLoading: leadsLoading } = useGetLeadsByAgentQuery();

  const agents = agentsData?.agents || [];
  const leadsByAgent = leadsData?.data || [];

  const stats = [
    {
      title: 'Total Agents',
      value: agents.length,
      icon: FiUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Leads',
      value: leadsByAgent.reduce((acc, curr) => acc + curr.totalCount, 0),
      icon: FiFileText,
      color: 'bg-green-500',
    },
    {
      title: 'Active Agents',
      value: agents.filter(a => a.isActive).length,
      icon: FiActivity,
      color: 'bg-yellow-500',
    },
    {
      title: 'Avg Leads/Agent',
      value: agents.length ? Math.round(leadsByAgent.reduce((acc, curr) => acc + curr.totalCount, 0) / agents.length) : 0,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
    },
  ];

  const chartData = leadsByAgent.map(item => ({
    name: item.agent.name.split(' ')[0],
    leads: item.totalCount,
  }));

  if (agentsLoading || leadsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead Distribution</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Agent Overview</h2>
          <div className="space-y-4">
            {leadsByAgent.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium text-gray-800">{item.agent.name}</p>
                  <p className="text-sm text-gray-500">{item.agent.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{item.totalCount} leads</p>
                </div>
              </div>
            ))}
            {leadsByAgent.length === 0 && (
              <p className="text-gray-500 text-center py-4">No agents with leads yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
