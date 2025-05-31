import { apiSlice } from "@/state/api/apiSlice";

const mapApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGeometryFeatureReference: builder.query({
      query: (id) => ({
        url: `/contributions/${id}/`,
      }),
    }),
    getAllSuitabilityLevel: builder.query({
      query: () => ({
        url: "/suitability-levels/",
      }),
    }),
    getAllCrop: builder.query({
      query: (type) => ({
        url: `${type}/crops/`,
      }),
    }),
    getAllCropElement: builder.query({
      query: ({ type, category }) => ({
        url: `${type}/crops-elements/category/`,
        params: { category },
      }),
    }),
  }),
});

export const {
  useGetGeometryFeatureReferenceQuery,
  useGetAllSuitabilityLevelQuery,
  useGetAllCropQuery,
  useGetAllCropElementQuery,
} = mapApiSlice;
