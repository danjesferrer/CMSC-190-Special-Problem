import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";

interface TextAreaFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
  multiline?: boolean;
  minRows?: number;
  maxRows?: number;
  endAdornment?: React.ReactNode;
  helperText?: string;
  inputProps?: React.InputHTMLAttributes<HTMLTextAreaElement>;
  disabled: boolean;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
}
const TextAreaField = ({
  id,
  label,
  placeholder,
  value,
  multiline,
  minRows,
  maxRows,
  endAdornment,
  helperText,
  inputProps,
  disabled,
  onChange,
}: TextAreaFieldProps) => {
  return (
    <FormControl className="w-full" variant="outlined" required disabled={disabled}>
      <InputLabel htmlFor={id} className="!text-secondary">
        {label}
      </InputLabel>
      <OutlinedInput
        id={id}
        label={label}
        value={value}
        multiline={multiline}
        minRows={minRows}
        maxRows={maxRows}
        inputProps={inputProps}
        placeholder={placeholder}
        endAdornment={endAdornment}
        onChange={onChange}
        className="[&_.MuiOutlinedInput-notchedOutline]:!border-2 [&_.MuiOutlinedInput-notchedOutline]:!border-secondary !rounded-xl"
      />
      {helperText && <FormHelperText sx={{ textAlign: "right" }}>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default TextAreaField;
