"use client";

import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { type RootState } from "@/state/store";

const Coordinate = () => {
  const currentPointer = useSelector((state: RootState) => state.map.pointer);

  return (
    <Box className="text-center">
      <Stack direction={"row"} spacing={1}>
        <Typography className="!text-xs text-tertiary">Coordinate:</Typography>
        <Box className="bg-divider min-w-[160px] rounded-lg">
          <Typography className="!text-xs text-tertiary">
            {currentPointer.lat.toFixed(5)}&deg;, {currentPointer.lng.toFixed(5)}&deg;
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default Coordinate;
