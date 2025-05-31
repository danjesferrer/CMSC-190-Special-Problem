"use client";

import "leaflet/dist/leaflet.css";
import { type FeatureCollection } from "geojson";
import { type LatLngExpression } from "leaflet";
import { useEffect, useMemo } from "react";
import { Circle, FeatureGroup, GeoJSON, MapContainer, Polygon, Polyline, TileLayer, WMSTileLayer } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AreaInfo from "@/components/Content/Map/AreaInfo";
import AuthForm from "@/components/Content/Map/AuthForm";
import ContributeInfo from "@/components/Content/Map/ContributeInfo";
import GeometryFeatureInfo from "@/components/Content/Map/GeometryFeatureInfo";
import Detail from "@/components/Map/Detail";
import Fly from "@/components/Map/Fly";
import Footer from "@/components/Map/Footer";
import Header from "@/components/Map/Header";
import Menu from "@/components/Map/Menu";
import Zoom from "@/components/Map/Zoom";
import {
  DeletingInteraction,
  DrawingInteraction,
  EditingInteraction,
  MapInteraction,
  MeterInteraction,
} from "@/components/Utils/Interactions";
import Setup from "@/components/Utils/Setup";
import Toast from "@/components/Utils/Toast";
import { basemaps, defaultPosition, defaultZoom, mapId, maxBounds, maxZoom, minZoom } from "@/constants";
import { CategoryType, ToolType } from "@/enums";
import { extractGeometryCoordinates, getGridcodes, getVertexRadius } from "@/lib";
import {
  changeGeometryFeatures,
  changeSearch,
  changeSearchList,
  changeSelectedGeometryFeature,
} from "@/state/map/mapSlice";
import { type RootState } from "@/state/store";

