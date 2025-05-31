"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HttpStatusCode } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AppLogoIcon, AppNameIcon, CloseIcon, GoogleIcon } from "@/components/Icons/";
import InputField from "@/components/Utils/Fields/InputField";
import { loginFields, registerFields } from "@/constants";
import { ToastType } from "@/enums";
import {
  type LoginFormData,
  type RegisterFormData,
  disableInteraction,
  enableInteraction,
  loginSchema,
  processError,
  registerSchema,
} from "@/lib";
import type { LoginName, RegisterName } from "@/types";
import { useLoginMutation, useRegisterMutation } from "@/state/auth/authApiSlice";
import { changeOpenAuth, setAuth } from "@/state/auth/authSlice";
import { type RootState } from "@/state/store";
import { openToast } from "@/state/toast/toastSlice";

const AuthForm = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentOpenAuth = useSelector((state: RootState) => state.auth.openAuth);
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [isSocialAuthLoading, setIsSocialAuthLoading] = useState(false);

  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      login_email: "",
      login_password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      last_name: "",
      register_email: "",
      register_password: "",
      register_repeat_password: "",
    },
  });

  const handleFormToggle = () => {
    setIsLogin(!isLogin);

    if (isLogin) {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
  };

  const handleLoginSubmit = (data: LoginFormData) => {
    login({
      email: data.login_email.trim(),
      password: data.login_password.trim(),
    })
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

        dispatch(changeOpenAuth(false));
        dispatch(setAuth());
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
      });
  };

  const handleRegisterSubmit = (data: RegisterFormData) => {
    register({
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.register_email.trim(),
      password: data.register_password.trim(),
      re_password: data.register_repeat_password.trim(),
    })
      .unwrap()
      .then(() => {
        dispatch(
          openToast({
            openToast: true,
            title: "Registration Successful",
            message: "Please check your email to verify account.",
            severity: ToastType.SUCCESS,
          }),
        );

        loginForm.setValue("login_email", data.register_email); // pre-fill email for convenience
        handleFormToggle(); // switch to login form
      })
      .catch((error) => {
        const message = processError(error);
        dispatch(
          openToast({
            openToast: true,
            title: "Registration Unsuccessful",
            message: message,
            severity: ToastType.ERROR,
          }),
        );
      });
  };

  const handleSocialAuthentication = async (provider: string, redirect: string) => {
    try {
      setIsSocialAuthLoading(true);
      const url = `${process.env.NEXT_PUBLIC_HOST}/api/o/${provider}/?redirect_uri=${
        process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_REDIRECT_URL : "http://localhost:3000"
      }/auth/${redirect}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();

      if (response.status === HttpStatusCode.Ok && typeof window !== "undefined") {
        window.location.replace(data.authorization_url);
      } else {
        dispatch(
          openToast({
            openToast: true,
            title: "Authentication Unsuccessful",
            message: "Something went wrong. Please try again.",
            severity: ToastType.ERROR,
          }),
        );
      }
    } catch (error) {
      const message = processError(error);
      dispatch(
        openToast({
          openToast: true,
          title: "Authentication Unsuccessful",
          message: message,
          severity: ToastType.ERROR,
        }),
      );
    } finally {
      setIsSocialAuthLoading(false);
    }
  };

  const showTemporarilyDisabled = () => {
    dispatch(
      openToast({
        openToast: true,
        title: "Temporarily Disabled",
        message: "Please use Google authentication for now, as testing is still ongoing.",
        severity: ToastType.INFO,
      }),
    );
  };

  const isLoading = isLoginLoading || isSocialAuthLoading || isRegisterLoading;

  return (
    <Backdrop open={currentOpenAuth} className="z-[1000] backdrop-blur-sm" aria-hidden={false}>
      <Box
        className="card relative overflow-auto h-min max-h-[1000px] max-w-[500px] p-8 rounded-2xl shadow-lg"
        onMouseEnter={() => disableInteraction(map)}
        onMouseLeave={() => enableInteraction(map)}
      >
        <Box className="absolute top-0 right-0 mt-4 mr-4">
          <IconButton onClick={() => dispatch(changeOpenAuth(false))}>
            <CloseIcon className="text-secondary w-[24px] h-[24px]" />
          </IconButton>
        </Box>

        <Box className="flex items-center justify-center mb-8">
          <Stack direction="row" spacing={1} alignItems="center">
            <AppLogoIcon className="text-primary w-[113px] h-[73px]" />
            <AppNameIcon className="text-primary w-[217px] h-[40px]" />
          </Stack>
        </Box>

        <Box className="mb-8 text-center">
          <Typography className="!font-bold !text-2xl !mb-2 text-tertiary">
            {isLogin ? "Sign In" : "Create Account"}
          </Typography>
          <Typography className="!font-semibold !text-lg text-quaternary">
            {isLogin ? "Welcome back! Please log in to continue." : "Create an account to contribute data."}
          </Typography>
        </Box>

        <form
          onSubmit={
            isLogin ? loginForm.handleSubmit(handleLoginSubmit) : registerForm.handleSubmit(handleRegisterSubmit)
          }
          noValidate
        >
          <Box className="space-y-4">
            {isLogin ? (
              // Login form
              <Box className="space-y-4">
                {loginFields.map((field) => (
                  <InputField
                    key={field.name}
                    name={field.name as LoginName}
                    id={field.id}
                    label={field.label}
                    type={field.type}
                    control={loginForm.control}
                  />
                ))}
                <Box className="flex justify-end items-center">
                  <Link href="/password-reset">
                    <Typography className="text-primary w-fit">Forgot Password</Typography>
                  </Link>
                </Box>
              </Box>
            ) : (
              // Register form
              <Box className="space-y-4">
                {registerFields.map((field) => (
                  <InputField
                    key={field.name}
                    name={field.name as RegisterName}
                    id={field.id}
                    label={field.label}
                    type={field.type}
                    control={registerForm.control}
                  />
                ))}
              </Box>
            )}

            <Button
              variant="contained"
              className="w-full !rounded-xl !bg-primary h-14"
              size="large"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && !isSocialAuthLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </Button>

            <Divider className="text-lg text-quaternary font-normal">OR</Divider>

            <Button
              variant="contained"
              disabled={isLoading}
              className="w-full !rounded-xl !bg-secondary h-14"
              size="large"
              onClick={() => handleSocialAuthentication("google-oauth2", "google")}
              startIcon={!isSocialAuthLoading ? <GoogleIcon className="w-[24px] h-[24px]" /> : undefined}
            >
              {isSocialAuthLoading ? <CircularProgress size={24} color="inherit" /> : "Continue with Google"}
            </Button>
          </Box>
        </form>

        <Box className="mt-6 text-center">
          {isLogin ? (
            <Typography className="!text-md text-quaternary">
              Don&apos;t have an account?{" "}
              <Button className="!text-primary" disabled={isLoading} onClick={showTemporarilyDisabled}>
                Sign up
              </Button>
            </Typography>
          ) : (
            <Typography className="!text-md text-quaternary">
              Already have an account?
              <Button className="!text-primary" disabled={isLoading} onClick={handleFormToggle}>
                Sign in
              </Button>
            </Typography>
          )}
        </Box>
      </Box>
    </Backdrop>
  );
};

export default AuthForm;
