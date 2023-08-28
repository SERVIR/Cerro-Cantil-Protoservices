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


class NICFIAvailable(models.Model):
    image_date = models.TextField(help_text="Image YYYY-mm")

    def __str__(self):
        return str(self.image_date)


class Fire(models.Model):
    latitude = models.FloatField(help_text="Detection latitude", default=0.0)
    longitude = models.FloatField(help_text="Detection longitude", default=0.0)
    acq_date = models.DateField(help_text="Detection date")
    instrument = models.TextField(help_text="Instrument", default=0.0)

    def __str__(self):
        return str(self.acq_date) + "_" + str(self.latitude) + "_" + str(self.longitude) + "_" + str(self.instrument)


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
