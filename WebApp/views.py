import datetime
import json
from pathlib import Path

from django.contrib import messages
from django.shortcuts import render
from django.templatetags.static import static
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.core import serializers
from django.http import JsonResponse
from WebApp.models import Fire

from WebApp.forms import MeasurementForm
from WebApp.models import Measurement
from WebApp.models import WMSLayer
from WebApp.models import PlanetTile
from WebApp.models import TeamMember
# Build paths inside the project like this: BASE_DIR / 'subdir'.
from WebApp.utils import get_stations

BASE_DIR = Path(__file__).resolve().parent.parent
f = open(str(BASE_DIR) + '/data.json', )
data = json.load(f)


def home(request):
    return render(request, 'WebApp/home.html', {})


@csrf_exempt
def select_aoi(request):
    return render(request, 'WebApp/select_aoi.html', {})


@csrf_exempt
def map_chart(request):
    context = {}
    return render(request, 'WebApp/map_chart.html', context)


def map_fixed_size(request):
    return render(request, 'WebApp/map_fixedsize.html', {})


def login(request):
    return render(request, 'WebApp/login.html', {})


def map_from_gee(request):
    return render(request, 'WebApp/map_from_GEE.html', {})


def map_full_screen(request):
    wms_layers = WMSLayer.objects.order_by('title').all()
    planet_tile = PlanetTile.objects.order_by("image_date").first()
    return render(request, 'WebApp/map_fullscreen.html', {
        "wms_layers":wms_layers,
        "planet_id": planet_tile.layer_id
    })


def chart_from_netcdf(request):
    # url = 'https://thredds.servirglobal.net/thredds/wms/mk_aqx/geos/20191123.nc?service=WMS&version=1.3.0&request
    # =GetCapabilities' document = requests.get(url) soup = BeautifulSoup(document.content, "lxml-xml")
    # bounds=soup.find("EX_GeographicBoundingBox") children = bounds.findChildren() bounds_nc=[float(children[
    # 0].get_text()),float(children[1].get_text()),float(children[2].get_text()),float(children[3].get_text())]

    context = {
        "netcdf_path": data["sample_netCDF"],
        # "netcdf_bounds":bounds_nc
    }
    return render(request, 'WebApp/chart_from_netCDF.html', context)


def chart_climateserv(request):
    return render(request, 'WebApp/chart_from_ClimateSERV.html', {})


def chart_sqlite(request):
    return render(request, 'WebApp/chart_from_SQLite.html', get_stations())


def about(request):
    team_members = TeamMember.objects.exclude(active=False).order_by("display_order").all()
    return render(request, 'WebApp/about.html', {"team": team_members})

def privacy(request):
    return render(request, 'WebApp/privacy.html', {})

@xframe_options_exempt
def feedback(request):
    return render(request, 'WebApp/feedback.html', {})


def setup(request):
    return render(request, 'WebApp/setup.html', {})


@csrf_exempt
def updates(request):
    if request.method == "POST":
        context = {}
        form = MeasurementForm(request.POST)
        context["form"] = form
        if form.is_valid():
            member = Measurement(station_id=request.POST["stations"], measurement_date=request.POST["measurement_date"],
                                 measurement_temp=request.POST["measurement_temp"],
                                 measurement_precip=request.POST["measurement_precip"])
            member.save()
            url = reverse('admin:%s_%s_change' % (member._meta.app_label, member._meta.model_name), args=[member.id])
            if request.user.is_active and request.user.is_superuser:
                messages.success(request, mark_safe(
                    'Data submitted! <a href="' + url + '">Go to this record in admin pages</a>'), extra_tags='form1')
            else:
                messages.success(request,
                                 mark_safe('Data submitted!'), extra_tags='form1')
            form = MeasurementForm()
        else:
            messages.error(request, 'Invalid form submission.')
            messages.error(request, form.errors)
    else:
        form = MeasurementForm()
    return render(request, 'WebApp/update_datamodel.html', {"form": form})


@csrf_exempt
def get_fires_in_bounding_box(request):
    # Add start_date and end_date parameters
    # then uncomment the range filter
    min_lon = -91.76879882812501 # sw_lng
    min_lat = 15.536391268328162  # sw_lat
    max_lon = -89.99450683593751 # ne_lng
    max_lat = 16.266095786250403  # ne_lat

    fires_in_bbox = Fire.objects.filter(
        Q(latitude__gte=min_lat) &
        Q(latitude__lte=max_lat) &
        Q(longitude__gte=min_lon) &
        Q(longitude__lte=max_lon)
    )

    fires_in_bbox= fires_in_bbox.filter(acq_date__lt=datetime.date(2001, 1, 31))

    # fires_in_bbox = fires_in_bbox.filter(date_field__gte=start_date)
    # fires_in_bbox = fires_in_bbox.filter(date_field__lte=end_date)

    serialized_fires = serializers.serialize('json', fires_in_bbox)

    return JsonResponse(serialized_fires, safe=False)


def get_fires_sum_by_month(request):

    min_lon =  request.POST.get("sw_lng", request.GET.get("sw_lng"))
    min_lat = request.POST.get("sw_lat", request.GET.get("sw_lat"))   # Lower-left corner
    max_lon = request.POST.get("ne_lng", request.GET.get("ne_lng"))
    max_lat = request.POST.get("ne_lat", request.GET.get("ne_lat")) # Upper-right corner

    fires_query = Fire.objects.filter(
        latitude__gte=min_lat,
        latitude__lte=max_lat,
        longitude__gte=min_lon,
        longitude__lte=max_lon
    )

    fires_by_month = fires_by_month = fires_query.annotate(
        month=TruncMonth('acq_date')
    ).values('month').annotate(
        total_fires=Count('id')
        # total_damage=Sum('damage_field')  # Replace with your actual damage field name
    ).order_by('month')

    return JsonResponse(list(fires_by_month), safe=False)