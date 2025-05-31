"use client";

import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { AddIcon, SubtractIcon } from "@/components/Icons/";
import { maxZoom, minZoom } from "@/constants";
import { disableInteraction, enableInteraction } from "@/lib";
import { type RootState } from "@/state/store";

const Zoom = () => {
  const map = useMap();
  const currentZoomLevel = useSelector((state: RootState) => state.map.zoom);

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  const isMinZoom = currentZoomLevel <= minZoom;
  const isMaxZoom = currentZoomLevel >= maxZoom;

  return (
    <Box className="card" onMouseEnter={() => disableInteraction(map)} onMouseLeave={() => enableInteraction(map)}>
      <ButtonGroup orientation="vertical">
        <Tooltip title="Zoom In" placement="right">
          <IconButton onClick={zoomIn} disabled={isMaxZoom} className="group">
            <AddIcon className="text-secondary group-disabled:text-divider w-[32px] h-[32px]" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom Out" placement="right">
          <IconButton onClick={zoomOut} disabled={isMinZoom} className="group">
            <SubtractIcon className="text-secondary group-disabled:text-divider w-[32px] h-[32px]" />
          </IconButton>
        </Tooltip>
      </ButtonGroup>
    </Box>
  );
};

export default Zoom;
