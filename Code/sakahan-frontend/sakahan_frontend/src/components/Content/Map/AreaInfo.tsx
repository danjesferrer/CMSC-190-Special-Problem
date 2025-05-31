"use client";

import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { CloseIcon } from "@/components/Icons/";
import { CardType } from "@/enums";
import { computeSearchArea, computeSearchPerimeter, disableInteraction, enableInteraction, toTitleCase } from "@/lib";
import { changeCard, changeSearch, changeSearchList } from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";

const AreaInfo = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentCard = useSelector((state: RootState) => state.map.card);
  const currentSearch = useSelector((state: RootState) => state.map.search);

  return (
    <Box
      className="card relative overflow-auto h-min max-h-[800px] w-[450px] p-8"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Box className="absolute top-0 right-0 mt-4 mr-4">
        <IconButton
          onClick={() => {
            if (currentCard !== CardType.NONE) dispatch(changeCard(CardType.NONE));
            dispatch(changeSearch(null));
            dispatch(changeSearchList([]));
            enableInteraction(map);
          }}
        >
          <CloseIcon className="text-secondary w-[24px] h-[24px]" />
        </IconButton>
      </Box>
      <Typography className="!font-bold !text-sm text-tertiary !mb-4">{`OSM ID: ${currentSearch!.osm_id}`}</Typography>
      <Box className="space-y-2">
        <Typography className="!font-bold !text-lg text-tertiary">{currentSearch!.display_name}</Typography>
        <Typography className="!font-normal !text-sm text-tertiary">{`Address Type: ${toTitleCase(currentSearch!.addresstype)}`}</Typography>
        <Typography className="!font-normal !text-sm text-tertiary">{`Class: ${toTitleCase(currentSearch!.class)}`}</Typography>
        <Typography className="!font-normal !text-sm text-tertiary">{`Type: ${toTitleCase(currentSearch!.type)}`}</Typography>
        <Typography className="!font-normal !text-sm text-tertiary">{`Coordinate: ${parseFloat(currentSearch!.lat).toFixed(5)}, ${parseFloat(currentSearch!.lon).toFixed(5)}`}</Typography>
        <Typography className="!font-normal !text-sm text-tertiary">{`Polygon Area: ${computeSearchArea(currentSearch!).toFixed(5)} km²`}</Typography>
        <Typography className="!font-normal !text-sm text-tertiary">{`Polygon Perimeter: ${computeSearchPerimeter(currentSearch!).toFixed(5)} km`}</Typography>
      </Box>
      <Typography className="!font-normal !text-sm text-tertiary !mt-8">{`License: ${currentSearch!.licence}`}</Typography>
    </Box>
  );
};

export default AreaInfo;
