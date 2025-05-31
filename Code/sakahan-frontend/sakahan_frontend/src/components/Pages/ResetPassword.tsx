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
import { type ResetPasswordFormData, processError, resetPasswordSchema } from "@/lib";
import { type UIDTokenProps } from "@/types";
import { useResetPasswordConfirmMutation } from "@/state/auth/authApiSlice";
import { changeOpenAuth } from "@/state/auth/authSlice";
import { openToast } from "@/state/toast/toastSlice";

const ResetPassword = ({ uid, token }: UIDTokenProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [resetPassword, { isLoading }] = useResetPasswordConfirmMutation();

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      reset_password: "",
      reset_repeat_password: "",
    },
  });

  const handleResetPasswordSubmit = (data: ResetPasswordFormData) => {
    resetPassword({
      uid: uid,
      token: token,
      new_password: data.reset_password.trim(),
      re_new_password: data.reset_repeat_password.trim(),
    })
      .unwrap()
      .then(() => {
        dispatch(
          openToast({
            openToast: true,
            title: "Password Reset Successful",
            message: "Please log in to continue.",
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
            title: "Password Reset Unsuccessful",
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
          <form onSubmit={resetPasswordForm.handleSubmit(handleResetPasswordSubmit)} noValidate>
            <Box className="space-y-4">
              <InputField
                name="reset_password"
                id="reset-password"
                label="New Password"
                type="password"
                control={resetPasswordForm.control}
              />

              <InputField
                name="reset_repeat_password"
                id="reset-repeat-password"
                label="Repeat New Password"
                type="password"
                control={resetPasswordForm.control}
              />

              <Button
                variant="contained"
                className="w-full !rounded-xl !bg-primary h-14"
                size="large"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Submit New Password"}
              </Button>
            </Box>
          </form>
        </Box>
      </Stack>
    </Box>
  );
};

export default ResetPassword;
