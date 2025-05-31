"use client";

import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { aids, statuses } from "@/constants";
import { AidType, CardType, StatusType, ToastType, ToolType } from "@/enums";
import {
  computeBoundingBox,
  convertToLatLng,
  convertToLngLat,
  disableInteraction,
  enableInteraction,
  processError,
} from "@/lib";
import { useFile } from "@/provider";
import type { Contribution, Record } from "@/types";
import {
  useAddContributionMutation,
  useAddFileContributionMutation,
  useDeleteContributionMutation,
  useEditContributionMutation,
} from "@/state/contribution/contributionApiSlice";
import { resetContributions } from "@/state/contribution/contributionSlice";
import { changeCard, changeTool } from "@/state/map/mapSlice";
import { populateRecord, resetConfiguration } from "@/state/record/recordSlice";
import { type RootState } from "@/state/store";
import { openToast } from "@/state/toast/toastSlice";
import {
  autoCompleteVertices,
  changeAlteringDraft,
  populateAlteringDraft,
  redoSnapshot,
  resetAllProgressDraft,
  resetHistory,
  resetTools,
  saveAlteringDraft,
  undoSnapshot,
} from "@/state/tool/toolSlice";

const Aids = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentCard = useSelector((state: RootState) => state.map.card);
  const currentTool = useSelector((state: RootState) => state.map.tool);
  const currentDrawingVertices = useSelector((state: RootState) => state.tool.drawingVertices);
  const currentAlteringDraft = useSelector((state: RootState) => state.tool.alteringDraft);
  const currentDrawingComplete = useSelector((state: RootState) => state.tool.drawingComplete);
  const currentEditingVertices = useSelector((state: RootState) => state.tool.editingVertices);

  const currentAuthenticatedUser = useSelector((state: RootState) => state.user.authenticatedUser);
  const currentTitle = useSelector((state: RootState) => state.contribution.title);
  const currentAddress = useSelector((state: RootState) => state.contribution.address);
  const currentDescription = useSelector((state: RootState) => state.contribution.description);
  const currentAddedCrop = useSelector((state: RootState) => state.contribution.addedCrop);
  const currentAddedCropElement = useSelector((state: RootState) => state.contribution.addedCropElement);
  const currentSelectedCrop = useSelector((state: RootState) => state.contribution.selectedCrop);
  const currentSelectedCropElement = useSelector((state: RootState) => state.contribution.selectedCropElement);
  const currentSelectedSuitabilityLevel = useSelector(
    (state: RootState) => state.contribution.selectedSuitabilityLevel,
  );
  const currentPreviewRecord = useSelector((state: RootState) => state.contribution.previewRecord);
  const currentHasFileChanges = useSelector((state: RootState) => state.contribution.hasFileChanges);

  const [addContribution, { isLoading: isAddLoading }] = useAddContributionMutation();
  const [editContribution, { isLoading: isEditLoading }] = useEditContributionMutation();
  const [deleteContribution, { isLoading: isDeleteLoading }] = useDeleteContributionMutation();
  const [addFileContribution, { isLoading: isFileLoading }] = useAddFileContributionMutation();

  const { files, setFiles } = useFile();

  const isLoading = isAddLoading || isEditLoading || isDeleteLoading || isFileLoading;

  const showResult = async (result: any) => {
    const { geometries, ...rest } = result;
    const { gridcode, ...others } = rest.suitability_level;
    const suitability_level = { ...others, code: gridcode };

    const record: Record = {
      ...rest,
      suitability_level: suitability_level,
      geom: convertToLatLng(geometries),
      boundingbox: computeBoundingBox(geometries),
    };

    await addFileContribution({
      contribution: record.id,
      user: currentAuthenticatedUser!.id,
      files: files,
    })
      .unwrap()
      .then(() => {
        // Reset the map state
        setFiles([]);
        dispatch(changeCard(CardType.RECORD));
        dispatch(changeTool(ToolType.NONE));
        dispatch(resetTools());
        dispatch(resetContributions());
        dispatch(resetConfiguration());
        dispatch(populateRecord(record));
        dispatch(
          openToast({
            openToast: true,
            title: "Submission Successful",
            message: "Your contribution has been submitted successfully.",
            severity: ToastType.SUCCESS,
          }),
        );
      })
      .catch((error) => {
        // Delete the contribution if the file upload fails when adding a new contribution.
        if (!currentPreviewRecord) deleteContribution({ id: record.id });

        const message = processError(error);
        dispatch(
          openToast({
            openToast: true,
            title: "File Upload Failed",
            message: message,
            severity: ToastType.ERROR,
          }),
        );
      });
  };

  const handleContributionSubmit = async () => {
    const crop = currentSelectedCrop;
    const cropElement = currentSelectedCropElement;
    const contribution: Contribution = {
      author: !currentPreviewRecord ? currentAuthenticatedUser!.id : currentPreviewRecord.author.id,
      title: currentTitle.trim(),
      address: currentAddress.trim(),
      description: currentDescription.trim(),
      // Only add a new crop if one isn't selected.
      crop: crop?.id ?? currentAddedCrop.trim(),
      // Only add a new crop element if one isn't selected and if the user put one.
      crop_element: cropElement?.id ?? (currentAddedCropElement ? currentAddedCropElement.trim() : null),
      suitability_level: currentSelectedSuitabilityLevel!.id,
      status: statuses[StatusType.PENDING],
      geom: convertToLngLat(currentDrawingComplete),
    };

    if (!currentPreviewRecord) {
      await addContribution({ contribution: contribution })
        .unwrap()
        .then((result) => {
          showResult(result);
        })
        .catch((error) => {
          const message = processError(error);
          dispatch(
            openToast({
              openToast: true,
              title: "Submission Unsuccessful",
              message: message,
              severity: ToastType.ERROR,
            }),
          );
        });
    } else {
      // Check first if the contribution really have changes.
      const changes = {
        title: contribution.title === currentPreviewRecord.title,
        address: contribution.address === currentPreviewRecord.address,
        description: contribution.description === currentPreviewRecord.description,
        crop:
          contribution.crop === currentPreviewRecord.crop.id || contribution.crop === currentPreviewRecord.crop.name,
        cropElement:
          contribution.crop_element === currentPreviewRecord.crop_element ||
          contribution.crop_element === currentPreviewRecord.crop_element?.id ||
          contribution.crop_element === currentPreviewRecord.crop_element?.name,
        suitabilityLevel: contribution.suitability_level === currentPreviewRecord.suitability_level.id,
        geom: JSON.stringify(contribution.geom) === JSON.stringify(convertToLngLat(currentPreviewRecord.geom)),
        files: !currentHasFileChanges,
      };

      const hasChanges = Object.values(changes).some((isSame) => !isSame);
      if (!hasChanges) {
        dispatch(
          openToast({
            openToast: true,
            title: "No Changes Detected",
            message: "The current draft is identical to the record preview.",
            severity: ToastType.INFO,
          }),
        );

        return;
      }

      await editContribution({
        contribution: contribution,
        id: currentPreviewRecord.id,
        user: currentAuthenticatedUser!.id,
      })
        .unwrap()
        .then((result) => {
          showResult(result);
        })
        .catch((error) => {
          const message = processError(error);
          dispatch(
            openToast({
              openToast: true,
              title: "Submission Unsuccessful",
              message: message,
              severity: ToastType.ERROR,
            }),
          );
        });
    }
  };

  const handleAidClick = (type: AidType) => {
    switch (type) {
      case AidType.SUBMIT:
        const toast = {
          openToast: true,
          title: "Submission Failed",
          message: "",
          severity: ToastType.ERROR,
        };

        if (currentDrawingComplete.length === 0) {
          dispatch(
            openToast({
              ...toast,
              message: "No polygon drawn.",
            }),
          );
          return;
        }

        if (currentTitle.trim() === "") {
          dispatch(
            openToast({
              ...toast,
              message: "Title is required.",
            }),
          );
          return;
        }

        if (currentAddress.trim() === "") {
          dispatch(
            openToast({
              ...toast,
              message: "Address is required.",
            }),
          );
          return;
        }

        if (currentDescription.trim() === "") {
          dispatch(
            openToast({
              ...toast,
              message: "Description is required.",
            }),
          );
          return;
        }

        if (!currentSelectedCrop && !currentAddedCrop.trim()) {
          dispatch(
            openToast({
              ...toast,
              message: "Crop is required.",
            }),
          );

          return;
        }

        if (!currentSelectedSuitabilityLevel) {
          dispatch(
            openToast({
              ...toast,
              message: "Suitability Level is required.",
            }),
          );

          return;
        }

        handleContributionSubmit();

        break;
      case AidType.SAVE:
        if (currentTool === ToolType.DRAW) {
          if (currentDrawingVertices.length < 3) {
            dispatch(
              openToast({
                openToast: true,
                title: "Drawing Failed",
                message: "Polygon must have at least 3 points.",
                severity: ToastType.ERROR,
              }),
            );
            return;
          }
          dispatch(autoCompleteVertices());
        }

        if (currentTool === ToolType.EDIT || currentTool === ToolType.DELETE) {
          dispatch(
            changeAlteringDraft(
              currentAlteringDraft.map((polygon) => {
                const temp = [...polygon];
                if (JSON.stringify(polygon[0]) !== JSON.stringify(polygon[polygon.length - 1])) temp.push(polygon[0]); // Add the last point to close the polygon.

                return temp;
              }),
            ),
          );
          dispatch(saveAlteringDraft());
        }

        dispatch(populateAlteringDraft());
        dispatch(resetHistory());
        dispatch(resetAllProgressDraft());
        break;
      case AidType.CANCEL:
        if (currentTool === ToolType.DRAW) dispatch(resetHistory());

        if (currentTool === ToolType.EDIT || currentTool === ToolType.DELETE) dispatch(populateAlteringDraft());

        dispatch(resetAllProgressDraft());
        break;
      case AidType.UNDO:
        dispatch(undoSnapshot());
        break;
      case AidType.REDO:
        dispatch(redoSnapshot());
        break;
      case AidType.EXIT:
        if (currentTool !== ToolType.NONE) dispatch(changeTool(ToolType.NONE));
        if (currentCard !== CardType.NONE) dispatch(changeCard(currentPreviewRecord ? CardType.RECORD : CardType.NONE));
        dispatch(resetTools());
        dispatch(resetContributions());
        setFiles([]);
        enableInteraction(map);

        break;
    }
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {aids.map(({ type, Icon }) => {
        if (currentPreviewRecord && currentPreviewRecord.status !== StatusType.PENDING) {
          if (type !== AidType.EXIT) return null;
        } else {
          // For Draw Tool.
          if (currentTool === ToolType.DRAW) {
            if (currentDrawingVertices.length === 0) {
              // No Save and Cancel Button if there is no current draft.
              if (type === AidType.SAVE || type === AidType.CANCEL) return null;
            } else if (type === AidType.SUBMIT) return null;
          }

          // For Edit and Delete Tool.
          if (currentTool === ToolType.EDIT || currentTool === ToolType.DELETE) {
            // No Undo and Redo Button.
            if (type === AidType.UNDO || type === AidType.REDO) return null;

            if (
              JSON.stringify(currentDrawingComplete) === JSON.stringify(currentAlteringDraft) &&
              currentEditingVertices.length === 0
            ) {
              // No Save and Cancel Button if there is no current draft.
              if (type === AidType.SAVE || type === AidType.CANCEL) return null;
            } else if (type === AidType.SUBMIT) return null;
          }

          if (
            currentTool === ToolType.METER &&
            (type === AidType.SUBMIT || type === AidType.SAVE || type === AidType.UNDO || type === AidType.REDO)
          )
            return null;
        }

        return (
          <Box
            className="card"
            onMouseEnter={() => disableInteraction(map)}
            onMouseLeave={() => enableInteraction(map)}
            sx={{ pointerEvents: "auto" }}
            key={type}
          >
            <IconButton
              disableRipple
              className="mx-2 h-[50px]"
              onClick={() => handleAidClick(type as AidType)}
              disabled={isLoading}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography className="text-tertiary">{type}</Typography>

                {type === AidType.SUBMIT && isLoading ? (
                  <CircularProgress size={32} color="inherit" />
                ) : (
                  <Icon className="text-secondary w-[32px] h-[32px]" />
                )}
              </Stack>
            </IconButton>
          </Box>
        );
      })}
    </Stack>
  );
};

export default Aids;
