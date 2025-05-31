"use client";

import { useMap } from "react-leaflet";
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { basemaps } from "@/constants";
import { disableInteraction, enableInteraction } from "@/lib";
import { changeBasemap } from "@/state/map/mapSlice";

const Basemap = () => {
  const map = useMap();
  const dispatch = useDispatch();

  return (
    <Box
      className="card p-8 overflow-auto h-min max-h-[450px] max-w-[450px]"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Typography className="!font-black !text-2xl text-tertiary !mb-4">Basemaps</Typography>
      <Box>
        <Grid container spacing={2}>
          {(Object.keys(basemaps) as Array<keyof typeof basemaps>).map((basemap) => (
            <Grid key={basemap} size={6}>
              <Card
                className="!bg-transparent !shadow-none !rounded-none"
                onClick={() => dispatch(changeBasemap(basemap))}
              >
                <CardMedia
                  sx={{ height: 120 }}
                  className="rounded-lg shadow-sm cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
                  image={`/${String(basemap).toLowerCase().replace(/\s+/g, "_")}.JPG`}
                  title={basemap}
                />
                <CardContent className="!p-1">
                  <Typography className="!text-center text-tertiary">{basemap}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Basemap;
