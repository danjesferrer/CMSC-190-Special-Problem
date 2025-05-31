"use client";

import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { extras } from "@/constants";
import { AidType, ToolType } from "@/enums";
import { changePolygonView, disableInteraction, enableInteraction } from "@/lib";
import { type RootState } from "@/state/store";
import { decrementPolygonIndex, incrementPolygonIndex, redoSnapshot, undoSnapshot } from "@/state/tool/toolSlice";

const Extras = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentTool = useSelector((state: RootState) => state.map.tool);
  const currentPast = useSelector((state: RootState) => state.tool.past);
  const currentFuture = useSelector((state: RootState) => state.tool.future);
  const currentPolygonIndex = useSelector((state: RootState) => state.tool.polygonIndex);
  const currentDrawingComplete = useSelector((state: RootState) => state.tool.drawingComplete);

  const handleAidClick = (type: AidType) => {
    switch (type) {
      case AidType.UNDO:
        dispatch(undoSnapshot());
        break;
      case AidType.REDO:
        dispatch(redoSnapshot());
        break;
      case AidType.PREVIOUS: {
        const newIndex = (currentPolygonIndex - 1 + currentDrawingComplete.length) % currentDrawingComplete.length;
        changePolygonView(map, newIndex, currentDrawingComplete);
        dispatch(decrementPolygonIndex(newIndex));
        break;
      }
      case AidType.NEXT: {
        const newIndex = (currentPolygonIndex + 1) % currentDrawingComplete.length;
        changePolygonView(map, newIndex, currentDrawingComplete);
        dispatch(incrementPolygonIndex(newIndex));
        break;
      }
    }
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {extras.map(({ type, Icon }) => {
        if (currentTool === ToolType.METER) return null;

        if (currentTool !== ToolType.DRAW) {
          // No Undo and Redo Button for other tools except Draw.
          if (type === AidType.UNDO || type === AidType.REDO) return null;
        }

        if (type === AidType.UNDO || type === AidType.REDO) {
          // No Undo and Redo Button if there is no history.
          if (currentPast.length === 0 && currentFuture.length === 0) return null;
        }

        if (type === AidType.PREVIOUS || type === AidType.NEXT) {
          // No Previous and Next Button if current polygons drawn are not more than 2.
          if (currentDrawingComplete.length < 2) return null;
        }

        return (
          <Box
            className="card"
            onMouseEnter={() => disableInteraction(map)}
            onMouseLeave={() => enableInteraction(map)}
            sx={{ pointerEvents: "auto" }}
            key={type}
          >
            <IconButton disableRipple className="mx-2 h-[50px]" onClick={() => handleAidClick(type as AidType)}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography className="text-tertiary">{type}</Typography>
                <Icon className="text-secondary w-[32px] h-[32px]" />
              </Stack>
            </IconButton>
          </Box>
        );
      })}
    </Stack>
  );
};

export default Extras;
