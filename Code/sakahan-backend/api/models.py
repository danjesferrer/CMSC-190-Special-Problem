import os
from django.core.files.storage import default_storage
from django.contrib.gis.db import models
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractBaseUser,
    PermissionsMixin,
)


class UserAccountManager(BaseUserManager):
    def create_user(self, email, password=None, **kwargs):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        email = email.lower()

        user = self.model(email=email, **kwargs)

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **kwargs):
        user = self.create_user(email, password=password, **kwargs)

        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user


class UserAccount(AbstractBaseUser, PermissionsMixin):
    class Role(models.IntegerChoices):
        CONTRIBUTOR = 0, "Contributor"
        ADMINISTRATOR = 1, "Administrator"

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True, max_length=255)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    role = models.IntegerField(choices=Role.choices, default=Role.CONTRIBUTOR)

    objects = UserAccountManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "role"]

    def __str__(self):
        return self.email


class LegacyCrop(models.Model):
    name = models.CharField(max_length=50, unique=True)
    published = models.BooleanField(default=False)

    def get_code(self):
        return self.name.lower().replace(" ", "_")

    def __str__(self):
        return self.name


class LegacyCropElement(models.Model):
    name = models.CharField(max_length=50)
    category = models.ForeignKey(LegacyCrop, on_delete=models.CASCADE)
    published = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["name", "category"], name="legacy_code")
        ]

    def get_code(self):
        name = self.name.lower().replace(" ", "_")
        category = self.category.name.lower().replace(" ", "_")

        return f"{name}_{category}"

    def __str__(self):
        return self.name


class LegacyGeometryFeature(models.Model):
    gridcode = models.IntegerField()
    layer = models.CharField(max_length=100)

    geom = models.MultiPolygonField()

    def __str__(self):
        return f"{self.layer}_{self.gridcode}"


class SuitabilityLevel(models.Model):
    name = models.CharField(max_length=100)
    label = models.CharField(max_length=10)
    gridcode = models.IntegerField(unique=True)
    color = models.CharField(max_length=7)

    def __str__(self):
        return self.name


class CurrentCrop(models.Model):
    name = models.CharField(max_length=50, unique=True)
    # Only set when the contribution is accepted.
    published = models.BooleanField(default=False)
    # Only set when the contribution is rejected and no current contributions are referencing to this crop.
    isDeleted = models.BooleanField(default=False)

    def get_code(self):
        return self.name.lower().replace(" ", "_")

    def __str__(self):
        return self.name


class CurrentCropElement(models.Model):
    name = models.CharField(max_length=50)
    category = models.ForeignKey(CurrentCrop, on_delete=models.CASCADE)
    # Only set when the contribution is accepted.
    published = models.BooleanField(default=False)
    isDeleted = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["name", "category"], name="current_code")
        ]

    def get_code(self):
        name = self.name.lower().replace(" ", "_")
        category = self.category.name.lower().replace(" ", "_")

        return f"{name}_{category}"

    def __str__(self):
        return self.name


# Contributions cannot be deleted via the frontend. They can only be rejected or deleted when the user is deleted.
class Contribution(models.Model):
    class Status(models.IntegerChoices):
        PENDING = 0, "Pending"
        APPROVED = 1, "Approved"
        REJECTED = 2, "Rejected"

    # When user is deleted, contributions are also deleted. However, it is impossible to delete the user via the frontend.
    author = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    description = models.TextField()

    # Protect crop, crop_element, and suitability_level from deletion.
    crop = models.ForeignKey(CurrentCrop, on_delete=models.SET_NULL, null=True)
    crop_element = models.ForeignKey(
        CurrentCropElement, on_delete=models.SET_NULL, null=True
    )
    suitability_level = models.ForeignKey(SuitabilityLevel, on_delete=models.PROTECT)

    status = models.IntegerField(choices=Status.choices, default=Status.PENDING)
    contributors = models.ManyToManyField(
        UserAccount,
        related_name="contributors",
        blank=True,
    )
    date_published = models.DateTimeField(auto_now_add=True)
    # Use this to put something like modified by user at mm/dd/yyyy hh:mm:ss
    last_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.author.first_name}_{self.crop.name}_{self.suitability_level}"


class CurrentGeometryFeature(models.Model):
    # This maps the color map set in geoserver.
    gridcode = models.IntegerField()
    # This is use for the CQL_FILTER <crop_code>_<crop_element_code>.
    layer = models.CharField(max_length=100)
    reference = models.ForeignKey(
        Contribution, on_delete=models.CASCADE, related_name="geometries"
    )
    # Default to True, so that geometries can be seen in the client if the contribution is still pending or approved.
    # This is set to False when the contribution is rejected.
    published = models.BooleanField(default=True)

    geom = models.PolygonField()

    def update_layer(self):
        if self.reference:
            if self.reference.crop_element:
                return self.reference.crop_element.get_code()
            else:
                return self.reference.crop.get_code()

    def __str__(self):
        return f"{self.layer}_{self.gridcode}"


class Comment(models.Model):
    contribution = models.ForeignKey(Contribution, on_delete=models.CASCADE)
    author = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author.first_name}_{self.contribution.title}"


def upload_path(instance, filename):
    return f"contributions/{instance.contribution.id}/pdfs/{filename}"


class File(models.Model):
    contribution = models.ForeignKey(
        Contribution, on_delete=models.CASCADE, related_name="pdfs"
    )
    date_uploaded = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    file = models.FileField(upload_to=upload_path)
    file_identifier = models.CharField(max_length=255, unique=True)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    file_type = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.contribution.title}_PDF_{self.uploaded_by.email}"

    def delete(self, *args, **kwargs):
        # Check if the file exists and delete from the file system (for local storage)
        if self.file:
            # Check if it's a local file or stored on a cloud service (S3, etc.)
            if hasattr(self.file, "storage") and self.file.storage != default_storage:
                # Delete the file from cloud storage (e.g., S3, DigitalOcean Spaces)
                self.file.storage.delete(self.file.name)
            elif os.path.isfile(self.file.path):
                # Delete the local file
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
