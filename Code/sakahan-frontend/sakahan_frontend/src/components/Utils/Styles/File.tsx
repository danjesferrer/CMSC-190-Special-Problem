import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";

export const DropZone = styled(Box)(() => ({
  border: "2px dashed var(--secondary)",
  borderRadius: "12px",
  padding: "8px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
}));

export const FilesContainer = styled(Box)(() => ({
  display: "flex",
  overflowX: "auto",
  gap: "10px",
  padding: "10px 0px",
  "&::-webkit-scrollbar-track": {
    borderRadius: "12px",
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: "12px",
  },
}));

export const FileChip = styled(Chip)(() => ({
  maxWidth: "200px",
  height: "28px",

  color: "var(--tertiary)",
  border: "1px solid var(--secondary)",
  "& .MuiChip-label": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "0.8rem",
  },
  "&.MuiChip-root": {
    color: "var(--tertiary)",
  },
}));

export const HiddenInput = styled("input")({
  display: "none",
});
