# Generated by Django 4.1 on 2023-08-09 18:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WebApp', '0009_alter_teammember_bio'),
    ]

    operations = [
        migrations.AddField(
            model_name='teammember',
            name='display_order',
            field=models.IntegerField(default=5),
        ),
    ]
