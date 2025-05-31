"use client";

import { type LatLngTuple } from "leaflet";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { Divider, FormControl, InputLabel, List, ListItemButton, ListItemText, OutlinedInput } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import { SearchOutlinedIcon } from "@/components/Icons/";
import { disableInteraction, enableInteraction } from "@/lib";
import { type SearchType } from "@/types";
import { changeSearch, changeSearchList, changeSelectedGeometryFeature } from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";

const Search = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentSearch = useSelector((state: RootState) => state.map.search);
  const currentSearchList = useSelector((state: RootState) => state.map.searchList);

  const [searchQuery, setSearchQuery] = useState(currentSearch?.search_query ?? "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (searchQuery.trim() === "") {
      if (currentSearchList.length > 0) dispatch(changeSearchList([])); // reset search list if there is a current search list
      if (isLoading) setIsLoading(false); // only set isLoading to false if already isLoading
      return;
    }

    // if search query is the same as the current search query and there are search results, do not fetch
    if (currentSearch !== null && searchQuery === currentSearch.search_query && currentSearchList.length > 0) return;

    if (!isLoading) setIsLoading(true); // only set isLoading to true if not already isLoading
    if (currentSearch !== null) dispatch(changeSearch(null)); // reset search if there is a current search
    if (currentSearchList.length > 0) dispatch(changeSearchList([])); // reset search list if there is a current search list

    const abortController = new AbortController();
    const fetchResults = debounce(async () => {
      try {
        const response = await fetch(`/api/nominatim?q=${encodeURIComponent(searchQuery.trim())}`, {
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

        const result = await response.json();
        if (isCurrent)
          dispatch(changeSearchList(result.data.map((search: any) => ({ ...search, search_query: searchQuery }))));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.log(error);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }, 500);

    fetchResults();

    return () => {
      isCurrent = false;
      abortController.abort();
      fetchResults.cancel();
    };
  }, [searchQuery]);

  const handleResultClick = (search: SearchType, boundingbox: LatLngTuple[]) => {
    dispatch(changeSearch(search));

    map.flyToBounds(boundingbox, { animate: true, padding: [20, 20], duration: 2 });
  };

  return (
    <Box
      className="card p-8 overflow-auto h-min max-h-[450px] w-[450px]"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Typography className="!font-black !text-2xl text-tertiary !mb-4">Search Area</Typography>

      <FormControl className="w-full" variant="outlined">
        <InputLabel htmlFor="search-area" className="!text-secondary">
          Search
        </InputLabel>
        <OutlinedInput
          id="search-area"
          label="Search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <SearchOutlinedIcon className="text-secondary w-[24px] h-[24px]" />
            </InputAdornment>
          }
          className="[&_.MuiOutlinedInput-notchedOutline]:!border-2 [&_.MuiOutlinedInput-notchedOutline]:!border-secondary !rounded-xl"
        />
      </FormControl>

      {isLoading ? (
        <Box className="flex justify-center mt-4">
          <CircularProgress size={24} color="inherit" />
        </Box>
      ) : currentSearchList.length > 0 ? (
        <List className="mt-4">
          {currentSearchList.map((result, index) => (
            <Box key={index}>
              <ListItemButton
                onClick={() => {
                  const bounds = result.boundingbox.map((bound) => Number.parseFloat(bound));
                  const southWest: LatLngTuple = [bounds[1], bounds[3]];
                  const northEast: LatLngTuple = [bounds[0], bounds[2]];
                  const boundingbox = [southWest, northEast];

                  handleResultClick(result, boundingbox);
                  dispatch(changeSelectedGeometryFeature(null));
                }}
              >
                <ListItemText primary={result.display_name} />
              </ListItemButton>
              {index < currentSearchList.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      ) : (
        searchQuery.length !== 0 && (
          <Typography className="!mt-4 text-secondary text-center">No results found</Typography>
        )
      )}
    </Box>
  );
};

export default Search;
