import {
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Box,
  Button,
  TextField,
  TextareaAutosize,
  MenuItem,
} from "@mui/material";

export type EntityFormField = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
};

type Props<T> = {
  fields: EntityFormField[];
  initialValues?: Partial<T>;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel?: () => void;
  submitLabel?: string;
  childrenBeforeActions?: ReactNode;
};

export function EntityForm<T>({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  childrenBeforeActions,
}: Props<T>): ReactElement {
  const iv = (initialValues ?? {}) as Record<string, unknown>;

  const [formState, setFormState] = useState<Record<string, unknown>>(() =>
    fields.reduce(
      (acc, f) => {
        acc[f.key] = iv[f.key] ?? f.defaultValue ?? "";
        return acc;
      },
      {} as Record<string, unknown>
    )
  );

  const handleChange = (key: string, value: unknown) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        border: "1px solid #ccc",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {fields.map((field) =>
        field.type === "textarea" ? (
          <Box key={field.key} sx={{ display: "flex", flexDirection: "column" }}>
            <label>{field.label}:</label>
            <TextareaAutosize
              minRows={4}
              value={(formState[field.key] as string) ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              required={field.required}
              style={{ padding: 8, fontFamily: "inherit" }}
            />
          </Box>
        ) : field.type === "select" ? (
          <TextField
            key={field.key}
            select
            label={field.label}
            value={(formState[field.key] as string) ?? ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
          >
            {(field.options ?? []).map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            key={field.key}
            label={field.label}
            type={field.type || "text"}
            value={
              field.type === "number"
                ? formState[field.key] === "" || formState[field.key] === undefined
                  ? ""
                  : String(formState[field.key])
                : ((formState[field.key] as string | number | undefined) ?? "")
            }
            onChange={(e) =>
              handleChange(
                field.key,
                field.type === "number"
                  ? e.target.value === ""
                    ? ""
                    : Number(e.target.value)
                  : e.target.value
              )
            }
            required={field.required}
            inputProps={{
              ...(field.min !== undefined ? { min: field.min } : {}),
              ...(field.max !== undefined ? { max: field.max } : {}),
            }}
          />
        )
      )}

      {childrenBeforeActions}

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button type="submit" variant="contained" color="primary">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
}
