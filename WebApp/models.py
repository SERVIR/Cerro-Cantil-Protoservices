from django.db import models
from image_cropping import ImageRatioField
from image_cropping.utils import get_backend


# Organization model: This data model describes an organization that operates a monitoring station network
class Organization(models.Model):
    organization_id = models.CharField(max_length=10, primary_key=True,
                                       help_text="Organization ID, usually the Accronym")
    organization_name = models.CharField(max_length=100, help_text="Organization Name (No Accronym)")
    organization_address = models.CharField(max_length=100, help_text="Organization physical address - Optional",
                                            blank=True)
    organization_city = models.CharField(max_length=100, help_text="Organization City - Optional", blank=True)
    organization_country = models.CharField(max_length=2, help_text="Organization Country ISO Code - Optional",
                                            blank=True)


# Station model: This data model describes a monitoring station operated by one of the organizations in the system
class Station(models.Model):
    station_id = models.CharField(max_length=10, primary_key=True, help_text="Station ID, unique identifier code")
    station_name = models.CharField(max_length=100, help_text="Station Name, a human readable name")
    station_lat = models.FloatField(help_text="Station Latitude in decimal degrees")
    station_lon = models.FloatField(help_text="Station Longitude in decimal degrees")
    station_elev = models.FloatField(help_text="Station Elevation in meters above sea level - Optional", blank=True,
                                     null=True)
    station_location = models.CharField(max_length=100, help_text="Station Location - Optional", blank=True)
    station_organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    station_year_established = models.IntegerField(help_text="Year the station was established - Optional", blank=True,
                                                   null=True)

    def __str__(self):
        return self.station_id + "-" + self.station_name


# Simplified Measurement model: This data model describes the individual measurements taken at a monitoring station
# The model includes just a small sample of variables (temperature and precipitation) taken on a daily frequency, for demonstration purposes,
# but it can be easily extended to include more variables and/or more frequent measurements
class Measurement(models.Model):
    station = models.ForeignKey(Station, on_delete=models.CASCADE)
    measurement_date = models.DateField(help_text="Measurement Date")
    measurement_temp = models.FloatField(help_text="Temperature in degrees Celsius")
    measurement_precip = models.FloatField(help_text="Precipitation in millimeters")

    def __str__(self):
        return self.station.station_id + "-" + self.station.station_name + "-" + str(self.measurement_date)


class WMSLayer(models.Model):
    title = models.CharField(max_length=200, help_text='Enter a title which will display in the layer list on the map '
                                                       'application')
    url = models.TextField(help_text="Enter url to the WMS service")
    attribution = models.TextField(help_text="Enter data attribution to display in map UI")
    layers = models.CharField(max_length=200, help_text='Enter layer names from the WMS to display')
    wfs_layer_types = models.CharField(max_length=200, help_text='WFS LayerType(s).  If there are two comma separate',
                                       default="")

    def __str__(self):
        return self.title


class PlanetTile(models.Model):
    image_date = models.DateField(help_text="Image Date")
    layer_id = models.TextField(help_text="Planet LayerID for the url template")

    def __str__(self):
        return str(self.image_date)


class MemberBio(models.Model):
    title = models.CharField(help_text="Member title", max_length=250)
    description = models.TextField(help_text="Bio content")

    def __str__(self):
        return self.title


class TeamMember(models.Model):
    name = models.CharField(help_text="Name of the team member", max_length=250)
    photo = models.ImageField(upload_to='icons/',
                              blank=True, null=True,
                              help_text="Square image, minimum 150px X 150px")
    cropping = ImageRatioField('photo', '480x360')
    date_added = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE)
    active = models.BooleanField(default=True, help_text="Is the developer active?")
    display_order = models.IntegerField(default=5)
    bio = models.ForeignKey('MemberBio', on_delete=models.CASCADE)

    @property
    def image_thumbnail(self):
        if self.photo:
            return get_backend().get_thumbnail_url(
                self.photo,
                {
                    'size': (480, 360),
                    'box': self.cropping,
                    'crop': True,
                    'detail': True,
                }
            )
        else:
            return "/static/app/img/no_profile.png"

    def image_url(self):
        if self.photo:
            return self.photo.url
        else:
            return "/static/app/img/no_profile.png"

    def __str__(self):
        return self.name
