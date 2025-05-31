from django.core.management.base import BaseCommand
from api.models import (
    CurrentCrop,
    CurrentCropElement,
    LegacyCrop,
    LegacyCropElement,
    SuitabilityLevel,
)
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Creates initial data"

    def handle(self, *args, **kwargs):
        # This creates the legacy crops and their elements.
        legacy_crop_names = [
            "Coffee",
            "Banana",
            "Cacao",
            "Coconut",
            "Corn",
            "Lowland Rice",
        ]

        # Create crops only if they don't already exist
        for name in legacy_crop_names:
            LegacyCrop.objects.get_or_create(name=name, published=True)

        # Wrapping elements to their corresponding crops
        legacy_crop_elements = [
            {"name": "Arabica", "category": "Coffee"},
            {"name": "Robusta", "category": "Coffee"},
            {"name": "Dry Season", "category": "Corn"},
            {"name": "Wet Season", "category": "Corn"},
        ]

        for element in legacy_crop_elements:
            legacy_crop = LegacyCrop.objects.get(name=element["category"])
            LegacyCropElement.objects.get_or_create(
                name=element["name"], category=legacy_crop, published=True
            )

        # _______________________________________________________________________________________
        # This creates the current crops and their elements.
        # current_crop_names = [
        #     "Coffee",
        #     "Banana",
        #     "Cacao",
        #     "Coconut",
        #     "Corn",
        #     "Lowland Rice",
        # ]

        # # Create crops only if they don't already exist
        # for name in current_crop_names:
        #     CurrentCrop.objects.get_or_create(name=name, published=True)

        # # Wrapping elements to their corresponding crops
        # current_crop_elements = [
        #     {"name": "Arabica", "category": "Coffee"},
        #     {"name": "Robusta", "category": "Coffee"},
        #     {"name": "Dry Season", "category": "Corn"},
        #     {"name": "Wet Season", "category": "Corn"},
        # ]

        # for element in current_crop_elements:
        #     current_crop = CurrentCrop.objects.get(name=element["category"])
        #     CurrentCropElement.objects.get_or_create(
        #         name=element["name"], category=current_crop, published=True
        #     )

        # _______________________________________________________________________________________
        suitability_levels = [
            {
                "name": "Highly suitable",
                "label": "S1",
                "gridcode": 10,
                "color": "#1d6400",
            },
            {
                "name": "Moderately suitable with limitation in elevation",
                "label": "S2 e",
                "gridcode": 21,
                "color": "#2c9d00",
            },
            {
                "name": "Moderately suitable with limitation in slope",
                "label": "S2 t",
                "gridcode": 22,
                "color": "#c6ff58",
            },
            {
                "name": "Moderately suitable with limitation in soil",
                "label": "S2 s",
                "gridcode": 23,
                "color": "#e2e700",
            },
            {
                "name": "Moderately suitable with limitation in elevation and slope",
                "label": "S2 et",
                "gridcode": 24,
                "color": "#9900e3",
            },
            {
                "name": "Moderately suitable with limitation in slope and soil",
                "label": "S2 ts",
                "gridcode": 25,
                "color": "#f55ba8",
            },
            {
                "name": "Moderately suitable with limitation in elevation and soil",
                "label": "S2 es",
                "gridcode": 26,
                "color": "#9bff00",
            },
            {
                "name": "Moderately suitable with limitation in elevation, slope and soil",
                "label": "S2 ets",
                "gridcode": 27,
                "color": "#df3500",
            },
            {
                "name": "Marginally suitable with limitation in elevation",
                "label": "S3 e",
                "gridcode": 31,
                "color": "#5d9d00",
            },
            {
                "name": "Marginally suitable with limitation in slope",
                "label": "S3 t",
                "gridcode": 32,
                "color": "#3ee900",
            },
            {
                "name": "Marginally suitable with limitation in soil",
                "label": "S3 s",
                "gridcode": 33,
                "color": "#ffff00",
            },
            {
                "name": "Marginally suitable with limitation in elevation and slope",
                "label": "S3 et",
                "gridcode": 34,
                "color": "#e0009b",
            },
            {
                "name": "Marginally suitable with limitation in slope and soil",
                "label": "S3 ts",
                "gridcode": 35,
                "color": "#ffabe3",
            },
            {
                "name": "Marginally suitable with limitation in elevation and soil",
                "label": "S3 es",
                "gridcode": 36,
                "color": "#87e700",
            },
            {
                "name": "Marginally suitable with limitation in elevation, slope and soil",
                "label": "S3 ets",
                "gridcode": 37,
                "color": "#e00000",
            },
        ]

        for level in suitability_levels:
            SuitabilityLevel.objects.get_or_create(
                name=level["name"],
                label=level["label"],
                gridcode=level["gridcode"],
                color=level["color"],
            )
