# Generated by Django 4.1 on 2023-08-09 18:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('WebApp', '0007_planettile'),
    ]

    operations = [
        migrations.CreateModel(
            name='MemberBio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Member title', max_length=250)),
                ('description', models.TextField(help_text='Bio content')),
            ],
        ),
        migrations.CreateModel(
            name='TeamMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Name of the team member', max_length=250)),
                ('photo', models.ImageField(blank=True, help_text='Square image, minimum 150px X 150px', null=True, upload_to='icons/')),
                ('date_added', models.DateTimeField(auto_now_add=True)),
                ('date_modified', models.DateTimeField(auto_now=True)),
                ('active', models.BooleanField(default=True, help_text='Is the developer active?')),
                ('bio', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='WebApp.memberbio')),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='WebApp.organization')),
            ],
        ),
    ]