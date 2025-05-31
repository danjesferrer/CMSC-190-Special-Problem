"use client";

import type { LeafletEvent, LeafletMouseEvent } from "leaflet";
import { useMapEvents } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { mapId } from "@/constants";
import { CardType } from "@/enums";
import { getScale } from "@/lib";
import { changeCard, changePointer, changeScale, changeZoom } from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";

const MapInteraction = () => {
  const dispatch = useDispatch();
  const currentCard = useSelector((state: RootState) => state.map.card);

  const map = useMapEvents({
    zoomend: (event: LeafletEvent) => {
      dispatch(changeZoom(event.target.getZoom()));
      dispatch(changeScale(getScale(map)));
    },
    mousemove: (event: LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;

      dispatch(changePointer({ lat, lng }));
    },
    click: (event: LeafletMouseEvent) => {
      const target = event.originalEvent.target as HTMLElement;

      // Apply close card after tapping map only for non-contribute cards.
      if (currentCard !== CardType.CONTRIBUTE) {
        // This ensures that the code below only runs when the event happens on the map.
        if (target.id === mapId) {
          dispatch(changeCard(CardType.NONE));
          event.originalEvent.stopPropagation();
        }

        return;
      }
    },
  });

  return null;
};

export default MapInteraction;
