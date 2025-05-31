"use client";

import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { EyeIcon } from "@/components/Icons/";
import { tools } from "@/constants";
import { StatusType, ToastType, ToolType } from "@/enums";
import { disableInteraction, enableInteraction } from "@/lib";
import { changeTool } from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";
import { openToast } from "@/state/toast/toastSlice";

const Contribute = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentTool = useSelector((state: RootState) => state.map.tool);
  const currentDrawingVertices = useSelector((state: RootState) => state.tool.drawingVertices);
  const currentEditingVertices = useSelector((state: RootState) => state.tool.editingVertices);
  const currentDrawingComplete = useSelector((state: RootState) => state.tool.drawingComplete);
  const currentAlteringDraft = useSelector((state: RootState) => state.tool.alteringDraft);
  const currentPreviewRecord = useSelector((state: RootState) => state.contribution.previewRecord);

  const handleToolClick = (toolType: ToolType) => {
    if (toolType === currentTool) return; // Do nothing if the clicked tool is already active.

    if (currentTool === ToolType.DRAW || currentTool === ToolType.METER) {
      if (currentDrawingVertices.length > 0) {
        dispatch(
          openToast({
            openToast: true,
            title: "Unsaved Changes",
            message: "Please save or cancel your changes or exit the current tool.",
            severity: ToastType.WARNING,
          }),
        );

        return;
      }
    }

    if (currentTool === ToolType.EDIT || currentTool === ToolType.DELETE) {
      if (
        JSON.stringify(currentDrawingComplete) !== JSON.stringify(currentAlteringDraft) ||
        currentEditingVertices.length > 0
      ) {
        dispatch(
          openToast({
            openToast: true,
            title: "Unsaved Changes",
            message: "Please save or cancel your changes or exit the current tool.",
            severity: ToastType.WARNING,
          }),
        );

        return;
      }
    }

    dispatch(changeTool(toolType as ToolType));
  };

  return (
    <Box
      className="card p-8 overflow-auto h-min max-h-[450px] w-[450px]"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Typography className="!font-black !text-2xl text-tertiary !mb-4">Contribute Data</Typography>
      <Box>
        <Grid container spacing={2} justifyContent="space-between">
          {currentPreviewRecord && currentPreviewRecord.status !== StatusType.PENDING ? (
            <IconButton size="large" disableRipple>
              <Stack direction="column" spacing={1} alignItems="center">
                <EyeIcon className={`w-[40px] h-[40px] text-primary`} />
                <Typography className={`!text-lg text-primary`}>View</Typography>
              </Stack>
            </IconButton>
          ) : (
            tools.map(({ type, Icon }) => (
              <IconButton key={type} size="large" disableRipple onClick={() => handleToolClick(type as ToolType)}>
                <Stack direction="column" spacing={1} alignItems="center">
                  <Icon className={`w-[40px] h-[40px] ${currentTool === type ? "text-primary" : "text-secondary"}`} />
                  <Typography className={`!text-lg  ${currentTool === type ? "text-primary" : "text-tertiary"}`}>
                    {type}
                  </Typography>
                </Stack>
              </IconButton>
            ))
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Contribute;
