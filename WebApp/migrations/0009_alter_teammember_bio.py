# Generated by Django 4.1 on 2023-08-09 18:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('WebApp', '0008_memberbio_teammember'),
    ]

    operations = [
        migrations.AlterField(
            model_name='teammember',
            name='bio',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebApp.memberbio'),
        ),
    ]
