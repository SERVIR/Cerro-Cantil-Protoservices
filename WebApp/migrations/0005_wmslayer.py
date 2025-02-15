# Generated by Django 4.1 on 2023-07-28 20:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('WebApp', '0004_alter_measurement_measurement_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='WMSLayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Enter a title which will display in the layer list on the map application', max_length=200)),
                ('url', models.TextField(help_text='Enter url to the WMS service')),
                ('attribution', models.TextField(help_text='Enter data attribution to display in map UI')),
                ('layers', models.CharField(help_text='Enter layer names from the WMS to display', max_length=200)),
            ],
        ),
    ]
