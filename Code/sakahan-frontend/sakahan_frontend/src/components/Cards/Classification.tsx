"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import Typography from "@mui/material/Typography";
import { disableInteraction, enableInteraction, toSentenceCase } from "@/lib";
import { type ClassificationType } from "@/types";
import { useGetAllSuitabilityLevelQuery } from "@/state/map/mapApiSlice";
import { changeClassification, changeClassificationList, changeSelectedGeometryFeature } from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";

const Classification = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const currentFilter = useSelector((state: RootState) => state.map.filter);
  const currentClassification = useSelector((state: RootState) => state.map.classification);
  const currentClassificationList = useSelector((state: RootState) => state.map.classificationList);

  const { data, isLoading, isFetching } = useGetAllSuitabilityLevelQuery(undefined);

  useEffect(() => {
    if (currentClassification.length > 0) return;
    if (isLoading || isFetching) return;

    if (data) {
      dispatch(changeClassification(data.map((classification: any) => ({ ...classification, selected: true }))));

      const categories: string[] = ["Moderately suitable with limitation in", "Marginally suitable with limitation in"];

      dispatch(
        changeClassificationList(
          data.reduce((accumulator: Record<string, ClassificationType[]>, classification: ClassificationType) => {
            const category = categories.find((category) => classification.name.includes(category));

            if (category) {
              if (!accumulator[category]) {
                accumulator[category] = [];
              }

              accumulator[category].push(classification);

              return accumulator;
            }

            accumulator["Others"] = [classification];

            return accumulator;
          }, {}),
        ),
      );
    }
  }, [data]);

  const handleClassificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeSelectedGeometryFeature(null));
    dispatch(
      changeClassification(
        currentClassification.map((classification) =>
          classification.label === event.target.value
            ? { ...classification, selected: event.target.checked }
            : classification,
        ),
      ),
    );
  };

  const groups: string[] = [];

  return (
    <Box
      className="card p-8 overflow-auto h-min max-h-[450px] w-[450px]"
      onMouseEnter={() => disableInteraction(map)}
      onMouseLeave={() => enableInteraction(map)}
    >
      <Typography className="!font-black !text-2xl text-tertiary !mb-4">Suitability Level</Typography>

      {isLoading || isFetching ? (
        <Box className="flex justify-center mt-4">
          <CircularProgress size={24} color="inherit" />
        </Box>
      ) : currentFilter ? (
        Object.entries(currentClassificationList).map(([group, classifications]) => {
          if (!groups.includes(group)) {
            groups.push(group);
          }

          return (
            <FormControl key={group}>
              {group !== "Others" && (
                <FormLabel className="mt-4 mb-2" focused={false}>
                  <Typography className="!font-bold text-tertiary">{`${group}:`}</Typography>
                </FormLabel>
              )}
              <FormGroup row={false}>
                {classifications.map((classification) => {
                  const name = classification.name.replace(group, "").trim();

                  return (
                    <FormControlLabel
                      key={classification.label}
                      control={
                        <Checkbox
                          checked={currentClassification[classification.id - 1].selected}
                          onChange={handleClassificationChange}
                          value={classification.label}
                          className="!py-[4px]"
                          sx={{
                            color: `${classification.color}`,
                            "&.Mui-checked": {
                              color: `${classification.color}`,
                            },
                          }}
                        />
                      }
                      label={<Typography className="text-tertiary">{toSentenceCase(name)}</Typography>}
                    />
                  );
                })}
              </FormGroup>
            </FormControl>
          );
        })
      ) : (
        <Typography className="!mt-4 text-secondary text-center">
          Please select a crop to view the suitability level.
        </Typography>
      )}
    </Box>
  );
};

export default Classification;
