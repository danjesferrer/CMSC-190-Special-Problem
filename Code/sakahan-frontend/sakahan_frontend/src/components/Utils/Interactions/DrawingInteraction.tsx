"use client";

import type { LatLngTuple, LeafletMouseEvent } from "leaflet";
import { useMapEvents } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { mapId, snapTolerance } from "@/constants";
import { ToastType } from "@/enums";
import { getPointDistance } from "@/lib";
import { type RootState } from "@/state/store";
import { openToast } from "@/state/toast/toastSlice";
import {
  changeDrawingComplete,
  changeDrawingVertices,
  changePreviewPolygon,
  populateAlteringDraft,
  populateHistory,
  resetAllProgressDraft,
  resetHistory,
} from "@/state/tool/toolSlice";

const DrawingInteraction = () => {
  const dispatch = useDispatch();

  const currentDrawingVertices = useSelector((state: RootState) => state.tool.drawingVertices);
  const currentDrawingComplete = useSelector((state: RootState) => state.tool.drawingComplete);

  const completeDrawing = () => {
    if (currentDrawingVertices.length < 3) {
      dispatch(
        openToast({
          openToast: true,
          title: "Drawing Failed",
          message: "Polygon must have at least 3 points.",
          severity: ToastType.ERROR,
        }),
      );

      return;
    }

    dispatch(
      changeDrawingComplete([...currentDrawingComplete, [...currentDrawingVertices, currentDrawingVertices[0]]]),
    ); // Add the last point to close the polygon.
    dispatch(populateAlteringDraft()); // Save the current drawing to altering draft.
    dispatch(resetHistory()); // Reset the history.
    dispatch(resetAllProgressDraft()); // Reset the progress.
  };

  const map = useMapEvents({
    zoomend: () => {
      dispatch(changePreviewPolygon([])); // Reset the drawing preview when zooming in/out.
    },
    mousemove: (event: LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;

      // Only show preview polygon if there are at least 3 points in the draft.
      if (currentDrawingVertices.length < 3) return;
      const firstLatLng = currentDrawingVertices[0];
      const mouseLatLng = [lat, lng] as LatLngTuple;

      const distance = getPointDistance(map.latLngToLayerPoint(firstLatLng), map.latLngToLayerPoint(mouseLatLng));

      // If the distance is less than the snap tolerance, close the polygon by adding the first point, otherwise, add the mouse point.
      if (distance < snapTolerance) {
        dispatch(changePreviewPolygon([...currentDrawingVertices, firstLatLng, firstLatLng]));
      } else {
        dispatch(changePreviewPolygon([...currentDrawingVertices, mouseLatLng, firstLatLng]));
      }
    },
    click: (event: LeafletMouseEvent) => {
      const target = event.originalEvent.target as HTMLElement;

      const { lat, lng } = event.latlng;
      const nextLatLng = [lat, lng] as LatLngTuple;

      // Check if the user is trying to close the polygon with at least 2 points in the draft.
      if (currentDrawingVertices.length + 1 > 2) {
        const firstLatLng = currentDrawingVertices[0];
        // Get distance between the first point and next point.
        const distance = getPointDistance(map.latLngToLayerPoint(firstLatLng), map.latLngToLayerPoint(nextLatLng));

        // Check if we're near the first point for closing the polygon.
        if (distance < snapTolerance) {
          completeDrawing();
          return;
        }
      }

      if (target.id === mapId) {
        dispatch(populateHistory()); // Save the initial state to history.
        dispatch(changeDrawingVertices([...currentDrawingVertices, nextLatLng])); // Add new point to drawing draft.
        dispatch(changePreviewPolygon([])); // Reset the drawing preview when adding a new point.
        event.originalEvent.stopPropagation();
      }
    },
  });

  return null;
};

export default DrawingInteraction;
