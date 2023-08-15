from django.core.management.base import BaseCommand
import csv
from WebApp.models import Fire  # Replace with your actual model


def import_data_from_csv(file_path):
    with open(file_path, 'r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            Fire.objects.create(
                latitude=row['latitude'],  # Replace with your field names
                longitude=row['longitude'],  # Replace with your field names
                acq_date=row['acq_date'],  # Replace with your field names
                instrument=row['instrument']
            )


class Command(BaseCommand):
    help = 'Pass the path of the new csv file.  If using windows OS you must use double slashes for the path'

    def add_arguments(self, parser):
        parser.add_argument('--csv_path', required=True, type=str)

    def handle(self, *args, **options):
        csv_path = options.get('csv_path', '').strip()
        import_data_from_csv(csv_path)

        # print("Loading VIIRS")
        # for i in range(2012, 2021):
        #     csv_file_path = 'C:\\Users\\washmall\\Documents\\cerro_shapes\\FIRMS\\viirs-snpp_' + str(
        #         i) + '_Guatemala.csv'
        #     import_data_from_csv(csv_file_path)
        # for i in range(2000, 2022):
        #     csv_file_path = 'C:\\Users\\washmall\\Documents\\cerro_shapes\\FIRMS\\modis_' + str(
        #         i) + '_Guatemala.csv'
        #     import_data_from_csv(csv_file_path)
