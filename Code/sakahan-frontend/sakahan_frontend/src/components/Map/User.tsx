"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useDispatch } from "react-redux";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Stack from "@mui/material/Stack";
import { UserIcon } from "@/components/Icons/";
import { disableInteraction, enableInteraction } from "@/lib";
import { useRetrieveUserQuery } from "@/state/auth/authApiSlice";
import { setUser } from "@/state/user/userSlice";

const User = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const { data: user, isLoading, isFetching } = useRetrieveUserQuery();

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user]);

  return (
    <Box
      className="card"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
      sx={{ pointerEvents: "auto" }}
    >
      <Stack direction="row" spacing={2} className="mx-2 h-[50px]">
        {isLoading || isFetching ? (
          <Box className="flex items-center justify-center">
            <CircularProgress size={30} color="inherit" />
          </Box>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <UserIcon className="text-secondary w-[32px] h-[32px]" />
            <Stack direction="column" spacing={0}>
              <Typography className="!font-bold !text-md text-tertiary">
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography className="!font-normal !text-sm text-tertiary">{user?.email}</Typography>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default User;
