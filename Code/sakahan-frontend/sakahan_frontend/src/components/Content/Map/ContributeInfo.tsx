"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FileUpload from "@/components/Content/Contribute/FileUpload";
import { AddIcon, CloseIcon, MaximizeIcon, MinimizeIcon, RefreshIcon } from "@/components/Icons/";
import SelectField from "@/components/Utils/Fields/SelectField";
import TextAreaField from "@/components/Utils/Fields/TextAreaField";
import { maxAddressLength, maxDescriptionLength, maxTitleLength } from "@/constants";
import { CardType, CategoryType, StatusType, ToolType } from "@/enums";
import {
  disableInteraction,
  enableInteraction,
  getCoordinate,
  getDegree,
  getPathPerimeter,
  getPolygonArea,
} from "@/lib";
import { useFile } from "@/provider";
import {
  changeAddedCrop,
  changeAddedCropElement,
  changeAddress,
  changeCropElementList,
  changeCropList,
  changeDescription,
  changeSelectedCrop,
  changeSelectedCropElement,
  changeSelectedSuitabilityLevel,
  changeSuitabilityLevelList,
  changeTitle,
  populateContributions,
  resetContributions,
  toggleIsCropAdding,
  toggleIsCropElementAdding,
} from "@/state/contribution/contributionSlice";
import { useGetAllCropElementQuery, useGetAllCropQuery, useGetAllSuitabilityLevelQuery } from "@/state/map/mapApiSlice";
import { changeCard, changeTool } from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";
import { resetTools } from "@/state/tool/toolSlice";

