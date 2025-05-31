"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { AppLogoIcon, AppNameIcon } from "@/components/Icons/";
import { ToastType } from "@/enums";
import { processError } from "@/lib";
import { useSocialAuthenticateMutation } from "@/state/auth/authApiSlice";
import { changeOpenAuth, setAuth } from "@/state/auth/authSlice";
import { openToast } from "@/state/toast/toastSlice";

const SocialAuthentication = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authenticate] = useSocialAuthenticateMutation();

  useEffect(() => {
    const state = searchParams.get("state");
    const code = searchParams.get("code");

    if (state && code) {
      authenticate({ provider: "google-oauth2", state, code })
        .unwrap()
        .then(() => {
          dispatch(
            openToast({
              openToast: true,
              title: "Login Successful",
              message: "Let's contribute data to improve land insights.",
              severity: ToastType.SUCCESS,
            }),
          );

          dispatch(setAuth());
          router.push("/");
        })
        .catch((error) => {
          const message = processError(error);
          dispatch(
            openToast({
              openToast: true,
              title: "Login Unsuccessful",
              message: message,
              severity: ToastType.ERROR,
            }),
          );

          dispatch(changeOpenAuth(true));
          router.push("/");
        });
    }
  }, []);

  return (
    <Box className="flex justify-center items-center h-screen bg-background">
      <Stack direction="column" spacing={4} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <AppLogoIcon className="text-primary w-[113px] h-[73px]" />
          <AppNameIcon className="text-primary w-[217px] h-[40px]" />
        </Stack>

        <CircularProgress size={40} color="inherit" />
      </Stack>
    </Box>
  );
};

export default SocialAuthentication;
