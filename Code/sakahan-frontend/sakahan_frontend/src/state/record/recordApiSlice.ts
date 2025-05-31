import { apiSlice } from "@/state/api/apiSlice";

const recordApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllContribution: builder.query({
      query: ({ filter, tab, page, user }) => ({
        url: "/contributions/",
        params: { filter, tab, page, user },
      }),
      providesTags: ["Contributions"],
    }),
    getAllComment: builder.query({
      query: ({ contribution }) => ({
        url: "/comments/",
        params: { contribution },
      }),
    }),
    addComment: builder.mutation({
      query: ({ content, contribution, author }) => ({
        url: "/comments/",
        method: "POST",
        body: { content, contribution, author },
      }),
    }),
  }),
});

export const { useGetAllContributionQuery, useGetAllCommentQuery, useAddCommentMutation } = recordApiSlice;
