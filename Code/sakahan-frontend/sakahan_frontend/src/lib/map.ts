import { type Map as LeafletMap } from "leaflet";
import { defaultZoom, maxZoom, minZoom } from "@/constants";

export const disableInteraction = (map: LeafletMap) => {
  map.dragging.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
};

export const enableInteraction = (map: LeafletMap) => {
  map.dragging.enable();
  map.doubleClickZoom.enable();
  map.scrollWheelZoom.enable();
};

export const toSentenceCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => toSentenceCase(word));
};

export const getFilterFormattedText = (str: string) => {
  return str
    .split("_")
    .map((word) => toSentenceCase(word))
    .join(" ");
};

export const getVertexRadius = (currentZoom: number) => {
  const baseRadius = 50;
  const baseZoomIncrement = 5;
  const zoomFactor = 1.2; // The factor by which the radius decreases/increases
  let zoomAdjust = 15;

  if (currentZoom === maxZoom) return baseZoomIncrement;

  if (currentZoom === defaultZoom) zoomAdjust = 15;
  else if (currentZoom < defaultZoom) {
    zoomAdjust =
      zoomAdjust +
      (defaultZoom - (currentZoom < Math.floor(maxZoom / 2) ? defaultZoom - (baseZoomIncrement - 1) : currentZoom)) *
        baseZoomIncrement;
  }

  if (currentZoom === minZoom) zoomAdjust = 40;

  return baseRadius / Math.pow(zoomFactor, currentZoom - zoomAdjust);
};

export const processError = (error: any) => {
  const errors: string[] = [];

  if (error.data) {
    Object.keys(error.data).forEach((key) => {
      // return messages is an array.
      if (Array.isArray(error.data[key])) {
        error.data[key].forEach((message) => {
          const formattedMessage = toSentenceCase(message).trim();
          errors.push(formattedMessage.endsWith(".") ? formattedMessage : `${formattedMessage}.`);
        });

        return;
      }

      // Return messages is a string.
      const message = error.data[key];
      const formattedMessage = toSentenceCase(message).trim();
      errors.push(formattedMessage.endsWith(".") ? formattedMessage : `${formattedMessage}.`);
    });
  }
  const message = errors.length > 0 ? errors.join("\n") : "Something went wrong. Please try again.";

  return message;
};
