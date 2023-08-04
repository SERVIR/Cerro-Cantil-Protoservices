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

from WebApp.models import PlanetTile

os.path.dirname(__file__)
f = open(os.path.join(settings.BASE_DIR, 'data.json', ))
data = json.load(f)
planet_key = data["PLANET_API_KEY"]


# This will be called from cron twice daily to check for a new set of imagery
class Command(BaseCommand):

    def handle(self, *args, **options):
        # call the planet script with parameters
        planet_tile = PlanetTile.objects.order_by("image_date").first()
        print(planet_tile.image_date)

        print("I will run the check for new planet data and update with the new info!")
        present = datetime.datetime.now()
        # if past < present.date():
        #     print(str(past))
        #     while past < present.date():
        #         print("In time loop")

        api_key = planet_key
        layer_count = 2  # Include the n best layers

        item_types = ['PSScene']
        geometry = Polygon([
            [
                -91.1528778076172,
                16.10453539564735
            ],
            [
                -91.1528778076172,
                15.698408515946419
            ],
            [
                -90.61111450195314,
                15.698408515946419
            ],
            [
                -90.61111450195314,
                16.10453539564735
            ],
            [
                -91.1528778076172,
                16.10453539564735
            ]
        ])
        buffer = 0.5
        addsimilar = False
        print(str((present + datetime.timedelta(-5)).date())+ " - " + str(present.date()))

        stats = get_planet_map_id(api_key, geometry, str((present + datetime.timedelta(-5)).date()), str(present.date()), layer_count, item_types, buffer, addsimilar, True)

        print(str(stats["buckets"][-1]["start_time"]))



        last_available = datetime.datetime.strptime(str(stats["buckets"][-1]["start_time"]).split("T")[0], '%Y-%m-%d').date() # datetime.datetime.fromisoformat(re.sub(r"'", "", str(stats["buckets"][-1]["start_time"]))).date()
        end = str(last_available)
        start = str((last_available + datetime.timedelta(-5)))

        print("start" + start)


        # make real date range and call with stats False
        myList = get_planet_map_id(api_key, geometry, start, end, layer_count, item_types, buffer, addsimilar, False)

        # here is where i would get info to add to db
        # new concept we need to keep the latest three dates

        if len(myList) > 0:
            theimage = myList[0]
            print(str(theimage))
            print(theimage["date"] + ", " + theimage["LayerID"])

            layer_date = datetime.datetime.strptime(theimage["date"], '%Y-%m-%d').date()

            if planet_tile.layer_id != theimage["LayerID"]:
                planet_tile.image_date = layer_date
                planet_tile.layer_id = theimage["LayerID"]
                planet_tile.save()

            print(theimage["date"])
            print(theimage["LayerID"])
        # add a day to past
        #         past = past + datetime.timedelta(1)
        #         time.sleep(1)
        # else:
        #     print("after today")
