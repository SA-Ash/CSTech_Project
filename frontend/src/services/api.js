import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Agent', 'Lead', 'Dashboard'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    getAgents: builder.query({
      query: () => '/agents',
      providesTags: ['Agent'],
    }),
    createAgent: builder.mutation({
      query: (agent) => ({
        url: '/agents',
        method: 'POST',
        body: agent,
      }),
      invalidatesTags: ['Agent'],
    }),
    updateAgent: builder.mutation({
      query: ({ id, ...agent }) => ({
        url: `/agents/${id}`,
        method: 'PUT',
        body: agent,
      }),
      invalidatesTags: ['Agent'],
    }),
    deleteAgent: builder.mutation({
      query: (id) => ({
        url: `/agents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Agent'],
    }),

    getLeads: builder.query({
      query: (params) => ({
        url: '/leads',
        params,
      }),
      providesTags: ['Lead'],
    }),
    getLeadsByAgent: builder.query({
      query: () => '/leads/by-agent',
      providesTags: ['Lead'],
    }),
    uploadLeads: builder.mutation({
      query: (formData) => ({
        url: '/leads/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Lead', 'Dashboard'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetAgentsQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useGetLeadsQuery,
  useGetLeadsByAgentQuery,
  useUploadLeadsMutation,
} = api;
