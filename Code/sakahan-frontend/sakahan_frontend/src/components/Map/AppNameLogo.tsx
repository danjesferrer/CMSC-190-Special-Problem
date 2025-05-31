"use client";

import { useMap } from "react-leaflet";
import { useDispatch } from "react-redux";
import { Stack } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { AppLogoIcon, AppNameIcon } from "@/components/Icons/";
import { defaultPosition, defaultZoom } from "@/constants";
import { disableInteraction, enableInteraction } from "@/lib";
import { useFile } from "@/provider";
import { resetContributions } from "@/state/contribution/contributionSlice";
import { resetMap } from "@/state/map/mapSlice";
import { resetRecord } from "@/state/record/recordSlice";
import { resetTools } from "@/state/tool/toolSlice";

const AppNameLogo = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const { setFiles } = useFile();

  return (
    <Box
      className="z-[1000]"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
      sx={{ pointerEvents: "auto" }}
    >
      <IconButton
        disableRipple
        onClick={() => {
          dispatch(resetMap());
          dispatch(resetTools());
          dispatch(resetContributions());
          dispatch(resetRecord());
          setFiles([]);
          map.setView(defaultPosition, defaultZoom, { animate: true, duration: 2 });
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AppLogoIcon className="text-background w-[113px] h-[73px]" />
          <AppNameIcon className="text-background w-[217px] h-[40px]" />
        </Stack>
      </IconButton>
    </Box>
  );
};

export default AppNameLogo;
