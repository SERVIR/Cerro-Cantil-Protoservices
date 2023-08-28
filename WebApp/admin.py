from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from WebApp.models import *
from image_cropping import ImageCroppingMixin

# Register the models to the admin site

admin.site.site_header = "CERRO Cantil Protoservices Administration"


class MeasurementAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display = (
        'station', 'measurement_date', 'measurement_temp', 'measurement_precip')  # list of fields to display
    list_filter = ('station__station_name',)  # filter by station name
    search_fields = ['station__station_name', ]  # search by station name
    date_hierarchy = 'measurement_date'  # filter by date


class OrganizationAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display = ('organization_id', 'organization_name', 'organization_country')  # list of fields to display
    list_filter = ('organization_country', 'organization_city')  # filter by country and city
    search_fields = ['organization_name', 'organization_country',
                     'organization_city']  # search by organization name, country, and city


admin.site.register(Organization, OrganizationAdmin)  # register the Organization model to the admin site
admin.site.register(WMSLayer)
admin.site.register(PlanetTile)


class TeamMemberAdmin(ImageCroppingMixin, admin.ModelAdmin):
    pass


admin.site.register(TeamMember, TeamMemberAdmin)
admin.site.register(MemberBio)
admin.site.register(NICFIAvailable)
