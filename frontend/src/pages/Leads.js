import React, { useState } from 'react';
import { useGetLeadsQuery, useGetLeadsByAgentQuery } from '../services/api';
import { FiFilter, FiDownload, FiPhone, FiUser, FiFileText, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';

const Leads = () => {
  const [viewMode, setViewMode] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery({
    agentId: selectedAgent,
    status: selectedStatus,
  });
  
  const { data: leadsByAgentData, isLoading: byAgentLoading } = useGetLeadsByAgentQuery();

  const leads = leadsData?.leads || [];
  const leadsByAgent = leadsByAgentData?.data || [];

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    converted: 'bg-purple-100 text-purple-800',
  };

  const exportToCSV = () => {
    const csvContent = [
      ['First Name', 'Phone', 'Notes', 'Agent', 'Status', 'Created Date'],
      ...leads.map(lead => [
        lead.firstName,
        lead.phone,
        lead.notes || '',
        lead.assignedTo?.name || '',
        lead.status,
        format(new Date(lead.createdAt), 'yyyy-MM-dd'),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (leadsLoading || byAgentLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Leads Management</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <FiDownload className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setViewMode('all')}
              className={`px-6 py-3 font-medium ${
                viewMode === 'all'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Leads
            </button>
            <button
              onClick={() => setViewMode('by-agent')}
              className={`px-6 py-3 font-medium ${
                viewMode === 'by-agent'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              By Agent
            </button>
          </div>
        </div>

        {viewMode === 'all' ? (
          <>
            {/* Filters */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex flex-wrap gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.firstName}</p>
                          <p className="text-sm text-gray-500">{lead.notes?.substring(0, 50)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FiPhone className="mr-2 text-gray-400" />
                          {lead.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {lead.assignedTo?.name || 'Unassigned'}
                            </p>
                            <p className="text-xs text-gray-500">{lead.assignedTo?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {leads.length === 0 && (
                <div className="text-center py-12">
                  <FiFileText className="mx-auto text-gray-400" size={48} />
                  <p className="mt-4 text-gray-600">No leads found</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* By Agent View */
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {leadsByAgent.map((agentData) => (
                <div key={agentData.agent.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <FiUser className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{agentData.agent.name}</h3>
                        <p className="text-sm text-gray-500">{agentData.agent.email}</p>
                      </div>
                    </div>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {agentData.totalCount} leads
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {agentData.leads.map((lead, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{lead.firstName}</p>
                          <p className="text-xs text-gray-500">{lead.phone}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {leadsByAgent.length === 0 && (
              <div className="text-center py-12">
                <FiUsers className="mx-auto text-gray-400" size={48} />
                <p className="mt-4 text-gray-600">No agents with leads</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
