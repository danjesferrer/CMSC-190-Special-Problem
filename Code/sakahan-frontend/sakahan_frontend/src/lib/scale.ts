import { type Map as LeafletMap } from "leaflet";
import { maxWidth } from "@/constants";

const getRoundNum = (num: number) => {
  const pow10 = Math.pow(10, `${Math.floor(num)}`.length - 1);
  let d = num / pow10;

  d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;

  return pow10 * d;
};

const updateMetric = (maxMeters: number) => {
  const meters = getRoundNum(maxMeters);
  const label = meters < 1000 ? `${meters} m` : `${meters / 1000} km`;

  return label;
};

const updateImperial = (maxMeters: number) => {
  const maxFeet = maxMeters * 3.2808399;
  const label = maxFeet > 5280 ? `${getRoundNum(maxFeet / 5280)} mi` : `${getRoundNum(maxFeet)} ft`;

  return label;
};

export const getScale = (map: LeafletMap) => {
  const y = map.getSize().y / 2;
  const maxMeters = map.distance(map.containerPointToLatLng([0, y]), map.containerPointToLatLng([maxWidth, y]));

  const metricScale = updateMetric(maxMeters);
  const imperialScale = updateImperial(maxMeters);

  return `${metricScale}, ${imperialScale}`;
};
