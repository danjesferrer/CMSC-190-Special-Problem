"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { AppLogoIcon, AppNameIcon } from "@/components/Icons/";
import InputField from "@/components/Utils/Fields/InputField";
import { ToastType } from "@/enums";
import { type ResetEmailFormData, processError, resetEmailSchema } from "@/lib";
import { useResetPasswordMutation } from "@/state/auth/authApiSlice";
import { changeOpenAuth } from "@/state/auth/authSlice";
import { openToast } from "@/state/toast/toastSlice";

const ResetEmail = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [resetEmail, { isLoading }] = useResetPasswordMutation();

  const resetEmailForm = useForm<ResetEmailFormData>({
    resolver: zodResolver(resetEmailSchema),
    mode: "onChange",
    defaultValues: {
      reset_email: "",
    },
  });

  const handleResetEmailSubmit = (data: ResetEmailFormData) => {
    resetEmail({
      email: data.reset_email.trim(),
    })
      .unwrap()
      .then(() => {
        dispatch(
          openToast({
            openToast: true,
            title: "Request Successful",
            message: "Please check your email for reset link.",
            severity: ToastType.SUCCESS,
          }),
        );
      })
      .catch((error) => {
        console.log(error);
        const message = processError(error);
        dispatch(
          openToast({
            openToast: true,
            title: "Request Unsuccessful",
            message: message,
            severity: ToastType.ERROR,
          }),
        );
      })
      .finally(() => {
        dispatch(changeOpenAuth(true));
        router.push("/");
      });
  };

  return (
    <Box className="flex justify-center items-center h-screen bg-background">
      <Stack direction="column" spacing={4} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <AppLogoIcon className="text-primary w-[113px] h-[73px]" />
          <AppNameIcon className="text-primary w-[217px] h-[40px]" />
        </Stack>

        <Box className="w-[500px] p-8">
          <form onSubmit={resetEmailForm.handleSubmit(handleResetEmailSubmit)} noValidate>
            <Box className="space-y-4">
              <InputField
                name="reset_email"
                id="reset-email"
                label="Email Address"
                type="text"
                control={resetEmailForm.control}
              />

              <Button
                variant="contained"
                className="w-full !rounded-xl !bg-primary h-14"
                size="large"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Request Password Reset"}
              </Button>
            </Box>
          </form>
        </Box>
      </Stack>
    </Box>
  );
};

export default ResetEmail;