const ContributeCard = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentCard = useSelector((state: RootState) => state.map.card);
  const currentTool = useSelector((state: RootState) => state.map.tool);
  const currentDrawingVertices = useSelector((state: RootState) => state.tool.drawingVertices);
  const currentPreviewPolygon = useSelector((state: RootState) => state.tool.previewPolygon);
  const currentIsCropAdding = useSelector((state: RootState) => state.contribution.isCropAdding);
  const currentIsCropElementAdding = useSelector((state: RootState) => state.contribution.isCropElementAdding);
  const currentCropElementList = useSelector((state: RootState) => state.contribution.cropElementList);

  const currentTitle = useSelector((state: RootState) => state.contribution.title);
  const currentAddress = useSelector((state: RootState) => state.contribution.address);
  const currentDescription = useSelector((state: RootState) => state.contribution.description);
  const currentCropList = useSelector((state: RootState) => state.contribution.cropList);
  const currentAddedCrop = useSelector((state: RootState) => state.contribution.addedCrop);
  const currentAddedCropElement = useSelector((state: RootState) => state.contribution.addedCropElement);
  const currentSelectedCrop = useSelector((state: RootState) => state.contribution.selectedCrop);
  const currentSelectedCropElement = useSelector((state: RootState) => state.contribution.selectedCropElement);
  const currentSuitabilityLevelList = useSelector((state: RootState) => state.contribution.suitabilityLevelList);
  const currentSelectedSuitabilityLevel = useSelector(
    (state: RootState) => state.contribution.selectedSuitabilityLevel,
  );
  const currentPreviewRecord = useSelector((state: RootState) => state.contribution.previewRecord);

  const [isMinimized, setIsMinimized] = useState(false);
  const isDisabled = currentPreviewRecord ? currentPreviewRecord.status !== StatusType.PENDING : false;
  const isUpdating = !!currentPreviewRecord;

  const { setFiles } = useFile();

  const {
    data: suitabilityLevels,
    isLoading: isSuitabilityLoading,
    isFetching: isSuitabilityFetching,
  } = useGetAllSuitabilityLevelQuery(undefined);

  const {
    data: crops,
    isLoading: isCropLoading,
    isFetching: isCropFetching,
  } = useGetAllCropQuery("current", { refetchOnMountOrArgChange: true });

  const {
    data: cropElements,
    isLoading: isCropElementLoading,
    isFetching: isCropElementFetching,
  } = useGetAllCropElementQuery(
    { type: CategoryType.CURRENT.toLowerCase(), category: currentSelectedCrop?.id },
    { skip: !currentSelectedCrop?.id, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (isSuitabilityLoading || isSuitabilityFetching || isCropLoading || isCropFetching) return;

    if (suitabilityLevels && crops) {
      dispatch(
        changeSuitabilityLevelList(
          suitabilityLevels.map((level: any) => {
            const { gridcode, ...others } = level;
            return { ...others, code: gridcode };
          }),
        ),
      );

      dispatch(changeCropList(crops.map((crop: any) => ({ ...crop }))));

      if (isUpdating) {
        map.flyToBounds(currentPreviewRecord.boundingbox, {
          animate: true,
          padding: [20, 20],
          duration: 0.5,
        });

        dispatch(populateContributions({ ...currentPreviewRecord, step: 1 }));
      }
    }
  }, [suitabilityLevels, crops]);

  useEffect(() => {
    if (isCropElementLoading || isCropElementFetching) return;

    if (cropElements) {
      dispatch(changeCropElementList(cropElements.map((element: any) => ({ ...element }))));
      if (isUpdating) dispatch(populateContributions({ ...currentPreviewRecord, step: 2 }));
    }
  }, [cropElements]);

  return (
    <Box
      className={`card relative overflow-auto h-min max-h-[800px] ${isMinimized ? "max-w-[450px]" : "w-[450px] p-8"}`}
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Box className={`${isMinimized ? "relative p-2" : "absolute top-0 right-0 mt-4 mr-4"}`}>
        <Stack direction="row">
          {currentTool !== ToolType.METER && (
            <IconButton onClick={() => setIsMinimized((prev) => !prev)}>
              {!isMinimized ? (
                <MinimizeIcon className="text-secondary w-[24px] h-[24px]" />
              ) : (
                <MaximizeIcon className="text-secondary w-[24px] h-[24px]" />
              )}
            </IconButton>
          )}
          <IconButton
            onClick={() => {
              if (currentTool !== ToolType.NONE) dispatch(changeTool(ToolType.NONE));
              if (currentCard !== CardType.NONE) dispatch(changeCard(isUpdating ? CardType.RECORD : CardType.NONE));
              dispatch(resetTools());
              dispatch(resetContributions());
              setFiles([]);
              enableInteraction(map);
            }}
          >
            <CloseIcon className="text-secondary w-[24px] h-[24px]" />
          </IconButton>
        </Stack>
      </Box>
      {!isMinimized && currentTool !== ToolType.METER && (
        <Box>
          <Typography className="!font-bold !text-lg text-tertiary !mb-4">Area Information</Typography>
          <Box className="space-y-4">
            <TextAreaField
              id="title-area"
              label="Title"
              value={currentTitle}
              inputProps={{
                maxLength: maxTitleLength,
              }}
              disabled={isDisabled}
              onChange={(event) => dispatch(changeTitle(event.target.value))}
            />
            <TextAreaField
              id="address-area"
              label="Address"
              value={currentAddress}
              inputProps={{
                maxLength: maxAddressLength,
              }}
              disabled={isDisabled}
              onChange={(event) => dispatch(changeAddress(event.target.value))}
            />

            <TextAreaField
              id="description-area"
              label="Description"
              value={currentDescription}
              placeholder="Briefly provide information about this area."
              multiline
              minRows={4}
              maxRows={6}
              inputProps={{
                maxLength: maxDescriptionLength,
              }}
              helperText={`${currentDescription.length}/${maxDescriptionLength} characters`}
              disabled={isDisabled}
              onChange={(event) => dispatch(changeDescription(event.target.value))}
            />

            {/* Added !isUpdating to make fields in update record as text field, instead of select field. */}
            {!currentIsCropAdding && !isUpdating ? (
              // Initial open crop and crop element selection.
              <Stack direction="row" spacing={2}>
                {/* Crop selection. */}
                <SelectField
                  id="crop-area"
                  label="Crop"
                  isLoading={isCropLoading || isCropFetching}
                  disabled={isDisabled}
                  currentSelectedValue={currentSelectedCrop}
                  currentIterableList={currentCropList}
                  handleSelectionChange={changeSelectedCrop}
                />

                {currentSelectedCrop &&
                  !isCropLoading &&
                  !isCropFetching &&
                  (!currentIsCropElementAdding ? (
                    // Crop element selection.
                    <SelectField
                      id="element-area"
                      label="Element"
                      isLoading={isCropElementLoading || isCropElementFetching}
                      disabled={isDisabled}
                      currentSelectedValue={currentSelectedCropElement}
                      currentIterableList={currentCropElementList}
                      handleSelectionChange={changeSelectedCropElement}
                    />
                  ) : (
                    // Crop element adding.
                    <Box className="w-full">
                      <TextAreaField
                        id="element-area"
                        label="New Element"
                        value={currentAddedCropElement}
                        endAdornment={
                          <InputAdornment position="start">
                            <IconButton
                              onClick={() => {
                                dispatch(changeAddedCropElement(""));
                                dispatch(toggleIsCropElementAdding());
                              }}
                              disabled={isDisabled}
                              edge="end"
                            >
                              <CloseIcon className="text-secondary w-[20px] h-[20px]" />
                            </IconButton>
                          </InputAdornment>
                        }
                        disabled={isDisabled}
                        onChange={(event) => dispatch(changeAddedCropElement(event.target.value))}
                      />
                    </Box>
                  ))}
              </Stack>
            ) : (
              // Manual crop and crop element adding by typing.
              <Stack direction="row" spacing={2}>
                {/* Crop typing field */}
                <Box className="w-full">
                  <TextAreaField
                    id="crop-area"
                    label="New Crop"
                    value={currentAddedCrop}
                    endAdornment={
                      <InputAdornment position="start">
                        <IconButton
                          onClick={() => {
                            if (!isUpdating) {
                              dispatch(toggleIsCropAdding());
                              dispatch(toggleIsCropElementAdding(false));
                            }
                            dispatch(changeAddedCrop(currentPreviewRecord?.crop.name ?? ""));
                            dispatch(changeAddedCropElement(currentPreviewRecord?.crop_element?.name ?? ""));
                          }}
                          disabled={isDisabled}
                          edge="end"
                        >
                          {isUpdating ? (
                            <RefreshIcon className="text-secondary w-[20px] h-[20px]" />
                          ) : (
                            <CloseIcon className="text-secondary w-[20px] h-[20px]" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                    disabled={isDisabled}
                    onChange={(event) => dispatch(changeAddedCrop(event.target.value))}
                  />
                </Box>

                {!currentIsCropElementAdding ? (
                  // Crop element add element button.
                  <Box className="w-full">
                    <Box className="flex justify-center items-center border-2 box-border border-secondary rounded-xl w-full h-full">
                      <IconButton
                        disableRipple
                        className="space-x-2"
                        disabled={isDisabled}
                        onClick={() => {
                          if (isUpdating)
                            dispatch(changeAddedCropElement(currentPreviewRecord?.crop_element?.name ?? ""));
                          dispatch(toggleIsCropElementAdding());
                        }}
                      >
                        <AddIcon className="text-secondary w-[24px] h-[24px]" />
                        <Typography>Add Element</Typography>
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  // Crop element typing field.
                  <Box className="flex justify-center items-center w-full">
                    <TextAreaField
                      id="element-area"
                      label="New Element"
                      value={currentAddedCropElement}
                      endAdornment={
                        <InputAdornment position="start">
                          <IconButton
                            onClick={() => {
                              dispatch(toggleIsCropElementAdding());
                              dispatch(changeAddedCropElement(""));
                            }}
                            disabled={isDisabled}
                            edge="end"
                          >
                            <CloseIcon className="text-secondary w-[20px] h-[20px]" />
                          </IconButton>
                        </InputAdornment>
                      }
                      disabled={isDisabled}
                      onChange={(event) => dispatch(changeAddedCropElement(event.target.value))}
                    />
                  </Box>
                )}
              </Stack>
            )}

            <SelectField
              id="suitability-area"
              label="Suitability Level"
              isLoading={isSuitabilityLoading || isSuitabilityFetching}
              disabled={isDisabled}
              currentSelectedValue={currentSelectedSuitabilityLevel}
              currentIterableList={currentSuitabilityLevelList}
              handleSelectionChange={changeSelectedSuitabilityLevel}
            />

            <FileUpload />
          </Box>
        </Box>
      )}
      {currentTool === ToolType.METER && (
        <Box>
          <Typography className="!font-bold !text-lg text-tertiary !mb-4">Measurement</Typography>
          {currentDrawingVertices.length > 0 ? (
            <Box className="space-y-2">
              <Typography className="!font-normal !text-sm text-tertiary">{`Last Point: ${getDegree(currentDrawingVertices[currentDrawingVertices.length - 1])}`}</Typography>
              <Typography className="!font-normal !text-sm text-tertiary">{`Coordinate: ${getCoordinate(currentDrawingVertices[currentDrawingVertices.length - 1])}`}</Typography>
              <Typography className="!font-normal !text-sm text-tertiary">{`Path Distance: ${getPathPerimeter(currentDrawingVertices).toFixed(5)} km`}</Typography>
              <Typography className="!font-normal !text-sm text-tertiary">{`Area: ${getPolygonArea(currentPreviewPolygon).toFixed(5)} ha`}</Typography>
            </Box>
          ) : (
            <Typography className="!font-normal !text-sm text-tertiary">Start plotting to show measurement.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ContributeCard;
