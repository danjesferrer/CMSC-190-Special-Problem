"use client";

import { useState } from "react";
import { type Control, Controller, type Path } from "react-hook-form";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import type { InputFieldProps, LoginType, RegisterType, ResetEmailType, ResetPasswordType } from "@/types";

const InputField = <T extends RegisterType | LoginType | ResetEmailType | ResetPasswordType>({
  name,
  id,
  label,
  type,
  control,
}: InputFieldProps & { control: Control<T, any>; name: Path<T> }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl className="w-full" variant="outlined" error={!!fieldState.error && !!field.value} required>
          <InputLabel htmlFor={id} className="!text-secondary">
            {label}
          </InputLabel>
          <OutlinedInput
            id={id}
            label={label}
            {...field}
            type={type === "password" && !showPassword ? "password" : "text"}
            endAdornment={
              type === "password" ? (
                <InputAdornment position="start">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ) : null
            }
            className="[&_.MuiOutlinedInput-notchedOutline]:!border-2 [&_.MuiOutlinedInput-notchedOutline]:!border-secondary !rounded-xl"
          />
          {fieldState.error && (field.value || type === "name") && (
            <FormHelperText error>{fieldState.error.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export default InputField;
