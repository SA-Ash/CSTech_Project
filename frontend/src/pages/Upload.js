import React, { useState } from 'react';
import { useUploadLeadsMutation } from '../services/api';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiFile, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadLeads, { isLoading }] = useUploadLeadsMutation();
  const [uploadResult, setUploadResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      toast.error('Invalid file type. Please upload CSV, XLSX, or XLS files only.');
      return;
    }
    
    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadLeads(formData).unwrap();
      setUploadResult(result);
      toast.success('File uploaded and leads distributed successfully!');
      setFile(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Upload failed');
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'FirstName,Phone,Notes\nJohn,9876543210,Interested in premium package\nSarah,9876543211,New lead from website';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Upload Leads</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload a CSV, XLSX, or XLS file containing lead information</li>
          <li>• Required columns: FirstName, Phone, Notes (optional)</li>
          <li>• Leads will be automatically distributed equally among active agents</li>
          <li>• Maximum file size: 10MB</li>
        </ul>
        <button
          onClick={downloadTemplate}
          className="mt-3 text-blue-600 underline text-sm hover:text-blue-800"
        >
          Download CSV template
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <FiUploadCloud className="mx-auto text-gray-400" size={48} />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Drag and drop your file here, or
          </p>
          <label className="mt-2 inline-block">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer inline-block">
              Browse Files
            </span>
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Supported formats: CSV, XLSX, XLS
          </p>
        </div>

        {file && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <FiFile className="text-indigo-600 mr-3" size={24} />
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setUploadResult(null);
              }}
              className="text-red-600 hover:bg-red-50 p-2 rounded"
            >
              <FiXCircle size={20} />
            </button>
          </div>
        )}

        {file && !uploadResult && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FiUploadCloud className="mr-2" />
                  Upload and Distribute
                </>
              )}
            </button>
          </div>
        )}

        {uploadResult && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiCheckCircle className="text-green-600 mt-1 mr-3" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900">Upload Successful!</h4>
                <p className="text-green-800 mt-1">
                  Total leads uploaded: {uploadResult.summary.totalLeads}
                </p>
                <p className="text-green-800">
                  Distributed among {uploadResult.summary.totalAgents} agents
                </p>
                
                <div className="mt-3 space-y-2">
                  <p className="font-medium text-green-900">Distribution Summary:</p>
                  {uploadResult.summary.distribution.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-green-800 bg-white rounded p-2">
                      <span>{item.agentName}</span>
                      <span className="font-medium">{item.assignedCount} leads</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload