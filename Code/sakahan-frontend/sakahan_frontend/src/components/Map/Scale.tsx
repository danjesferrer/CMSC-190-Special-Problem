"use client";

import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { getScale } from "@/lib";
import { type RootState } from "@/state/store";

const Scale = () => {
  const map = useMap();
  const currentScale = useSelector((state: RootState) => state.map.scale);
  const scale = currentScale === "" ? getScale(map) : currentScale;

  return (
    <Box className="text-center">
      <Stack direction={"row"} spacing={1}>
        <Typography className="!text-xs text-tertiary">Scale:</Typography>
        <Box className="bg-divider min-w-[110px] rounded-lg">
          <Typography className="!text-xs text-tertiary">{scale}</Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default Scale;
