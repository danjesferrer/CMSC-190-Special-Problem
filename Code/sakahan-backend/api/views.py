import json
from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from djoser.social.views import ProviderAuthView
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from api.serializers import (
    CommentSerializer,
    ContributionSerializer,
    CurrentCropElementSerializer,
    CurrentCropSerializer,
    CurrentGeometryFeatureSerializer,
    LegacyCropSerializer,
    LegacyCropElementSerializer,
    SuitabilityLevelSerializer,
    FileSerializer,
)
from api.models import (
    Comment,
    Contribution,
    CurrentCropElement,
    CurrentCrop,
    CurrentGeometryFeature,
    LegacyCrop,
    LegacyCropElement,
    SuitabilityLevel,
    File,
)
from enum import Enum
from django.db.models.functions import TruncDate
from collections import defaultdict
from django.contrib.gis.geos import GEOSGeometry
from django.db import transaction


User = get_user_model()


class RecordTab(Enum):
    MY_CONTRIBUTIONS = "My Contributions"
    OTHER_CONTRIBUTIONS = "Other Contributions"


class RecordStatus(Enum):
    ALL = "All"
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

    @property
    def db_value(self):
        mapping = {
            RecordStatus.PENDING: Contribution.Status.PENDING,
            RecordStatus.APPROVED: Contribution.Status.APPROVED,
            RecordStatus.REJECTED: Contribution.Status.REJECTED,
        }
        return mapping.get(self, None)


