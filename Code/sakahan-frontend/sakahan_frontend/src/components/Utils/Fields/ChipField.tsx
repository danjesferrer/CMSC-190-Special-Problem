import { useDispatch, useSelector } from "react-redux";
import Chip from "@mui/material/Chip";
import { statusColors } from "@/constants";
import { type StatusType } from "@/enums";
import { changeSelectedFilter, changeSelectedPage } from "@/state/record/recordSlice";
import { type RootState } from "@/state/store";

interface ChipFieldProps {
  label: StatusType;
}

const ChipField = ({ label }: ChipFieldProps) => {
  const dispatch = useDispatch();
  const currentSelectedFilter = useSelector((state: RootState) => state.record.selectedFilter);

  const isSelected = currentSelectedFilter === label;
  const color = statusColors[label];

  return (
    <Chip
      label={label}
      onClick={() => {
        if (currentSelectedFilter === label) return;
        dispatch(changeSelectedFilter(label));
        dispatch(changeSelectedPage(1));
      }}
      variant="outlined"
      sx={{
        "&.MuiChip-root": {
          bgcolor: isSelected ? `${color}` : "transparent",
          color: isSelected ? "var(--background)" : "var(--tertiary)",
          borderColor: isSelected ? `${color}` : "var(--divider)",
          border: "2px solid",
          fontSize: "1rem",
          lineHeight: "1.5rem",
          fontWeight: "bolder",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            color: color,
            borderColor: color,
            backgroundColor: "var(--background)",
          },
        },
      }}
    />
  );
};

export default ChipField;
