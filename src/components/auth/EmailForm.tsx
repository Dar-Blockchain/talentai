import { Box, TextField } from "@mui/material";
import { Email as EmailIcon } from "@mui/icons-material";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface EmailFormProps {
  register: UseFormRegister<{ email: string }>;
  errors: FieldErrors<{ email: string }>;
  loading: boolean;
  isLoading: boolean;
  textFieldInputProps: any;
  textFieldLabelProps: any;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmailForm: React.FC<EmailFormProps> = ({
  register,
  errors,
  loading,
  isLoading,
  textFieldInputProps,
  textFieldLabelProps,
  onSubmit,
}) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mb: 2 }}>
      <TextField
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={loading || isLoading}
        fullWidth
        variant="outlined"
        label="Email Address"
        slotProps={{
          input: {
            startAdornment: (
              <EmailIcon sx={{ mr: 1, color: "rgba(0, 0, 0, 0.7)" }} />
            ),
            ...textFieldInputProps,
          },
          inputLabel: textFieldLabelProps,
        }}
      />
    </Box>
  );
};
