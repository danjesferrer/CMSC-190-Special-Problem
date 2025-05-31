"use client";

import { useMap } from "react-leaflet";
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { UserIcon } from "@/components/Icons/";
import { disableInteraction, enableInteraction } from "@/lib";
import { changeOpenAuth } from "@/state/auth/authSlice";

const Auth = () => {
  const map = useMap();
  const dispatch = useDispatch();

  return (
    <Box
      className="card"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
      sx={{ pointerEvents: "auto" }}
    >
      <IconButton onClick={() => dispatch(changeOpenAuth(true))}>
        <UserIcon className="text-secondary w-[32px] h-[32px]" />
      </IconButton>
    </Box>
  );
};

export default Auth;
