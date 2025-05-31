"use client";

import { type LatLngExpression } from "leaflet";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { FlyIcon } from "@/components/Icons/";
import { maxZoom } from "@/constants";
import { CardType, ToastType } from "@/enums";
import { disableInteraction, enableInteraction } from "@/lib";
import { changeCard, changeSearch, changeSearchList } from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";
import { openToast } from "@/state/toast/toastSlice";

const Fly = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentCard = useSelector((state: RootState) => state.map.card);
  const currentSearch = useSelector((state: RootState) => state.map.search);
  const currentSearchList = useSelector((state: RootState) => state.map.searchList);

  const handleUserFly = () => {
    if ("permissions" in navigator && "geolocation" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          navigator.geolocation.getCurrentPosition((position) => {
            const currentPosition: LatLngExpression = [position.coords.latitude, position.coords.longitude];
            map.flyTo(currentPosition, maxZoom, {
              animate: true,
              duration: 2,
            });
          });

          if (currentCard !== CardType.NONE) dispatch(changeCard(CardType.NONE));
          if (currentSearch !== null) dispatch(changeSearch(null));
          if (currentSearchList.length !== 0) dispatch(changeSearchList([]));
        } else {
          dispatch(
            openToast({
              openToast: true,
              title: "Permission Denied",
              message: "Please enable location permission to use this feature.",
              severity: ToastType.WARNING,
            }),
          );
        }
      });
    } else {
      dispatch(
        openToast({
          openToast: true,
          title: "Unsupported Feature",
          message: "Feature is not supported by this browser.",
          severity: ToastType.WARNING,
        }),
      );
    }
  };

  return (
    <Box className="card" onMouseEnter={() => disableInteraction(map)} onMouseLeave={() => enableInteraction(map)}>
      <Tooltip title="Show Your Location" placement="right">
        <IconButton onClick={handleUserFly}>
          <FlyIcon className="text-secondary w-[32px] h-[32px]" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Fly;
