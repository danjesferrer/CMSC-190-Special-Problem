"use client";

import { useMap } from "react-leaflet";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Coordinate from "@/components/Map/Coordinate";
import Scale from "@/components/Map/Scale";
import { disableInteraction, enableInteraction } from "@/lib";

const Detail = () => {
  const map = useMap();

  return (
    <Box
      className="card relative min-w-[450px] rounded-full"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Stack direction="row" spacing={2} className="justify-center items-center">
        <Coordinate />
        <Scale />
      </Stack>
    </Box>
  );
};

export default Detail;
