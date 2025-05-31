"use client";

import { useMap } from "react-leaflet";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RecordCard from "@/components/Content/Record/RecordCard";
import { disableInteraction, enableInteraction } from "@/lib";

const Record = () => {
  const map = useMap();

  return (
    <Box
      className="card p-8 h-[75vh] w-[75vw] flex flex-col"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Typography className="!font-black !text-2xl text-tertiary !mb-4">Record Book</Typography>
      <RecordCard />
    </Box>
  );
};

export default Record;
