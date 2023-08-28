import json
import os
import warnings
from pathlib import Path

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from shapely.errors import ShapelyDeprecationWarning

warnings.filterwarnings("ignore", category=ShapelyDeprecationWarning)

BASE_DIR = Path(__file__).resolve().parent.parent
f = open(str(BASE_DIR) + '/data.json', )  # Get the data from the data.json file
data = json.load(f)


@csrf_exempt
def get_cam_areas(request):
    with open(os.path.join(Path(__file__).resolve().parent, 'data', 'cam_areas2.json'), 'r') as f:
        json_obj = json.load(f)
    return JsonResponse(json_obj)
