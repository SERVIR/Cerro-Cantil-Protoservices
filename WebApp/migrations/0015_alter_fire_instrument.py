# Generated by Django 4.1 on 2023-08-14 19:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WebApp', '0014_fire'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fire',
            name='instrument',
            field=models.TextField(default=0.0, help_text='Instrument'),
        ),
    ]
