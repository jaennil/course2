from yandex_geocoder import Client

client = Client("97f976c6-cd44-4f4d-a00e-42ff12b8f747")

coordinates = client.coordinates("Москва Льва Толстого 16")
print(coordinates)
