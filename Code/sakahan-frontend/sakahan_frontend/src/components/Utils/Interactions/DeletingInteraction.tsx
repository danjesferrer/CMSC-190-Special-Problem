"use client";

import { type CircleMarkerOptions, Polygon, type PolylineOptions } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@/state/store";
import { changeAlteringDraft } from "@/state/tool/toolSlice";

interface ExtendedShapeOptions extends PolylineOptions, CircleMarkerOptions {
  "demo-id": number; // Add your custom property here
}

const DeletingInteraction = () => {
  const map = useMap();
  const dispatch = useDispatch();

  const currentAlteringDraft = useSelector((state: RootState) => state.tool.alteringDraft);

  // This effect is used to handle the editing of polygons when the user clicks on them.
  useEffect(() => {
    // Create listener for each added polygon on the map if the tool is editing.
    map.eachLayer((layer) => {
      if (layer instanceof Polygon) {
        layer.on("click", () => deletePolygon(layer)); // Call editPolygon function when a polygon is clicked.
      }
    });

    // Clean up the event listeners when the component is unmounted or when the tool changes.
    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof Polygon) {
          layer.off("click"); // Remove the click event listener from the polygon.
        }
      });
    };
  }, [currentAlteringDraft]);

  const deletePolygon = (polygon: Polygon) => {
    const polygonId = (polygon.options as ExtendedShapeOptions)["demo-id"];

    dispatch(
      changeAlteringDraft(currentAlteringDraft.filter((_, index) => index !== polygonId)), // Remove the polygon from the alteringDraft array.
    );
  };

  return null;
};

export default DeletingInteraction;
