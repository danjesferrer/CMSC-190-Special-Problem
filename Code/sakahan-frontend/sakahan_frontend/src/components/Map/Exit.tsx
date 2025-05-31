"use client";

import { useMap } from "react-leaflet";
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ExitIcon } from "@/components/Icons/";
import { disableInteraction, enableInteraction } from "@/lib";
import { useLogoutMutation } from "@/state/auth/authApiSlice";
import { unsetAuth } from "@/state/auth/authSlice";
import { resetContributions } from "@/state/contribution/contributionSlice";
import { resetMap } from "@/state/map/mapSlice";
import { resetTools } from "@/state/tool/toolSlice";
import { resetUser } from "@/state/user/userSlice";

const Exit = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();

  const handleLogoutClick = () => {
    logout(undefined)
      .unwrap()
      .then(() => {
        dispatch(unsetAuth());
        dispatch(resetUser());
        dispatch(resetMap());
        dispatch(resetTools());
        dispatch(resetContributions());
        enableInteraction(map);
      })
      .catch(() => {});
  };

  return (
    <Box
      className="card"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
      sx={{ pointerEvents: "auto" }}
    >
      <IconButton onClick={handleLogoutClick} disableRipple className="mx-2 h-[50px]">
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography className="text-tertiary">Logout</Typography>
          <ExitIcon className="text-secondary w-[32px] h-[32px]" />
        </Stack>
      </IconButton>
    </Box>
  );
};

export default Exit;
