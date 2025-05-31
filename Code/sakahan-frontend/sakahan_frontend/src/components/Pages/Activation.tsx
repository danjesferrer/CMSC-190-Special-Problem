"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppLogoIcon, AppNameIcon } from "@/components/Icons/";
import { ToastType } from "@/enums";
import { processError } from "@/lib";
import { type UIDTokenProps } from "@/types";
import { useActivationMutation } from "@/state/auth/authApiSlice";
import { changeOpenAuth } from "@/state/auth/authSlice";
import { openToast } from "@/state/toast/toastSlice";

const Activation = ({ uid, token }: UIDTokenProps) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [activation] = useActivationMutation();
  const [countdown, setCountdown] = useState(10);
  const [isFinishActivation, setIsFinishActivation] = useState(false);
  const [activationTitle, setActivationTitle] = useState("");
  const [activationMessage, setActivationMessage] = useState("");

  useEffect(() => {
    activation({ uid, token })
      .unwrap()
      .then(() => {
        dispatch(
          openToast({
            openToast: true,
            title: "Activation Successful",
            message: "Please log in to continue.",
            severity: ToastType.SUCCESS,
          }),
        );

        setActivationTitle("Account Activation Successful!");
        setActivationMessage("Your account is verified");
      })
      .catch((error) => {
        const message = processError(error);
        dispatch(
          openToast({
            openToast: true,
            title: "Activation Unsuccessful",
            message: message,
            severity: ToastType.ERROR,
          }),
        );

        setActivationTitle("Account Activation Unsuccessful!");
        setActivationMessage("Invalid activation link");
      })
      .finally(() => {
        setIsFinishActivation(true);
        dispatch(changeOpenAuth(true));
      });
  }, []);

  // Countdown timer effect (only runs when activation is successful)
  useEffect(() => {
    if (!isFinishActivation) return;

    if (countdown === 0) {
      router.push("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinishActivation, countdown]);

  return (
    <Box className="flex justify-center items-center h-screen bg-background">
      <Stack direction="column" spacing={4} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <AppLogoIcon className="text-primary w-[113px] h-[73px]" />
          <AppNameIcon className="text-primary w-[217px] h-[40px]" />
        </Stack>

        {isFinishActivation ? (
          <Stack direction="column" spacing={2} alignItems="center">
            <Typography className="!font-black !text-2xl text-tertiary">{activationTitle}</Typography>
            <Typography className="!font-medium !text-xl text-tertiary !mb-4">
              {activationMessage}. Redirecting to SAKAHAN in {countdown} seconds...
            </Typography>
          </Stack>
        ) : (
          <CircularProgress size={40} color="inherit" />
        )}
      </Stack>
    </Box>
  );
};

export default Activation;
