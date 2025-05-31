"use client";

import {
  Circle,
  type CircleMarkerOptions,
  type LatLng,
  type LatLngTuple,
  type LeafletMouseEvent,
  Polygon,
  type PolylineOptions,
} from "leaflet";
import { useEffect } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { mapId } from "@/constants";
import { ToolType } from "@/enums";
import { type RootState } from "@/state/store";
import {
  changeAlteringDraft,
  changeEditingVertices,
  changeReferencePolygon,
  resetAllProgressDraft,
} from "@/state/tool/toolSlice";

interface ExtendedShapeOptions extends PolylineOptions, CircleMarkerOptions {
  "demo-id": number; // Add your custom property here
}

const EditingInteraction = () => {
  const map = useMap();
  const dispatch = useDispatch();

  const currentTool = useSelector((state: RootState) => state.map.tool);
  const currentEditingVertices = useSelector((state: RootState) => state.tool.editingVertices);
  const currentAlteringDraft = useSelector((state: RootState) => state.tool.alteringDraft);
  const currentReferencePolygon = useSelector((state: RootState) => state.tool.referencePolygon);

  // This effect is used to handle the editing of polygons when the user clicks on them.
  useEffect(() => {
    // Create listener for each added polygon on the map if the tool is editing.
    map.eachLayer((layer) => {
      if (layer instanceof Polygon) {
        layer.on("click", () => editPolygon(layer)); // Call editPolygon function when a polygon is clicked.
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
  }, [currentReferencePolygon, currentEditingVertices]);

  // This effect is used to handle the editing of vertices when the user clicks on a circle marker.
  useEffect(() => {
    const circles: Circle[] = []; // Store references to circle for proper cleanup

    // Create listener for each added circle on the map if a polygon is already selected.
    if (currentReferencePolygon) {
      map.eachLayer((layer) => {
        if (layer instanceof Circle) {
          const circle: Circle = layer;
          circles.push(circle); // Add the circle to the circles array.

          const onCircleMouseMove = (event: LeafletMouseEvent) => {
            const { lat, lng } = event.latlng;
            const mouseLatLng = [lat, lng] as LatLngTuple;
            const circleId = (circle.options as ExtendedShapeOptions)["demo-id"];

            const nextVertices = currentEditingVertices.map((latLng, index) =>
              index === circleId ? mouseLatLng : latLng,
            );

            dispatch(changeEditingVertices(nextVertices)); // Update the position of the circle marker using the mouse pointer.
            dispatch(
              changeAlteringDraft(
                currentAlteringDraft.map(
                  (polygon, index) => (index === currentReferencePolygon.polygonId ? nextVertices : polygon), // Update only the selected polygon.
                ),
              ),
            );
          };

          const onCircleMouseUp = () => {
            map.dragging.enable(); // Enable map dragging after vertex drag.
            document.body.style.userSelect = ""; // Re-enable text selection

            map.off("mousemove", onCircleMouseMove);
            map.off("mouseup", onCircleMouseUp);
          };

          const onCircleMouseDown = () => {
            map.dragging.disable(); // Disable map dragging during vertex drag.
            document.body.style.userSelect = "none"; // Disable text selection while dragging.

            map.on("mousemove", onCircleMouseMove);
            map.on("mouseup", onCircleMouseUp);
          };

          circle.on("mousedown", onCircleMouseDown);
        }
      });
    }

    // Clean up the event listeners when the component is unmounted or when the tool changes.
    return () => {
      circles.forEach((circle) => {
        circle.off("mousedown");
      });
    };
  }, [currentReferencePolygon, currentEditingVertices]);

  const editPolygon = (polygon: Polygon) => {
    const polygonId = (polygon.options as ExtendedShapeOptions)["demo-id"];
    if (currentReferencePolygon && currentReferencePolygon.polygonId === polygonId) return; // If the polygon is already selected, do nothing.

    const coordinates = polygon.getLatLngs()[0] as LatLng[][]; // Get the coordinates of the polygon.
    const polygonLatLng = coordinates.flat().map((coordinate: LatLng) => {
      return [coordinate.lat, coordinate.lng] as LatLngTuple;
    });

    dispatch(changeReferencePolygon({ polygonId })); // Remember the polygonId of the selected polygon.
    dispatch(changeEditingVertices(polygonLatLng)); // Add the editing vertices with the current polygon.
  };

  useMapEvent("click", (event: LeafletMouseEvent) => {
    const target = event.originalEvent.target as HTMLElement;

    if (currentTool === ToolType.EDIT) {
      if (target.id === mapId) {
        dispatch(resetAllProgressDraft()); // Reset the vertices and reference polygon when map is tap.
        event.originalEvent.stopPropagation();
      }
    }
  });

  return null;
};

export default EditingInteraction;
