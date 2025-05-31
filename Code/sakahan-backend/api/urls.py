from django.urls import path, include, re_path
from rest_framework import routers
from .views import (
    CommentViewSet,
    ContributionViewSet,
    CurrentCropElementViewSet,
    CurrentCropViewSet,
    CurrentGeometryFeatureViewSet,
    CustomProviderAuthView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    CustomTokenVerifyView,
    FileViewSet,
    LogoutView,
    LegacyCropViewSet,
    LegacyCropElementViewSet,
    SuitabilityLevelViewSet,
)


legacy_router = routers.DefaultRouter()
legacy_router.register("crops", LegacyCropViewSet, basename="legacy_crops")
legacy_router.register(
    "crops-elements", LegacyCropElementViewSet, basename="legacy_crops_elements"
)


current_router = routers.DefaultRouter()
current_router.register("crops", CurrentCropViewSet, basename="current_crops")
current_router.register(
    "crops-elements", CurrentCropElementViewSet, basename="current_crops_elements"
)
current_router.register(
    "geometry-features",
    CurrentGeometryFeatureViewSet,
    basename="current_geometry_features",
)


router = routers.DefaultRouter()
router.register(
    "suitability-levels", SuitabilityLevelViewSet, basename="suitability_levels"
)
router.register("contributions", ContributionViewSet, basename="contributions")
router.register("comments", CommentViewSet, basename="comments")
router.register("files", FileViewSet, basename="files")

urlpatterns = [
    re_path(
        r"^o/(?P<provider>\S+)/$",
        CustomProviderAuthView.as_view(),
        name="provider-auth",
    ),
    path("", include(router.urls)),
    path("legacy/", include(legacy_router.urls)),
    path("current/", include(current_router.urls)),
    path("jwt/create/", CustomTokenObtainPairView.as_view()),
    path("jwt/refresh/", CustomTokenRefreshView.as_view()),
    path("jwt/verify/", CustomTokenVerifyView.as_view()),
    path("logout/", LogoutView.as_view()),
]
