"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import RecordComment from "@/components/Content/Record/RecordComment";
import RecordMessage from "@/components/Content/Record/RecordMessage";
import { UserIcon } from "@/components/Icons/";
import { FileChip, FilesContainer } from "@/components/Utils/Styles";
import { maxFiles, statusColors, statusIcons, statuses } from "@/constants";
import { CardType, StatusType, ToolType, UserType } from "@/enums";
import { enableInteraction, getFilterFormattedText } from "@/lib";
import { useFile } from "@/provider";
import { type FileObject } from "@/types";
import {
  useChangeContributionStatusMutation,
  useGetAllFileContributionQuery,
} from "@/state/contribution/contributionApiSlice";
import { setPreviewRecord } from "@/state/contribution/contributionSlice";
import { changeCard, changeTool } from "@/state/map/mapSlice";
import { changeSelectedRecord, toggleIsExpanded } from "@/state/record/recordSlice";
import { type RootState } from "@/state/store";
import { setPreviewGeometries } from "@/state/tool/toolSlice";

const RecordPreview = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentSelectedRecord = useSelector((state: RootState) => state.record.selectedRecord);
  const currentIsExpanded = useSelector((state: RootState) => state.record.isExpanded);
  const currentAuthenticatedUser = useSelector((state: RootState) => state.user.authenticatedUser);
  const IconComponent = currentSelectedRecord ? statusIcons[currentSelectedRecord.status] : null;
  const color = currentSelectedRecord ? statusColors[currentSelectedRecord.status] : null;

  const [changeContributionStatus, { isLoading: isStatusLoading }] = useChangeContributionStatusMutation();
  const { files, setFiles } = useFile();
  const [loadingButton, setLoadingButton] = useState<Exclude<StatusType, StatusType.ALL | StatusType.PENDING> | null>(
    null,
  );

  const {
    data: fileObjects,
    isLoading: isFileLoading,
    isFetching: isFileFetching,
  } = useGetAllFileContributionQuery(
    { contribution: currentSelectedRecord?.id },
    { skip: !currentSelectedRecord?.id, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (isFileLoading || isFileFetching) return;

    if (fileObjects) {
      const result: FileObject[] = fileObjects.map((item: any) => {
        const { file_identifier, file_name, file_size, file_type, file, ...rest } = item;

        return {
          ...rest,
          identifier: file_identifier,
          name: file_name,
          size: file_size,
          type: file_type,
          url: file,
        } as FileObject;
      });

      setFiles(result);
    }
  }, [fileObjects]);

  const handleChipClick = (file: FileObject) => {
    if (file.url) {
      // If the file already has a URL, open it directly
      window.open(file.url, "_blank");

      return;
    }

    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file);

    // Open the URL in a new tab
    window.open(fileUrl, "_blank");

    // Clean up the URL object.
    requestAnimationFrame(() => {
      URL.revokeObjectURL(fileUrl);
    });
  };

  return (
    <Box className="w-[50%] flex flex-col min-w-0">
      {!currentSelectedRecord ? (
        <Box className="flex items-center justify-center h-full">
          <Typography className="text-tertiary">Choose a record to preview its information.</Typography>
        </Box>
      ) : (
        <Box className="h-full flex flex-col">
          <Box className="flex-none">
            <Stack direction="row" mb={2} justifyContent="space-between">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography className="!font-bold !text-4xl text-tertiary">{currentSelectedRecord.title}</Typography>
                  <Stack direction="row">
                    <Tooltip title="Update Record" placement="top">
                      <IconButton
                        size="large"
                        onClick={() => {
                          dispatch(setPreviewGeometries(currentSelectedRecord));
                          dispatch(setPreviewRecord(currentSelectedRecord));
                          dispatch(changeCard(CardType.CONTRIBUTE));
                          dispatch(changeTool(ToolType.DRAW));
                          enableInteraction(map);
                        }}
                      >
                        <OpenInNewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Expand Record" placement="top">
                      <IconButton size="large" onClick={() => dispatch(toggleIsExpanded())}>
                        {currentIsExpanded ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Close Record" placement="top">
                      <IconButton
                        size="large"
                        onClick={() => {
                          dispatch(changeSelectedRecord(null));
                          if (currentIsExpanded) dispatch(toggleIsExpanded());
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
                <Typography className="text-quaternary">{currentSelectedRecord.address}</Typography>
              </Box>

              <Chip
                label={currentSelectedRecord.status}
                icon={IconComponent ? <IconComponent /> : undefined}
                size="small"
                sx={{
                  "&.MuiChip-root": {
                    bgcolor: color,
                    color: "var(--background)",
                  },
                  "& .MuiChip-icon": {
                    color: "var(--background)",
                  },
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1} mb={3} alignItems="center">
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: "transparent",
                }}
              >
                <UserIcon className="text-secondary w-[24px] h-[24px]" />
              </Avatar>
              <Typography className="text-tertiary">{currentSelectedRecord.author.first_name}</Typography>
              <Typography className="text-tertiary" sx={{ mx: 1 }}>
                |
              </Typography>
              <Typography className="text-tertiary">
                {new Date(currentSelectedRecord.date_published).toLocaleString()}
              </Typography>
            </Stack>
          </Box>
          <Box className="flex-[1.5] overflow-y-auto">
            <Stack direction="row" spacing={1} mb={2} alignItems="center">
              <Typography className="!font-bold !text-xl text-tertiary" gutterBottom>
                {currentSelectedRecord.crop_element
                  ? getFilterFormattedText(currentSelectedRecord.crop_element.code)
                  : currentSelectedRecord.crop.name}
              </Typography>

              {!(currentSelectedRecord.crop_element?.published ?? currentSelectedRecord.crop.published) && (
                <Chip
                  label="New Crop"
                  size="small"
                  sx={{
                    "&.MuiChip-root": {
                      bgcolor: "var(--primary)",
                      color: "var(--background)",
                    },
                  }}
                />
              )}
            </Stack>

            <Box className="!mb-4">
              <Typography className="text-tertiary !mb-4">{currentSelectedRecord.description}</Typography>
              <Stack direction="column" spacing={1}>
                <Typography className="!font-bold text-tertiary">Potential Suitability:</Typography>
                <Box
                  className="flex items-center justify-center rounded-full"
                  sx={{
                    width: "fit-content",
                    padding: "4px 8px",
                    backgroundColor: currentSelectedRecord.suitability_level.color,
                  }}
                >
                  <Typography className="!font-bold !text-sm text-background">
                    {currentSelectedRecord.suitability_level.name}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {files.length > 0 && (
              <Box>
                <Typography className="!font-bold text-tertiary">
                  Uploaded References ({files.length}/{maxFiles}):
                </Typography>

                <FilesContainer>
                  {files.map((file) => (
                    <FileChip
                      key={file.identifier}
                      label={file.name}
                      onClick={() => handleChipClick(file)}
                      deleteIcon={<DeleteIcon className="!text-secondary" />}
                      variant="outlined"
                    />
                  ))}
                </FilesContainer>
              </Box>
            )}

            {currentSelectedRecord.contributors.length > 0 && (
              <Box className="!mt-4">
                <Typography className="!font-bold text-tertiary !mb-2">Contributors: </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {currentSelectedRecord.contributors.map((contributor) => (
                    <Chip
                      key={contributor.id}
                      label={<Typography className="!text-sm text-tertiary">{contributor.first_name}</Typography>}
                      size="small"
                      avatar={
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: "transparent",
                          }}
                        >
                          <UserIcon className="text-secondary w-[24px] h-[24px]" />
                        </Avatar>
                      }
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Typography className="!text-sm text-quaternary !mt-8">
              Last Modified: {new Date(currentSelectedRecord.last_modified).toLocaleString()}
            </Typography>
          </Box>
          {!currentIsExpanded && <Divider sx={{ my: 3 }} />}
          {!currentIsExpanded && <RecordComment />}
          {!currentIsExpanded && <RecordMessage />}

          {currentAuthenticatedUser?.role === UserType.ADMIN && (
            <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
              <Button
                variant="contained"
                className="!rounded-full !text-base"
                sx={{
                  backgroundColor: statusColors[StatusType.APPROVED],
                  color: "var(--background)",
                  padding: "14px 12px",
                  minWidth: "120px",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
                onClick={async () => {
                  setLoadingButton(StatusType.APPROVED);
                  await changeContributionStatus({
                    id: currentSelectedRecord.id,
                    status: statuses[StatusType.APPROVED],
                  })
                    .unwrap()
                    .then(() => {
                      setLoadingButton(null);
                      dispatch(changeSelectedRecord({ ...currentSelectedRecord, status: StatusType.APPROVED }));
                    });
                }}
                disabled={isStatusLoading || currentSelectedRecord.status !== StatusType.PENDING}
              >
                {isStatusLoading && loadingButton === StatusType.APPROVED ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Approve"
                )}
              </Button>
              <Button
                variant="contained"
                className="!rounded-full !text-base"
                sx={{
                  backgroundColor: statusColors[StatusType.REJECTED],
                  color: "var(--background)",
                  padding: "14px 12px",
                  minWidth: "120px",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
                onClick={async () => {
                  setLoadingButton(StatusType.REJECTED);
                  await changeContributionStatus({
                    id: currentSelectedRecord.id,
                    status: statuses[StatusType.REJECTED],
                  })
                    .unwrap()
                    .then(() => {
                      setLoadingButton(null);
                      dispatch(changeSelectedRecord({ ...currentSelectedRecord, status: StatusType.REJECTED }));
                    });
                }}
                disabled={isStatusLoading || currentSelectedRecord.status !== StatusType.PENDING}
              >
                {isStatusLoading && loadingButton === StatusType.REJECTED ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Reject"
                )}
              </Button>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default RecordPreview;