class CustomProviderAuthView(ProviderAuthView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_201_CREATED:
            access_token = response.data.get("access")
            refresh_token = response.data.get("refresh")

            response.set_cookie(
                "access",
                access_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )
            response.set_cookie(
                "refresh",
                refresh_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )

        return response


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK:
            access_token = response.data.get("access")
            refresh_token = response.data.get("refresh")

            response.set_cookie(
                "access",
                access_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )
            response.set_cookie(
                "refresh",
                refresh_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )

        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh")

        if refresh_token:
            request.data["refresh"] = refresh_token

        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK:
            access_token = response.data.get("access")

            response.set_cookie(
                "access",
                access_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )

        return response


class CustomTokenVerifyView(TokenVerifyView):
    def post(self, request, *args, **kwargs):
        access_token = request.COOKIES.get("access")

        if access_token:
            request.data["token"] = access_token

        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    def post(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie("access")
        response.delete_cookie("refresh")

        return response


class LegacyCropViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LegacyCrop.objects.all()
    serializer_class = LegacyCropSerializer
    pagination_class = None

    def get_permissions(self):
        self.permission_classes = [permissions.IsAuthenticated]

        if self.action in ["list", "retrieve"]:
            self.permission_classes = [permissions.AllowAny]

        return super().get_permissions()


class LegacyCropElementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LegacyCropElement.objects.all()
    serializer_class = LegacyCropElementSerializer
    pagination_class = None

    def get_permissions(self):
        self.permission_classes = [permissions.IsAuthenticated]

        if self.action in ["list", "retrieve"]:
            self.permission_classes = [permissions.AllowAny]

        return super().get_permissions()


class SuitabilityLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SuitabilityLevel.objects.all()
    serializer_class = SuitabilityLevelSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class CurrentCropViewSet(viewsets.ModelViewSet):
    queryset = CurrentCrop.objects.all().order_by("name")
    serializer_class = CurrentCropSerializer
    pagination_class = None

    def get_permissions(self):
        self.permission_classes = [permissions.IsAuthenticated]

        if self.action in ["list", "retrieve"]:
            self.permission_classes = [permissions.AllowAny]

        return super().get_permissions()


class CurrentCropElementViewSet(viewsets.ModelViewSet):
    queryset = CurrentCropElement.objects.all()
    serializer_class = CurrentCropElementSerializer
    pagination_class = None

    def get_permissions(self):
        self.permission_classes = [permissions.IsAuthenticated]

        if self.action in ["list", "retrieve", "category"]:
            self.permission_classes = [permissions.AllowAny]

        return super().get_permissions()

    @extend_schema(
        # extra parameters added to the schema
        parameters=[
            OpenApiParameter(
                name="category",
                description="Get crop elements by category",
                required=True,
                type=int,
            ),
        ],
    )
    @action(
        detail=False,
    )
    def category(self, request):
        category = request.query_params.get("category", None)

        if category:
            crop_elements = CurrentCropElement.objects.filter(category=category)
            serializer = CurrentCropElementSerializer(crop_elements, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Category parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CurrentGeometryFeatureViewSet(viewsets.ModelViewSet):
    queryset = CurrentGeometryFeature.objects.all()
    serializer_class = CurrentGeometryFeatureSerializer
    pagination_class = None

    def get_permissions(self):
        self.permission_classes = [permissions.IsAuthenticated]

        if self.action in ["list", "retrieve"]:
            self.permission_classes = [permissions.AllowAny]

        return super().get_permissions()


class ContributionViewSet(viewsets.ModelViewSet):
    queryset = Contribution.objects.all().order_by("-date_published")
    serializer_class = ContributionSerializer

    def get_permissions(self):
        self.permission_classes = [permissions.IsAuthenticated]

        if self.action in ["list", "retrieve"]:
            self.permission_classes = [permissions.AllowAny]

        return super().get_permissions()

    def get_queryset(self):
        queryset = Contribution.objects.all().order_by("-date_published")
        tab = self.request.query_params.get("tab")
        filter = self.request.query_params.get("filter")
        user = self.request.query_params.get("user")

        if tab:
            if tab == RecordTab.MY_CONTRIBUTIONS.value:
                queryset = queryset.filter(author__id=user)

            if tab == RecordTab.OTHER_CONTRIBUTIONS.value:
                queryset = queryset.exclude(author__id=user)

        if filter and filter != RecordStatus.ALL.value:
            filter_enum = RecordStatus(filter)
            db_status = filter_enum.db_value
            queryset = queryset.filter(status=db_status)

        return queryset

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="tab",
                description="Filter by tab: 'My Contributions' or 'Other Contributions'",
                required=False,
                type=str,
                enum=[tab.value for tab in RecordTab],
            ),
            OpenApiParameter(
                name="filter",
                description="Filter by status: 'All', 'Pending', 'Accepted', 'Rejected'",
                required=False,
                type=str,
                enum=[status.value for status in RecordStatus],
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        crop = data.get("crop")
        crop_element = data.get("crop_element")

        try:
            with transaction.atomic():
                if isinstance(crop, str):
                    crop_data = {"name": crop}

                    # Check if the crop already exists, since it is possible that the crop is softly deleted.
                    crop_ref = CurrentCrop.objects.filter(
                        name=crop_data["name"]
                    ).first()
                    if crop_ref is not None:
                        crop_serializer = CurrentCropSerializer(
                            instance=crop_ref, data={"isDeleted": False}, partial=True
                        )
                        if crop_serializer.is_valid():
                            crop = crop_serializer.save()
                        else:
                            return Response(
                                crop_serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                    else:
                        # Create the crop if not existing.
                        crop_serializer = CurrentCropSerializer(data=crop_data)
                        if crop_serializer.is_valid():
                            crop = crop_serializer.save()
                        else:
                            return Response(
                                crop_serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                elif isinstance(crop, int):
                    crop = get_object_or_404(CurrentCrop, id=crop)

                if isinstance(crop_element, str):
                    crop_element_data = {"name": crop_element, "category": crop.id}

                    crop_element_ref = CurrentCropElement.objects.filter(
                        name=crop_element_data["name"],
                        category=crop_element_data["category"],
                    ).first()

                    if crop_element_ref is not None:
                        crop_element_serializer = CurrentCropElementSerializer(
                            instance=crop_element_ref,
                            data={"isDeleted": False},
                            partial=True,
                        )
                        if crop_element_serializer.is_valid():
                            crop_element = crop_element_serializer.save()
                        else:
                            return Response(
                                crop_element_serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                    else:
                        crop_element_serializer = CurrentCropElementSerializer(
                            data=crop_element_data
                        )
                        if crop_element_serializer.is_valid():
                            crop_element = crop_element_serializer.save()
                        else:
                            # Rollback crop creation if crop_element creation fails.

                            return Response(
                                crop_element_serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                elif isinstance(crop_element, int):
                    crop_element = get_object_or_404(
                        CurrentCropElement, id=crop_element
                    )

                data["crop"] = crop.id
                data["crop_element"] = crop_element.id if crop_element else None

                request._full_data = data

                return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": "Something went wrong."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def perform_create(self, serializer):
        contribution = serializer.save()

        crop = contribution.crop
        crop_element = contribution.crop_element
        suitability_level = contribution.suitability_level
        geom = self.request.data.get("geom")

        properties = {
            "gridcode": suitability_level.gridcode,
            "layer": crop_element.get_code() if crop_element else crop.get_code(),
            "reference": contribution.id,
        }

        for polygon in geom:
            geojson_polygon = {
                "type": "Polygon",
                "coordinates": [polygon],  # must be nested in a list
            }

            # Convert to JSON string before passing to GEOSGeometry
            geometry = GEOSGeometry(json.dumps(geojson_polygon))

            feature_data = {"geom": geometry, **properties}
            feature_serializer = CurrentGeometryFeatureSerializer(data=feature_data)
            if feature_serializer.is_valid():
                feature_serializer.save()
            else:
                # TODO: Rollback?
                raise Response(
                    feature_serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST,
                )

    def update(self, request, *args, **kwargs):
        data = request.data.copy()

        user = request.query_params.get("user")
        crop = data.get("crop")
        crop_element = data.get("crop_element")

        original_contribution = self.get_object()
        original_crop = original_contribution.crop
        original_crop_element = original_contribution.crop_element

        try:
            with transaction.atomic():
                layers = [original_crop.get_code()]
                if original_crop_element:
                    print("herrerere")
                    layers.append(original_crop_element.get_code())
                print(layers)
                # Fix inconsistencies in the geometries
                other_geometries = CurrentGeometryFeature.objects.filter(
                    layer__in=layers
                )

                if isinstance(crop, str):
                    crop_data = {"name": crop}

                    if crop_data["name"] == original_crop.name:
                        crop = original_crop
                    else:
                        # Check first if the original crop is already published.
                        # If already published, we cannot rename it.
                        # No delete should be done here: Remember that when a crop is published,
                        # it is already used in the map and there is another approved contribution that references it.
                        if not original_crop.published:
                            # Consider every new crop name is a patch update to the original crop name.
                            crop_serializer = CurrentCropSerializer(
                                instance=original_crop, data=crop_data, partial=True
                            )
                            if crop_serializer.is_valid():
                                crop = crop_serializer.save()
                            else:
                                return Response(
                                    crop_serializer.errors,
                                    status=status.HTTP_400_BAD_REQUEST,
                                )
                        else:
                            # Create a crop with the new name.
                            crop_serializer = CurrentCropSerializer(data=crop_data)

                            if crop_serializer.is_valid():
                                crop = crop_serializer.save()
                            else:
                                return Response(
                                    crop_serializer.errors,
                                    status=status.HTTP_400_BAD_REQUEST,
                                )
                else:
                    return Response(
                        {"detail": "Crop name must be a string."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Handle Crop Element.
                if isinstance(crop_element, str):
                    crop_element_data = {"name": crop_element, "category": crop.id}

                    # Check if the crop_element previously existed.
                    if original_crop_element:
                        if crop_element_data["name"] == original_crop_element.name:
                            # Check if the crop element already exists. I can't return the original crop_element because the category can be different.
                            if (
                                crop_element_data["category"]
                                != original_crop_element.category.id
                            ):
                                crop_element_ref = CurrentCropElement.objects.filter(
                                    name=crop_element_data["name"],
                                    category=crop_element_data["category"],
                                ).first()

                                if crop_element_ref is not None:
                                    # If the crop element already exists, update the isDelete to False to ensure it appears again in the list.
                                    crop_element_serializer = (
                                        CurrentCropElementSerializer(
                                            instance=crop_element_ref,
                                            data={"isDeleted": False},
                                            partial=True,
                                        )
                                    )
                                    if crop_element_serializer.is_valid():
                                        crop_element = crop_element_serializer.save()
                                    else:
                                        return Response(
                                            crop_element_serializer.errors,
                                            status=status.HTTP_400_BAD_REQUEST,
                                        )
                                else:
                                    # Create the crop element since the element is not yet created for the selected crop.
                                    crop_element_serializer = (
                                        CurrentCropElementSerializer(
                                            data=crop_element_data
                                        )
                                    )

                                    if crop_element_serializer.is_valid():
                                        crop_element = crop_element_serializer.save()
                                    else:
                                        return Response(
                                            crop_element_serializer.errors,
                                            status=status.HTTP_400_BAD_REQUEST,
                                        )
                            else:
                                crop_element = original_crop_element
                        else:
                            # Same condition as crop. If the original crop_element is already published, we cannot rename it.
                            if not original_crop_element.published:
                                # Every new crop element name is a patch update to the original crop element name.
                                crop_element_serializer = CurrentCropElementSerializer(
                                    instance=original_crop_element,
                                    data=crop_element_data,
                                )
                                if crop_element_serializer.is_valid():
                                    crop_element = crop_element_serializer.save()
                                else:
                                    # TODO: Rollback to original crop if crop_element creation fails.
                                    return Response(
                                        crop_element_serializer.errors,
                                        status=status.HTTP_400_BAD_REQUEST,
                                    )
                            else:
                                # If the original crop_element is already published, we cannot rename it.
                                # We need to create a new one.
                                crop_element_serializer = CurrentCropElementSerializer(
                                    data=crop_element_data
                                )

                                if crop_element_serializer.is_valid():
                                    crop_element = crop_element_serializer.save()
                                else:
                                    # TODO: Rollback to original crop if crop_element creation fails.
                                    return Response(
                                        crop_element_serializer.errors,
                                        status=status.HTTP_400_BAD_REQUEST,
                                    )
                    else:
                        crop_element_ref = CurrentCropElement.objects.filter(
                            name=crop_element_data["name"],
                            category=crop_element_data["category"],
                        ).first()

                        if crop_element_ref is not None:
                            # If the crop element already exists, update the isDelete to False to ensure it appears again in the list.
                            crop_element_serializer = CurrentCropElementSerializer(
                                instance=crop_element_ref,
                                data={"isDeleted": False},
                                partial=True,
                            )
                            if crop_element_serializer.is_valid():
                                crop_element = crop_element_serializer.save()
                            else:
                                return Response(
                                    crop_element_serializer.errors,
                                    status=status.HTTP_400_BAD_REQUEST,
                                )
                        else:
                            # If the crop_element doesn't exist previously, create a new one.
                            crop_element_serializer = CurrentCropElementSerializer(
                                data=crop_element_data
                            )
                            if crop_element_serializer.is_valid():
                                crop_element = crop_element_serializer.save()
                            else:
                                # TODO: Rollback to original crop if crop_element creation fails.

                                return Response(
                                    crop_element_serializer.errors,
                                    status=status.HTTP_400_BAD_REQUEST,
                                )
                elif crop_element is None:
                    if original_crop_element:
                        other_refs = Contribution.objects.filter(
                            crop_element=original_crop_element
                        ).exclude(id=original_contribution.id)

                        if not other_refs.exists():
                            original_crop_element.delete()
                else:
                    return Response(
                        {"detail": "Crop element name must be a string."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                for geometry in other_geometries:
                    geometry.layer = geometry.update_layer()

                CurrentGeometryFeature.objects.bulk_update(other_geometries, ["layer"])

                data["crop"] = crop.id
                data["crop_element"] = crop_element.id if crop_element else None

                if int(user) != original_contribution.author.id:
                    # Check if the user is already a contributor.
                    if not original_contribution.contributors.filter(id=user).exists():
                        # Add the user to the contributors list.
                        original_contribution.contributors.add(user)

                request._full_data = data

                return super().update(request, *args, **kwargs)

        except Exception as e:
            return Response(
                {"detail": "Something went wrong."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def perform_update(self, serializer):
        contribution = serializer.save()

        CurrentGeometryFeature.objects.filter(reference=contribution.id).delete()

        crop = contribution.crop
        crop_element = contribution.crop_element
        suitability_level = contribution.suitability_level
        geom = self.request.data.get("geom")

        properties = {
            "gridcode": suitability_level.gridcode,
            "layer": crop_element.get_code() if crop_element else crop.get_code(),
            "reference": contribution.id,
        }
        print(geom)
        for polygon in geom:
            geojson_polygon = {
                "type": "Polygon",
                "coordinates": [polygon],  # must be nested in a list
            }

            # Convert to JSON string before passing to GEOSGeometry
            geometry = GEOSGeometry(json.dumps(geojson_polygon))

            feature_data = {"geom": geometry, **properties}
            feature_serializer = CurrentGeometryFeatureSerializer(data=feature_data)
            if feature_serializer.is_valid():
                feature_serializer.save()
            else:
                # TODO: Rollback?
                raise Response(
                    feature_serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST,
                )

    def destroy(self, request, *args, **kwargs):
        contribution = self.get_object()

        crop = contribution.crop
        crop_element = contribution.crop_element

        # Check if the crop and crop_element are not referenced by any other contribution.
        other_crop_refs = Contribution.objects.filter(crop=crop).exclude(
            id=contribution.id
        )
        other_crop_element_refs = Contribution.objects.filter(
            crop_element=crop_element
        ).exclude(id=contribution.id)

        if not other_crop_refs.exists():
            crop.delete()

        if crop_element and not other_crop_element_refs.exists():
            crop_element.delete()

        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="status",
                description="Set to 1 (Approved) or 2 (Rejected)",
                required=True,
                type=int,
            ),
        ]
    )
    @action(detail=True, methods=["patch"])
    # TODO: Delete crops and crop_elements if it doesnt have any references when deleting a contribution. however, if i delete this, the rejected contribution will have a problem because crops and crop elements are missing
    def status(self, request, pk=None):
        # TODO: Delete crops if it doesnt have any references when rejecting contributions.
        contribution = Contribution.objects.get(pk=pk)
        data = request.data
        new_status = data.get("status")

        crop = contribution.crop
        crop_element = contribution.crop_element

        geometries = CurrentGeometryFeature.objects.filter(reference=contribution.id)
        for geometry in geometries:
            geometry.published = new_status == Contribution.Status.APPROVED

        CurrentGeometryFeature.objects.bulk_update(geometries, ["published"])

        if not crop.published:
            if new_status == Contribution.Status.APPROVED:
                crop_serializer = CurrentCropSerializer(
                    instance=crop, data={"published": True}, partial=True
                )
                if crop_serializer.is_valid():
                    crop = crop_serializer.save()
                else:
                    return Response(
                        crop_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

            elif new_status == Contribution.Status.REJECTED:
                other_refs = Contribution.objects.filter(
                    crop=crop, status=Contribution.Status.PENDING
                ).exclude(id=contribution.id)

                if not other_refs.exists():

                    crop_serializer = CurrentCropSerializer(
                        instance=crop, data={"isDeleted": True}, partial=True
                    )
                    if crop_serializer.is_valid():
                        crop = crop_serializer.save()
                    else:
                        return Response(
                            crop_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )

        if crop_element and not crop_element.published:
            if new_status == Contribution.Status.APPROVED:
                crop_element_serializer = CurrentCropElementSerializer(
                    instance=crop_element, data={"published": True}, partial=True
                )
                if crop_element_serializer.is_valid():
                    crop_element = crop_element_serializer.save()
                else:
                    return Response(
                        crop_element_serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            elif new_status == Contribution.Status.REJECTED:
                other_refs = Contribution.objects.filter(
                    crop_element=crop_element, status=Contribution.Status.PENDING
                ).exclude(id=contribution.id)

                if not other_refs.exists():
                    crop_element_serializer = CurrentCropElementSerializer(
                        instance=crop_element,
                        data={"isDeleted": True},
                        partial=True,
                    )
                    if crop_element_serializer.is_valid():
                        crop_element = crop_element_serializer.save()
                    else:
                        return Response(
                            crop_element_serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST,
                        )

        serializer = self.get_serializer(contribution, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": f"Status updated to {contribution.get_status_display()}."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        queryset = Comment.objects.all().order_by("date_created")
        contribution = self.request.query_params.get("contribution")

        if contribution:
            queryset = queryset.filter(contribution__id=contribution)

        return queryset

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="contribution",
                description="Filter by contribution id'",
                required=False,
                type=int,
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().annotate(date_only=TruncDate("date_created"))
        grouped = defaultdict(list)

        for comment in queryset:
            date_str = comment.date_only.isoformat()
            grouped[date_str].append(self.get_serializer(comment).data)

        return Response(grouped)


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_permissions(self):
        self.permission_classes = [permissions.IsAuthenticated]

        if self.action in ["list", "retrieve"]:
            self.permission_classes = [permissions.AllowAny]

        return super().get_permissions()

    def get_queryset(self):
        queryset = File.objects.all().order_by("-date_uploaded")
        contribution = self.request.query_params.get("contribution")

        if contribution:
            queryset = queryset.filter(contribution__id=contribution)

        return queryset

    def create(self, request, *args, **kwargs):
        contribution = request.query_params.get("contribution")
        user = request.query_params.get("user")

        contribution = get_object_or_404(Contribution, id=contribution)
        user = get_object_or_404(User, id=user)

        files = []
        identifiers = []

        index = 0
        while True:
            # Check if this index exists.
            file_identifier = request.POST.get(f"identifier_{index}")
            file_name = request.POST.get(f"name_{index}")
            file_size = request.POST.get(f"size_{index}")
            file_type = request.POST.get(f"type_{index}")
            file = request.FILES.get(f"file_{index}")

            if not file_identifier:
                break  # No more files

            # Check if the file already exists in the database.
            file_instance = File.objects.filter(
                contribution=contribution, file_identifier=file_identifier
            ).first()
            if not file_instance:
                # Build the data if the file does not exist.
                data = {
                    "contribution": contribution.id,
                    "uploaded_by": user.id,
                    "file": file,
                    "file_identifier": file_identifier,
                    "file_name": file_name,
                    "file_size": int(file_size),
                    "file_type": file_type,
                }

                # Set request._full_data for DRF's `create`
                request._full_data = data
                file_reference = super().create(request, *args, **kwargs)
                files.append(file_reference.data)

            identifiers.append(file_identifier)
            index += 1  # Move to next file/identifier

        # Check if there are any files to delete.
        if identifiers:
            # Delete files that are not in the identifiers list.
            File.objects.filter(contribution=contribution).exclude(
                file_identifier__in=identifiers
            ).delete()

        return Response(files, status=status.HTTP_201_CREATED)
