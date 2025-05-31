import { type Point } from "leaflet";

export const getPointDistance = (point1: Point, point2: Point) => {
  return point1.distanceTo(point2);
};
