import json
from pathlib import Path

import requests
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.clickjacking import xframe_options_exempt

from WebApp.models import Fire
from WebApp.models import NICFIAvailable
from WebApp.models import PlanetTile
from WebApp.models import TeamMember
from WebApp.models import WMSLayer

# Build paths inside the project like this: BASE_DIR / 'subdir'.

BASE_DIR = Path(__file__).resolve().parent.parent
f = open(str(BASE_DIR) + '/data.json', )
data = json.load(f)


def home(request):
    return render(request, 'WebApp/home.html', {})


def login(request):
    return render(request, 'WebApp/login.html', {})


def nicfi_proxy(request):
    api_key = data["NICFI_API_KEY"]

    # Original URL you want to proxy to
    original_url = request.GET.get("nicfi_url")

    # Construct the modified URL with the API key
    modified_url = f"{original_url}?api_key={api_key}"

    print(modified_url)
    # Make a GET request to the modified URL
    response = requests.get(modified_url, stream=True)

    print("made it back")

    # Create a new HttpResponse with the content and headers from the remote response
    proxy_response = HttpResponse(
        content=response.content,
        status=response.status_code,
        content_type=response.headers.get('content-type')
    )

    print("made response")

    # Copy the headers from the remote response to the proxy response
    safe_headers = ['content-type', 'content-length']
    for header, value in response.headers.items():
        if header.lower() in safe_headers:
            proxy_response[header] = value

    print("added headers")

    return proxy_response


def planet_proxy(request):
    api_key = data["PLANET_API_KEY"]

    # Original URL you want to proxy to
    original_url = request.GET.get("planet_url")

    # Construct the modified URL with the API key
    modified_url = f"{original_url}?api_key={api_key}"

    # Make a GET request to the modified URL
    response = requests.get(modified_url, stream=True)

    proxy_response = HttpResponse(
        content=response.content,
        status=response.status_code,
        content_type=response.headers.get('content-type')
    )

    safe_headers = ['content-type', 'content-length']
    for header, value in response.headers.items():
        if header.lower() in safe_headers:
            proxy_response[header] = value

    return proxy_response


def map_full_screen(request):
    wms_layers = WMSLayer.objects.order_by('title').all()
    planet_tile = PlanetTile.objects.order_by("image_date").first()
    available_nicfi = NICFIAvailable.objects.order_by('-image_date').all()
    return render(request, 'WebApp/map_fullscreen.html', {
        "wms_layers": wms_layers,
        "planet_id": planet_tile.layer_id,
        "available_nicfi": available_nicfi
    })


def about(request):
    team_members = TeamMember.objects.exclude(active=False).order_by("display_order").all()
    return render(request, 'WebApp/about.html', {"team": team_members})


def privacy(request):
    return render(request, 'WebApp/privacy.html', {})


@xframe_options_exempt
def feedback(request):
    return render(request, 'WebApp/feedback.html', {})


# depreciated function
# @csrf_exempt
# def get_fires_in_bounding_box(request):
#     # Add start_date and end_date parameters
#     # then uncomment the range filter
#     min_lon = -91.76879882812501  # sw_lng
#     min_lat = 15.536391268328162  # sw_lat
#     max_lon = -89.99450683593751  # ne_lng
#     max_lat = 16.266095786250403  # ne_lat
#
#     fires_in_bbox = Fire.objects.filter(
#         Q(latitude__gte=min_lat) &
#         Q(latitude__lte=max_lat) &
#         Q(longitude__gte=min_lon) &
#         Q(longitude__lte=max_lon)
#     )
#
#     fires_in_bbox = fires_in_bbox.filter(acq_date__lt=datetime.date(2001, 1, 31))
#
#     serialized_fires = serializers.serialize('json', fires_in_bbox)
#
#     return JsonResponse(serialized_fires, safe=False)


def get_fires_sum_by_month(request):
    min_lon = request.POST.get("sw_lng", request.GET.get("sw_lng"))
    min_lat = request.POST.get("sw_lat", request.GET.get("sw_lat"))  # Lower-left corner
    max_lon = request.POST.get("ne_lng", request.GET.get("ne_lng"))
    max_lat = request.POST.get("ne_lat", request.GET.get("ne_lat"))  # Upper-right corner

    fires_query = Fire.objects.filter(
        latitude__gte=min_lat,
        latitude__lte=max_lat,
        longitude__gte=min_lon,
        longitude__lte=max_lon
    )

    fires_by_month = fires_query.annotate(
        month=TruncMonth('acq_date')
    ).values('month').annotate(
        total_fires=Count('id')
    ).order_by('month')

    return JsonResponse(list(fires_by_month), safe=False)
