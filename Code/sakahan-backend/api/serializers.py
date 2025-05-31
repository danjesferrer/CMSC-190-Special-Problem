from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from djoser.serializers import UserSerializer
from .models import (
    CurrentCrop,
    CurrentCropElement,
    CurrentGeometryFeature,
    UserAccount,
    LegacyCrop,
    LegacyCropElement,
    SuitabilityLevel,
    Contribution,
    Comment,
    File,
)


class CustomUserSerializer(UserSerializer):
    role = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        model = UserAccount
        fields = UserSerializer.Meta.fields + ("role",)

    def get_role(self, obj):
        return obj.get_role_display()


class LegacyCropSerializer(serializers.ModelSerializer):
    code = serializers.CharField(source="get_code")

    class Meta:
        model = LegacyCrop
        fields = ["id", "name", "code", "published"]


class LegacyCropElementSerializer(serializers.ModelSerializer):
    category = LegacyCropSerializer()
    code = serializers.CharField(source="get_code")

    class Meta:
        model = LegacyCropElement
        fields = ["id", "name", "code", "category", "published"]


class SuitabilityLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuitabilityLevel
        fields = "__all__"


class CurrentCropSerializer(serializers.ModelSerializer):
    published = serializers.BooleanField(required=False)
    code = serializers.CharField(source="get_code", read_only=True)

    class Meta:
        model = CurrentCrop
        fields = ["id", "name", "code", "published", "isDeleted"]


class CurrentCropElementSerializer(serializers.ModelSerializer):
    published = serializers.BooleanField(required=False)
    code = serializers.CharField(source="get_code", read_only=True)

    class Meta:
        model = CurrentCropElement
        fields = ["id", "name", "code", "category", "published", "isDeleted"]

    def to_representation(self, instance):
        representation = super(CurrentCropElementSerializer, self).to_representation(
            instance
        )

        category = CurrentCropSerializer(instance.category).data
        representation["category"] = category

        return representation


class CurrentGeometryFeatureSerializer(GeoFeatureModelSerializer):
    published = serializers.BooleanField(required=False)

    class Meta:
        model = CurrentGeometryFeature
        fields = "__all__"
        geo_field = "geom"  # This tells Django to return `geom` in GeoJSON format


class ContributionSerializer(serializers.ModelSerializer):
    geometries = CurrentGeometryFeatureSerializer(many=True, read_only=True)

    class Meta:
        model = Contribution
        fields = "__all__"

    def to_representation(self, instance):
        representation = super(ContributionSerializer, self).to_representation(instance)

        author = CustomUserSerializer(instance.author).data
        crop = CurrentCropSerializer(instance.crop).data
        if instance.crop_element:
            representation["crop_element"] = CurrentCropElementSerializer(
                instance.crop_element
            ).data
        suitability_level = SuitabilityLevelSerializer(instance.suitability_level).data
        status = instance.get_status_display()
        contributors = CustomUserSerializer(instance.contributors, many=True).data

        representation["author"] = author
        representation["crop"] = crop
        representation["suitability_level"] = suitability_level
        representation["status"] = status
        representation["contributors"] = contributors

        return representation


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"

    def to_representation(self, instance):
        representation = super(CommentSerializer, self).to_representation(instance)
        author = CustomUserSerializer(instance.author).data
        representation["author"] = author

        return representation


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = "__all__"

    def validate(self, data):
        if File.objects.filter(contribution=data["contribution"]).count() >= 5:
            raise serializers.ValidationError(
                "Only five PDF can be uploaded per contribution."
            )
        return data

    def validate_file(self, value):
        if value.content_type != "application/pdf":
            raise serializers.ValidationError("Only PDF files are allowed.")
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("The file size exceeds 5MB.")
        return value
