import { type FileObject } from "@/types";
import { apiSlice } from "@/state/api/apiSlice";

const contributionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addContribution: builder.mutation({
      query: ({ contribution }) => ({
        url: "/contributions/",
        method: "POST",
        body: contribution,
      }),
    }),
    editContribution: builder.mutation({
      query: ({ contribution, id, user }) => ({
        url: `/contributions/${id}/`,
        method: "PUT",
        body: contribution,
        params: { user },
      }),
    }),
    deleteContribution: builder.mutation({
      query: ({ id }) => ({
        url: `/contributions/${id}/`,
        method: "DELETE",
      }),
    }),
    changeContributionStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contributions/${id}/status/`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Contributions"],
    }),
    addFileContribution: builder.mutation({
      query: ({ contribution, user, files }) => {
        const formData = new FormData();
        files.forEach((file: FileObject, index: number) => {
          formData.append(`file_${index}`, file);
          formData.append(`identifier_${index}`, file.identifier);
          formData.append(`name_${index}`, file.name);
          formData.append(`size_${index}`, file.size.toString());
          formData.append(`type_${index}`, file.type);
        });

        return {
          url: "/files/",
          method: "POST",
          body: formData,
          params: { contribution, user },
        };
      },
    }),
    getAllFileContribution: builder.query({
      query: ({ contribution }) => ({
        url: "/files/",
        params: { contribution },
      }),
    }),
  }),
});

export const {
  useAddContributionMutation,
  useEditContributionMutation,
  useDeleteContributionMutation,
  useChangeContributionStatusMutation,
  useAddFileContributionMutation,
  useGetAllFileContributionQuery,
} = contributionApiSlice;
