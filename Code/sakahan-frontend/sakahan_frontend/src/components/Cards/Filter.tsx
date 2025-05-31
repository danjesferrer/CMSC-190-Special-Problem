"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { categories, defaultCategoryValue, defaultSelectValue } from "@/constants";
import { CardType, CategoryType } from "@/enums";
import { disableInteraction, enableInteraction, getFilterFormattedText } from "@/lib";
import { type FilterType } from "@/types";
import {
  changeCard,
  changeCategory,
  changeFilter,
  changeFilterList,
  changeSelectedGeometryFeature,
} from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";

const Filter = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentFilter = useSelector((state: RootState) => state.map.filter);
  const currentFilterList = useSelector((state: RootState) => state.map.filterList);
  const currentCategory = useSelector((state: RootState) => state.map.category);

  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (currentCategory === CategoryType.NONE) return;
    if (currentFilter !== null) return;

    setIsLoading(true);
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/aggregates?type=${encodeURIComponent(currentCategory.toLowerCase())}`);

        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

        const result = await response.json();
        dispatch(changeFilterList(result.data.map((filter: any) => ({ ...filter }))));
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [currentCategory]);

  const handleSelectChange = (event: SelectChangeEvent) => {
    dispatch(changeSelectedGeometryFeature(null));
    if (currentCategory === CategoryType.NONE) {
      dispatch(changeCategory(event.target.value as CategoryType));
      return;
    }

    if (event.target.value === defaultCategoryValue) {
      dispatch(changeFilter(null));
      dispatch(changeCategory(CategoryType.NONE));
      return;
    }

    if (event.target.value === defaultSelectValue) {
      dispatch(changeFilter(null));
      return;
    }

    // Get the actual filter object from the list
    let filter = currentFilterList.find((filter: FilterType) => {
      return filter.category?.code === event.target.value || filter.code === event.target.value;
    })!;

    // Create a new FilterType object if the selected element is also itself. Only works for current category type only.
    if (filter.category?.code === event.target.value) filter = { ...filter.category, category: null };

    dispatch(changeFilter(filter));
    dispatch(changeCard(CardType.CLASSIFICATION));
  };

  // Prepare the menu items with categories
  const renderMenuItems = () => {
    if (currentCategory === CategoryType.NONE) {
      return categories.map((category) => (
        <MenuItem key={category} value={category}>
          {category}
        </MenuItem>
      ));
    }

    if (isLoading) return null;

    const defaultItems = [
      <MenuItem key={defaultCategoryValue} value={defaultCategoryValue}>
        <Typography className="!italic">Select Category</Typography>
      </MenuItem>,
      <MenuItem key={defaultSelectValue} value={defaultSelectValue}>
        <Typography className="!italic">None</Typography>
      </MenuItem>,
    ];

    // Group filters by category
    const categorizedItems: React.ReactNode[] = [];
    const processedCategories = new Set<string>();

    currentFilterList.forEach((filter, index) => {
      if (!filter.isDeleted) {
        if (filter.category && !processedCategories.has(filter.category.name)) {
          processedCategories.add(filter.category.name);
          categorizedItems.push(
            <ListSubheader key={`${filter.category.code}_listsubheader`}>{filter.category.name}</ListSubheader>,
          );
          if (currentCategory === CategoryType.CURRENT) {
            categorizedItems.push(
              <MenuItem
                key={`${filter.category.code}_menuitem`}
                value={filter.category.code}
                sx={{ pl: filter.category ? 4 : 2 }}
              >
                Uncategorized {filter.category.name}
              </MenuItem>,
            );
          }
        }

        categorizedItems.push(
          <MenuItem key={index} value={filter.code} sx={{ pl: filter.category ? 4 : 2 }}>
            {`${filter.name} ${filter.category?.name ?? ""}`}
            {!filter.published && (
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
          </MenuItem>,
        );
      }
    });

    return [...defaultItems, ...categorizedItems];
  };

  return (
    <Box
      className="card p-8 overflow-auto h-min max-h-[450px] w-[450px]"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Typography className="!font-black !text-2xl text-tertiary !mb-4">Crop Suitability</Typography>

      <FormControl className="w-full" variant="outlined">
        <InputLabel htmlFor="filter-area" className="!text-secondary">
          Filter
        </InputLabel>
        <Select
          id="filter-area"
          value={
            currentCategory !== CategoryType.NONE
              ? isLoading
                ? ""
                : currentFilter
                  ? currentFilter.code
                  : defaultSelectValue
              : CategoryType.NONE
          }
          renderValue={(value) => {
            if (isLoading) return undefined;
            if (value === CategoryType.NONE) return "Select Category";
            if (value === defaultSelectValue) return `Select ${currentCategory} Crops`;
            return getFilterFormattedText(value);
          }}
          label="Filter"
          className="[&_.MuiOutlinedInput-notchedOutline]:!border-2 [&_.MuiOutlinedInput-notchedOutline]:!border-secondary !rounded-xl"
          MenuProps={menuProps}
          onClose={() => {
            requestAnimationFrame(() => {
              enableInteraction(map);
            });
          }}
          onChange={(event) => handleSelectChange(event)}
          IconComponent={(props) => {
            return isLoading ? (
              <Box className="flex justify-center mr-4">
                <CircularProgress size={24} color="inherit" />
              </Box>
            ) : (
              <ArrowDropDown {...props} />
            );
          }}
          disabled={isLoading}
        >
          {renderMenuItems()}
        </Select>
      </FormControl>
    </Box>
  );
};

export default Filter;
