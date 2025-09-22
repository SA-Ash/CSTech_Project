import React, { useState } from "react";
import {
  useGetAgentsQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
} from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiUser, FiUsers } from "react-icons/fi";

const Agents = () => {
  const { data, isLoading } = useGetAgentsQuery();
  const [createAgent] = useCreateAgentMutation();
  const [updateAgent] = useUpdateAgentMutation();
  const [deleteAgent] = useDeleteAgentMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    countryCode: "+91",
    mobileNumber: "",
  });

  const agents = data?.agents || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        await updateAgent({ id: editingAgent._id, ...formData }).unwrap();
        toast.success("Agent updated successfully");
      } else {
        await createAgent(formData).unwrap();
        toast.success("Agent created successfully");
      }
      closeModal();
    } catch (error) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      password: "",
      countryCode: agent.countryCode || "+91",
      mobileNumber: agent.mobileNumber,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await deleteAgent(id).unwrap();
        toast.success("Agent deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || "Delete failed");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAgent(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      countryCode: "+91",
      mobileNumber: "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Agents Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Agent
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent._id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <FiUser className="text-indigo-600" size={24} />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(agent)}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(agent._id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-lg text-gray-800">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{agent.email}</p>
            <p className="text-sm text-gray-600 mt-1">
              {agent.countryCode} {agent.mobileNumber}
            </p>
            <div className="mt-4 pt-4 border-t">
              <span
                className={`inline-block px-3 py-1 text-xs rounded-full ${
                  agent.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {agent.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiUsers className="mx-auto text-gray-400" size={48} />
          <p className="mt-4 text-gray-600">
            No agents found. Add your first agent!
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAgent ? "Edit Agent" : "Add New Agent"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {!editingAgent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobileNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <FiSave className="mr-2" />
                  {editingAgent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
