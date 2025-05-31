import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { AddIcon } from "@/components/Icons/";
import { defaultAddValue, defaultSelectValue } from "@/constants";
import { enableInteraction, getFilterFormattedText } from "@/lib";
import type { Crop, CropElement, SuitabilityLevel } from "@/types";
import {
  changeAddedCropElement,
  changeCropElementList,
  changeSelectedCrop,
  changeSelectedCropElement,
  type changeSelectedSuitabilityLevel,
  toggleIsCropAdding,
  toggleIsCropElementAdding,
} from "@/state/contribution/contributionSlice";
import { type RootState } from "@/state/store";

interface SelectFieldProps {
  id: string;
  label: string;
  isLoading: boolean;
  disabled: boolean;
  currentSelectedValue: Crop | CropElement | SuitabilityLevel | null;
  currentIterableList: Crop[] | CropElement[] | SuitabilityLevel[];
  handleSelectionChange:
    | typeof changeSelectedCrop
    | typeof changeSelectedCropElement
    | typeof changeSelectedSuitabilityLevel;
}

const SelectField = ({
  id,
  label,
  isLoading,
  disabled,
  currentSelectedValue,
  currentIterableList,
  handleSelectionChange,
}: SelectFieldProps) => {
  const map = useMap();
  const dispatch = useDispatch();

  const isSuitability = id === "suitability-area";
  const isCrop = id === "crop-area";
  const isElement = id === "element-area";

  const currentPreviewRecord = useSelector((state: RootState) => state.contribution.previewRecord);

  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 350,
        borderRadius: 12,
        border: "1px solid var(--divider)",
        backgroundColor: "var(--background)",
      },
    },
  };

  const onSelectionChange = (event: SelectChangeEvent) => {
    // Default behavior when selecting a crop.
    if (isCrop) {
      dispatch(changeSelectedCropElement(null));
      dispatch(changeAddedCropElement(currentPreviewRecord?.crop_element?.name ?? ""));
      dispatch(changeCropElementList([]));
    }

    // User select none. Would be an additional behavior from default behavior for crop selection.
    if (event.target.value === defaultSelectValue) {
      dispatch(handleSelectionChange(null));
      dispatch(toggleIsCropElementAdding(false));
      return;
    }

    // User select add new.
    if (event.target.value === defaultAddValue) {
      // Would be an additional behavior also from default behavior for crop selection.
      if (isCrop) {
        dispatch(toggleIsCropAdding());
        dispatch(toggleIsCropElementAdding(false));
        dispatch(changeSelectedCrop(null));
      }

      // When the user selects add new for crop element, we need to reset the selected crop element.
      if (isElement) {
        dispatch(toggleIsCropElementAdding());
        dispatch(changeSelectedCropElement(null));
      }

      return;
    }

    const selectedItem = currentIterableList.find((iterable) => iterable.code === event.target.value)!;
    dispatch(handleSelectionChange(selectedItem as Crop & CropElement & SuitabilityLevel));
  };

  return (
    <FormControl className="w-full" variant="outlined" required>
      <InputLabel htmlFor={id} className="!text-secondary">
        {label}
      </InputLabel>
      <Select
        id={id}
        value={isLoading ? "" : (currentSelectedValue?.code ?? defaultSelectValue)}
        renderValue={(value) => {
          if (isLoading) return undefined;
          if (value === defaultSelectValue) return `Select ${!isElement ? "Potential" : ""} ${label}`;
          if (isCrop) return getFilterFormattedText(value);
          const found = currentIterableList.find((iterable) => {
            return iterable.code === value;
          });

          if (!isSuitability) return (found as Crop | CropElement)!.name;
          return (found as SuitabilityLevel)!.label;
        }}
        label={label}
        className="[&_.MuiOutlinedInput-notchedOutline]:!border-2 [&_.MuiOutlinedInput-notchedOutline]:!border-secondary !rounded-xl"
        MenuProps={menuProps}
        onClose={() => {
          requestAnimationFrame(() => {
            enableInteraction(map);
          });
        }}
        onChange={onSelectionChange}
        IconComponent={(props) => {
          return isLoading ? (
            <Box className="flex justify-center mr-4">
              <CircularProgress size={24} color="inherit" />
            </Box>
          ) : (
            <ArrowDropDown {...props} />
          );
        }}
        disabled={isLoading || disabled}
      >
        {(isCrop || isElement) && (
          <MenuItem key={defaultAddValue} value={defaultAddValue}>
            <ListItemIcon>
              <AddIcon className="text-secondary w-[24px] h-[24px]" />
            </ListItemIcon>
            <ListItemText>Add New</ListItemText>
          </MenuItem>
        )}

        {(isCrop || isElement) && <Divider />}

        <MenuItem key={defaultSelectValue} value={defaultSelectValue}>
          <Typography className="!italic">None</Typography>
        </MenuItem>

        {currentIterableList.map((iterable) => {
          const isUnpublished = !(iterable as Crop | CropElement).published;
          const isDeleted = (iterable as Crop | CropElement).isDeleted ?? false;

          return (
            !isDeleted && (
              <MenuItem key={iterable.code} value={iterable.code}>
                {isSuitability && (
                  <Box
                    className="w-4 h-4 mr-2"
                    sx={{
                      backgroundColor: (iterable as SuitabilityLevel).color,
                    }}
                  />
                )}
                {iterable.name}
                {(isCrop || isElement) && isUnpublished && (
                  <Chip
                    label="New Crop"
                    size="small"
                    className="ml-2"
                    sx={{
                      "&.MuiChip-root": {
                        bgcolor: "var(--primary)",
                        color: "var(--background)",
                      },
                    }}
                  />
                )}
              </MenuItem>
            )
          );
        })}
      </Select>
    </FormControl>
  );
};

export default SelectField;
