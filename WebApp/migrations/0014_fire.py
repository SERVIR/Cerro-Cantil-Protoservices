# Generated by Django 4.1 on 2023-08-14 19:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WebApp', '0013_alter_teammember_cropping'),
    ]

    operations = [
        migrations.CreateModel(
            name='Fire',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.FloatField(default=0.0, help_text='Detection latitude')),
                ('longitude', models.FloatField(default=0.0, help_text='Detection longitude')),
                ('acq_date', models.DateField(help_text='Detection date')),
                ('instrument', models.FloatField(default=0.0, help_text='Instrument')),
            ],
        ),
    ]
