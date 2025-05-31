from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Creates superuser"

    def handle(self, *args, **kwargs):
        # get or create superuser
        user = User.objects.filter(email="admin@sakahan.xyz").first()
        if not user:
            user = User.objects.create_superuser(
                email="admin@sakahan.xyz", password="Admin123!"
            )
