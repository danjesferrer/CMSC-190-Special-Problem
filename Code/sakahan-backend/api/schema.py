from django.conf import settings
from drf_spectacular.openapi import AutoSchema


class CustomAutoSchema(AutoSchema):
    def get_tags(self):
        if not settings.DEVELOPMENT_MODE:
            return super().get_tags()

        tokenized_path = self._tokenize_path()
        if "current" in tokenized_path:
            return [tokenized_path[2]]

        if len(tokenized_path) > 1:
            return [tokenized_path[1]]
        return tokenized_path[:1]
