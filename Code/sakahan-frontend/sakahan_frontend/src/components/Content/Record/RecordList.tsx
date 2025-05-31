"use client";

import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import ChipField from "@/components/Utils/Fields/ChipField";
import RecordField from "@/components/Utils/Fields/RecordField";
import { pageSize } from "@/constants";
import { RecordType, StatusType } from "@/enums";
import { computeBoundingBox, convertToLatLng } from "@/lib";
import { type Record } from "@/types";
import { useGetAllContributionQuery } from "@/state/record/recordApiSlice";
import { changeSelectedPage, changeSelectedRecord, changeSelectedTab } from "@/state/record/recordSlice";
import { type RootState } from "@/state/store";

const RecordList = () => {
  const dispatch = useDispatch();
  const currentSelectedTab = useSelector((state: RootState) => state.record.selectedTab);
  const currentSelectedPage = useSelector((state: RootState) => state.record.selectedPage);
  const currentSelectedFilter = useSelector((state: RootState) => state.record.selectedFilter);
  const currentAuthenticatedUser = useSelector((state: RootState) => state.user.authenticatedUser);

  const { data, isLoading, isFetching } = useGetAllContributionQuery(
    {
      filter: currentSelectedFilter,
      tab: currentSelectedTab,
      page: currentSelectedPage,
      user: currentAuthenticatedUser!.id,
    },
    { refetchOnMountOrArgChange: true },
  );

  // Check if data exists and has the necessary fields
  const { results = [], count = 0 } = data ?? {};

  return (
    <Box className="w-[50%] flex flex-col min-w-0">
      {/* Fixed header section */}
      <Box className="flex-none">
        {/* Record Types */}
        <Stack direction="column" className="mb-4">
          <Tabs
            value={currentSelectedTab}
            onChange={(_, value) => {
              dispatch(changeSelectedTab(value));
              dispatch(changeSelectedPage(1));
            }}
            variant="fullWidth"
          >
            <Tab
              value={RecordType.MY_CONTRIBUTIONS}
              label={<Typography className="!font-bold !text-xl">My Contributions</Typography>}
            />
            <Tab
              value={RecordType.OTHER_CONTRIBUTIONS}
              label={<Typography className="!font-bold !text-xl">Other Contributions</Typography>}
            />
          </Tabs>
        </Stack>

        {/* Record Filters */}
        <Stack direction="row" spacing={2} className="mb-4">
          {Object.values(StatusType).map((status) => (
            <ChipField key={status} label={status} />
          ))}
        </Stack>
      </Box>

      {/* Scrollable content area */}
      <Box className="flex-1 overflow-hidden relative">
        {isLoading || isFetching ? (
          <Box className="flex items-center justify-center absolute inset-0 bottom-16">
            <CircularProgress size={40} color="inherit" />
          </Box>
        ) : (
          <Box className="overflow-y-auto absolute inset-0 bottom-16 pl-2 pr-4">
            {results.length === 0 ? (
              <Box className="flex items-center justify-center h-full">
                <Typography className="text-tertiary">Looks like there&apos;s nothing here yet.</Typography>
              </Box>
            ) : (
              <Stack spacing={2} className="pt-2 pb-8">
                {results!.map((item: any) => {
                  const { geometries, ...rest } = item;
                  const { gridcode, ...others } = rest.suitability_level;
                  const suitability_level = { ...others, code: gridcode };

                  const record: Record = {
                    ...rest,
                    suitability_level: suitability_level,
                    geom: convertToLatLng(geometries),
                    boundingbox: computeBoundingBox(geometries),
                  };

                  return (
                    <RecordField
                      key={record.id}
                      record={record}
                      onClick={() => {
                        dispatch(changeSelectedRecord(record));
                      }}
                    />
                  );
                })}
              </Stack>
            )}
          </Box>
        )}

        {/* Sticky Pagination */}
        <Box className="absolute bottom-0 left-0 right-0 pt-4 border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <Box className="flex justify-center">
            <Pagination
              count={Math.ceil(count / pageSize)}
              variant="outlined"
              shape="rounded"
              page={currentSelectedPage}
              onChange={(_, page) => dispatch(changeSelectedPage(page))}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RecordList;
