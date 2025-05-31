"use client";

import type { LatLngTuple, LeafletMouseEvent } from "leaflet";
import { useMapEvent } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { mapId } from "@/constants";
import { type RootState } from "@/state/store";
import { changeDrawingVertices, changePreviewPolygon } from "@/state/tool/toolSlice";

const MeterInteraction = () => {
  const dispatch = useDispatch();
  const currentDrawingVertices = useSelector((state: RootState) => state.tool.drawingVertices);

  useMapEvent("click", (event: LeafletMouseEvent) => {
    const target = event.originalEvent.target as HTMLElement;

    const { lat, lng } = event.latlng;
    const nextLatLng = [lat, lng] as LatLngTuple;

    if (target.id === mapId) {
      // Add new point to drawing draft
      const updatedVertices = [...currentDrawingVertices, nextLatLng];
      dispatch(changeDrawingVertices(updatedVertices));

      // Check if we have at least 3 points (including the one we just added)
      if (updatedVertices.length >= 3) {
        const firstLatLng = currentDrawingVertices[0];
        dispatch(changePreviewPolygon([...updatedVertices, firstLatLng]));
      }

      event.originalEvent.stopPropagation();
    }
  });

  return null;
};

export default MeterInteraction;
