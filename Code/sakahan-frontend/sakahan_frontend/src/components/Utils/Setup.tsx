import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { CategoryType } from "@/enums";
import { computeBoundingBox } from "@/lib";
import { useVerifyMutation } from "@/state/auth/authApiSlice";
import { setAuth } from "@/state/auth/authSlice";
import { type RootState } from "@/state/store";

const Setup = () => {
  const map = useMap();
  const dispatch = useDispatch();

  const currentCategory = useSelector((state: RootState) => state.map.category);
  const currentGeometryFeatures = useSelector((state: RootState) => state.map.geometryFeatures);

  const [verify] = useVerifyMutation();

  useEffect(() => {
    verify(undefined)
      .unwrap()
      .then(() => {
        dispatch(setAuth());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (currentCategory === CategoryType.CURRENT && currentGeometryFeatures) {
      const boundingbox = computeBoundingBox(currentGeometryFeatures);
      if (boundingbox.length === 0) return;

      map.flyToBounds(boundingbox, {
        animate: true,
        padding: [20, 20],
        duration: 2,
      });
    }
  }, [currentGeometryFeatures]);

  return null;
};

export default Setup;
