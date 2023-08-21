import re

from django.core.management.base import BaseCommand
import os

import requests
import time
import json
import ast
import datetime
import json
from shapely.geometry import Polygon
from WebApp.planet import *
from django.conf import settings

from WebApp.models import NICFIAvailable

os.path.dirname(__file__)
f = open(os.path.join(settings.BASE_DIR, 'data.json', ))
data = json.load(f)
planet_key = data["NICFI_API_KEY"]


# This will be called from cron twice daily to check for a new set of imagery
def check_available():
    available_count = NICFIAvailable.objects.count() + 1
    print(str(available_count))
    url = "https://api.planet.com/basemaps/v1/mosaics/?api_key=" + planet_key + "&name__contains=planet_medres_visual&_page_size=1&_page=" + str(
        available_count)
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad responses (4xx or 5xx)

        data = response.json()  # Parse JSON data from the response

        # Now you can work with the parsed JSON data
        print("JSON data:", data)

        # Example: Accessing a specific key in the JSON data
        if 'mosaics' in data:
            mosaics = data['mosaics']
            if len(mosaics) > 0:
                value = mosaics[0]["name"]

                start_index = value.find("planet_medres_visual_") + len("planet_medres_visual_")

                # Find the position of the next underscore after the start index
                end_index = value.find("_mosaic", start_index)

                # Extract the date range from the input string
                date_range = value[start_index:end_index]

                print("Extracted date range:", date_range)

                NICFIAvailable.objects.get_or_create(image_date=date_range)
                check_available();


    except requests.exceptions.RequestException as e:
        print("Error:", e)
    except json.JSONDecodeError as e:
        print("Error parsing JSON:", e)


class Command(BaseCommand):

    def handle(self, *args, **options):
        # call the planet script with parameters
        check_available()
