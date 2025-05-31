"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CloseIcon, ContributeIcon, RecordIcon, UserIcon } from "@/components/Icons/";
import { FileChip, FilesContainer } from "@/components/Utils/Styles";
import { maxFiles, statusColors, statusIcons } from "@/constants";
import { CardType, StatusType, ToolType } from "@/enums";
import {
  computeBoundingBox,
  convertToLatLng,
  disableInteraction,
  enableInteraction,
  getFilterFormattedText,
} from "@/lib";
import { useFile } from "@/provider";
import type { FileObject, Record } from "@/types";
import { useGetAllFileContributionQuery } from "@/state/contribution/contributionApiSlice";
import { setPreviewRecord } from "@/state/contribution/contributionSlice";
import { useGetGeometryFeatureReferenceQuery } from "@/state/map/mapApiSlice";
import { changeCard, changeSelectedGeometryFeature, changeTool, resetOtherMenu } from "@/state/map/mapSlice";
import { populateRecord, resetConfiguration } from "@/state/record/recordSlice";
import { type RootState } from "@/state/store";
import { setPreviewGeometries } from "@/state/tool/toolSlice";

const GeometryFeatureInfo = () => {
  const map = useMap();
  const dispatch = useDispatch();

  const currentIsAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const currentSelectedGeometryFeature = useSelector((state: RootState) => state.map.selectedGeometryFeature);
  const {
    data: geometryFeatures,
    isLoading: isGeometryFeaturesLoading,
    isFetching: isGeometryFeaturesFetching,
  } = useGetGeometryFeatureReferenceQuery(currentSelectedGeometryFeature?.properties?.reference_id, {
    skip: !currentSelectedGeometryFeature?.properties?.reference_id,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: fileObjects,
    isLoading: isFilesLoading,
    isFetching: isFilesFetching,
  } = useGetAllFileContributionQuery(
    { contribution: currentSelectedGeometryFeature?.properties?.reference_id },
    { skip: !currentSelectedGeometryFeature?.properties?.reference_id, refetchOnMountOrArgChange: true },
  );

  const [record, setRecord] = useState<Record | null>(null);
  const { files, setFiles } = useFile();

  const isLoading = isGeometryFeaturesLoading || isFilesLoading;
  const isFetching = isGeometryFeaturesFetching || isFilesFetching;

  useEffect(() => {
    if (isLoading || isFetching) return;

    if (geometryFeatures) {
      const { geometries, ...rest } = geometryFeatures;
      const { gridcode, ...others } = rest.suitability_level;
      const suitability_level = { ...others, code: gridcode };

      setRecord({
        ...rest,
        suitability_level: suitability_level,
        geom: convertToLatLng(geometries),
        boundingbox: computeBoundingBox(geometries),
      });
    }

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
  }, [geometryFeatures, fileObjects]);

  const IconComponent = record ? statusIcons[record.status] : null;
  const color = record ? statusColors[record.status] : null;

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
    <Box
      className="card relative overflow-auto h-min max-h-[800px] w-[450px] p-8"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Box className="absolute top-0 right-0 mt-4 mr-4">
        <Chip
          label={record?.status}
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
        {record?.status === StatusType.PENDING && currentIsAuthenticated && (
          <IconButton
            onClick={() => {
              setFiles([]);
              dispatch(resetOtherMenu());
              dispatch(setPreviewGeometries(record));
              dispatch(setPreviewRecord(record));
              dispatch(changeCard(CardType.CONTRIBUTE));
              dispatch(changeTool(ToolType.DRAW));
              enableInteraction(map);
            }}
          >
            <ContributeIcon className="text-secondary w-[24px] h-[24px]" />
          </IconButton>
        )}
        {record?.status === StatusType.APPROVED && currentIsAuthenticated && (
          <IconButton
            onClick={() => {
              dispatch(changeCard(CardType.RECORD));
              dispatch(resetOtherMenu());
              dispatch(resetConfiguration());
              dispatch(populateRecord(record));
              enableInteraction(map);
            }}
          >
            <RecordIcon className="text-secondary w-[24px] h-[24px]" />
          </IconButton>
        )}
        <IconButton
          onClick={() => {
            dispatch(changeSelectedGeometryFeature(null));
            enableInteraction(map);
          }}
        >
          <CloseIcon className="text-secondary w-[24px] h-[24px]" />
        </IconButton>
      </Box>

      {isLoading || isFetching ? (
        <Box className="flex items-center justify-center">
          <CircularProgress size={40} color="inherit" />
        </Box>
      ) : (
        record && (
          <Box className="space-y-2 mt-8">
            <Typography
              className="!font-bold !text-3xl text-tertiary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >{`${record.title}`}</Typography>
            <Typography
              className="!text-sm text-quaternary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >{`${record.address}`}</Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 15,
                  height: 15,
                  bgcolor: "transparent",
                }}
              >
                <UserIcon className="text-secondary w-[24px] h-[24px]" />
              </Avatar>
              <Typography className="!text-sm text-tertiary">{record.author.first_name}</Typography>
              <Typography className="!text-sm text-tertiary" sx={{ mx: 1 }}>
                |
              </Typography>
              <Typography className="!text-sm text-tertiary">
                {new Date(record.date_published).toLocaleString()}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" className="!mt-6">
              <Typography className="!font-bold !text-lg text-tertiary" gutterBottom>
                {record.crop_element ? getFilterFormattedText(record.crop_element.code) : record.crop.name}
              </Typography>

              {!(record.crop_element?.published ?? record.crop.published) && (
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
              <Typography className="!text-sm text-tertiary !mb-4">{record.description}</Typography>
              <Stack direction="column" spacing={1}>
                <Typography className="!text-sm !font-bold text-tertiary">Potential Suitability:</Typography>
                <Box
                  className="flex items-center justify-center rounded-full"
                  sx={{
                    width: "fit-content",
                    padding: "4px 8px",
                    backgroundColor: record.suitability_level.color,
                  }}
                >
                  <Typography className="!font-bold !text-xs text-background">
                    {record.suitability_level.name}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {files.length > 0 && (
              <Box>
                <Typography className="!text-sm !font-bold text-tertiary">
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

            {record.contributors.length > 0 && (
              <Box className="!mt-4">
                <Typography className="!font-bold !text-sm text-tertiary !mb-2">Contributors: </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {record.contributors.map((contributor) => (
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

            <Typography className="!text-xs text-quaternary !mt-8">
              Last Modified: {new Date(record.last_modified).toLocaleString()}
            </Typography>
          </Box>
        )
      )}
    </Box>
  );
};

export default GeometryFeatureInfo;
