# Generated by Django 5.1.7 on 2025-03-19 17:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='crop',
            name='code',
            field=models.CharField(default='aaaa', max_length=100, unique=True),
            preserve_default=False,
        ),
    ]