const Map = () => {
  const dispatch = useDispatch();
  const currentBasemap = useSelector((state: RootState) => state.map.basemap);
  const currentBasemapConfig = basemaps[currentBasemap];
  const currentSearch = useSelector((state: RootState) => state.map.search);
  const currentSearchGeometry = extractGeometryCoordinates(currentSearch);
  const currentOpenAuth = useSelector((state: RootState) => state.auth.openAuth);
  const currentFilter = useSelector((state: RootState) => state.map.filter);
  const currentClassification = useSelector((state: RootState) => state.map.classification);
  const currentPolygonIndex = useSelector((state: RootState) => state.tool.polygonIndex);
  const currentZoom = useSelector((state: RootState) => state.map.zoom);

  const currentTool = useSelector((state: RootState) => state.map.tool);
  const currentDrawingVertices = useSelector((state: RootState) => state.tool.drawingVertices);
  const currentDrawingComplete = useSelector((state: RootState) => state.tool.drawingComplete);
  const currentPreviewPolygon = useSelector((state: RootState) => state.tool.previewPolygon);
  const currentEditingVertices = useSelector((state: RootState) => state.tool.editingVertices);
  const currentAlteringDraft = useSelector((state: RootState) => state.tool.alteringDraft);
  const currentReferencePolygon = useSelector((state: RootState) => state.tool.referencePolygon);
  const currentCategory = useSelector((state: RootState) => state.map.category);
  const currentGeometryFeatures = useSelector((state: RootState) => state.map.geometryFeatures);
  const currentSelectedGeometryFeature = useSelector((state: RootState) => state.map.selectedGeometryFeature);
  const currentSelectedSuitabilityLevel = useSelector(
    (state: RootState) => state.contribution.selectedSuitabilityLevel,
  );

  const isSinglePolygon = currentDrawingComplete.length === 1;
  const defaults = {
    weigth: 3,
    opacity: 1.0,
  };

  useEffect(() => {
    // Use only for rendering current geometry features.
    if (!currentFilter || currentCategory !== CategoryType.CURRENT) return;
    const selectedGridcodes = getGridcodes(currentClassification);
    if (!selectedGridcodes) return;

    const cql_filter = `layer='${currentFilter.code}' AND published=true AND ${selectedGridcodes}`;

    dispatch(changeGeometryFeatures(null));
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/geoserver?cql_filter=${encodeURIComponent(cql_filter)}`);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

        const result = await response.json();
        dispatch(changeGeometryFeatures(result.data as FeatureCollection));
      } catch (error) {
        console.log(error);
        dispatch(changeGeometryFeatures(null));
      }
    };

    fetchResults();
  }, [currentFilter, currentClassification, currentCategory]);

  const worldMap = useMemo(() => {
    return <TileLayer url={currentBasemapConfig.url} attribution={currentBasemapConfig.attribution} />;
  }, [currentBasemap]);

  const vectorLayers = useMemo(() => {
    if (!currentSearchGeometry || !currentSearch) return null;

    const type = currentSearch.geojson?.type || "Point";

    let layer = null;
    switch (type) {
      case "Point":
        layer = (
          <Circle center={currentSearchGeometry as LatLngExpression} radius={100} pathOptions={{ fillColor: "blue" }} />
        );
        break;
      case "LineString":
      case "MultiPoint":
        layer = (
          <Polyline
            positions={currentSearchGeometry as LatLngExpression[] | LatLngExpression[][]}
            pathOptions={{ fillColor: "blue" }}
          />
        );
        break;
      case "Polygon":
      case "MultiLineString":
      case "MultiPolygon":
        layer = (
          <Polygon
            positions={currentSearchGeometry as LatLngExpression[] | LatLngExpression[][] | LatLngExpression[][][]}
            pathOptions={{ fillColor: "blue" }}
          />
        );
        break;
      default:
        return null;
    }

    return layer;
  }, [currentSearch]);

  const controlButtons = useMemo(() => {
    return (
      <Box>
        <Box className="absolute top-0 mt-12" sx={{ pointerEvents: "none" }}>
          <Header />
        </Box>
        <Box className="absolute top-0 left-0 mt-40 ml-12">
          <Menu />
        </Box>
        <Box className="absolute bottom-0 left-0 mb-12 ml-12">
          <Stack direction="column" spacing={2}>
            <Zoom />
            <Fly />
          </Stack>
        </Box>
        <Box className="absolute bottom-0 right-0 mb-12 mr-12">
          <Detail />
        </Box>
        <Box className="absolute bottom-0 mb-12" sx={{ pointerEvents: "none" }}>
          <Footer />
        </Box>
      </Box>
    );
  }, []);

  const authForm = useMemo(() => {
    return (
      <Box>
        <AuthForm />
      </Box>
    );
  }, [currentOpenAuth]);

  const toastNotification = useMemo(() => {
    return <Toast />;
  }, []);

  const wfsMap = useMemo(() => {
    if (!currentFilter || currentCategory !== CategoryType.CURRENT) return null;

    const onEachArea = (feature: any, layer: any) => {
      const code = feature.properties.gridcode;

      const color = currentClassification.find((classification) => classification.gridcode === code)!.color;
      layer.options.fillColor = color;
      layer.options.color = color;

      layer.on("click", () => {
        dispatch(changeSelectedGeometryFeature(feature));
        if (currentCategory === CategoryType.CURRENT) {
          dispatch(changeSearch(null));
          dispatch(changeSearchList([]));
        }
      });
    };

    return currentGeometryFeatures ? (
      <GeoJSON data={currentGeometryFeatures} style={{ fillOpacity: 0.3, weight: 3 }} onEachFeature={onEachArea} />
    ) : null;
  }, [currentFilter, currentClassification, currentCategory, currentGeometryFeatures]);

  const CardInformation = useMemo(() => {
    const hasGeometryFeatureInfo = !!currentSelectedGeometryFeature;
    const hasContributeInfo = currentTool !== ToolType.NONE;
    const hasAreaInfo = !!currentSearchGeometry && !!currentSearch;

    if (!hasGeometryFeatureInfo && !hasContributeInfo && !hasAreaInfo) return null;

    return (
      <FeatureGroup>
        <Box className="absolute top-0 right-0 mt-40 mr-12">
          {hasGeometryFeatureInfo && <GeometryFeatureInfo />}
          {hasContributeInfo && <ContributeInfo />}
          {hasAreaInfo && <AreaInfo />}
        </Box>
      </FeatureGroup>
    );
  }, [currentSelectedGeometryFeature, currentTool, currentSearchGeometry, currentSearch]);

  const wmsMap = useMemo(() => {
    if (!currentFilter || currentCategory !== CategoryType.LEGACY) return null;
    const selectedGridcodes = getGridcodes(currentClassification);
    if (!selectedGridcodes) return null;

    // const cql_filter = `layer='${currentFilter.code}'${selectedGridcodes}`;
    const cql_filter = `${selectedGridcodes}`;

    return (
      <WMSTileLayer
        key={currentFilter.code}
        // layers={`sakahan:api_${CategoryType.LEGACY.toLowerCase()}geometryfeature`}
        layers={`sakahan:${currentFilter.code}`}
        url={`${process.env.NEXT_PUBLIC_GEOSERVER_URL}/geoserver/sakahan/wms`}
        transparent={true}
        format={"image/png"}
        params={{ CQL_FILTER: cql_filter, TILED: true } as any}
      />
    );
  }, [currentFilter, currentClassification, currentCategory]);

  const toolMap = useMemo(() => {
    const defaultColor = currentSelectedSuitabilityLevel?.color ?? "mediumblue";

    return (
      <FeatureGroup>
        {/* Draw */}
        {currentTool === ToolType.DRAW &&
          currentDrawingComplete.map((drawing, index) => {
            const isPreviewPolygon = index === currentPolygonIndex && currentDrawingComplete.length > 1;

            return (
              <Polygon
                key={index}
                demo-id={index}
                positions={drawing}
                pathOptions={{
                  color: defaultColor,
                  weight: isPreviewPolygon ? 5 : defaults.weigth,
                  opacity: isPreviewPolygon ? defaults.opacity : isSinglePolygon ? 0.7 : defaults.opacity,
                }}
              />
            );
          })}

        {/* Draw and Meter */}
        {(currentTool === ToolType.DRAW || currentTool === ToolType.METER) && (
          <FeatureGroup>
            {currentDrawingVertices.length > 0 && (
              <FeatureGroup>
                <Polyline positions={currentDrawingVertices} pathOptions={{ color: defaultColor, dashArray: "5, 8" }} />
                <Circle
                  center={currentDrawingVertices[0]}
                  radius={getVertexRadius(currentZoom)}
                  pathOptions={{ color: "crimson" }}
                />
                <Circle
                  center={currentDrawingVertices[currentDrawingVertices.length - 1]}
                  radius={getVertexRadius(currentZoom)}
                  pathOptions={{ color: "mediumseagreen" }}
                />
              </FeatureGroup>
            )}
            {currentPreviewPolygon.length >= 3 && (
              <Polygon
                interactive={false} // Need this for adding a polygon.
                positions={currentPreviewPolygon}
                pathOptions={{
                  color: defaultColor,
                  dashArray: "5, 8",
                }}
              />
            )}
          </FeatureGroup>
        )}

        {/* Edit and Delete */}
        {(currentTool === ToolType.EDIT || currentTool === ToolType.DELETE) &&
          currentAlteringDraft.map((drawing, index) => {
            const isSelectedPolygon = currentReferencePolygon && currentReferencePolygon.polygonId === index;
            const isPreviewPolygon = index === currentPolygonIndex && currentDrawingComplete.length > 1;

            return (
              <Polygon
                key={index}
                demo-id={index}
                positions={drawing}
                pathOptions={{
                  color: defaultColor,
                  dashArray: isSelectedPolygon ? "5, 8" : "",
                  weight: isPreviewPolygon ? 5 : defaults.weigth,
                  opacity: isPreviewPolygon ? defaults.opacity : isSinglePolygon ? 0.7 : defaults.opacity,
                }}
              />
            );
          })}

        {/* Edit */}
        {currentTool === ToolType.EDIT &&
          currentEditingVertices.map((vertex, index) => {
            return (
              <Circle
                key={index}
                demo-id={index}
                center={vertex}
                radius={getVertexRadius(currentZoom)}
                pathOptions={{ color: "crimson" }}
                interactive={true}
              />
            );
          })}
      </FeatureGroup>
    );
  }, [
    currentZoom,
    currentTool,
    currentPolygonIndex,
    currentPreviewPolygon,
    currentDrawingVertices,
    currentDrawingComplete,
    currentEditingVertices,
    currentAlteringDraft,
    currentSelectedSuitabilityLevel,
  ]);

  const interactions = useMemo(() => {
    return (
      <Box>
        {currentTool === ToolType.DRAW && <DrawingInteraction />}
        {currentTool === ToolType.EDIT && <EditingInteraction />}
        {currentTool === ToolType.DELETE && <DeletingInteraction />}
        {currentTool === ToolType.METER && <MeterInteraction />}
        <MapInteraction />
      </Box>
    );
  }, [currentTool]);

  return (
    <MapContainer
      center={defaultPosition}
      zoom={defaultZoom}
      zoomControl={false}
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxBounds={maxBounds}
      maxBoundsViscosity={0.5}
      worldCopyJump={true}
      id={mapId}
      className="h-screen w-screen"
    >
      {worldMap}
      {wmsMap}
      {wfsMap}
      {toolMap}
      {CardInformation}
      {vectorLayers}
      {controlButtons}
      {toastNotification}
      {authForm}
      {interactions}
      <Setup />
    </MapContainer>
  );
};

export default Map;

// TODO: Handle HTML return error messages.
// TODO: catch case when the repeat password is supplied first before the actual password field
