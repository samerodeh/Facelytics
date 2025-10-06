import requests

url = "http://vis-www.cs.umass.edu/lfw/images/George_W_Bush/George_W_Bush_0001.jpg"
with open("faceA1.jpg", "wb") as f:
    f.write(requests.get(url).content)

url = "http://vis-www.cs.umass.edu/lfw/images/George_W_Bush/George_W_Bush_0002.jpg"
with open("faceA2.jpg", "wb") as f:
    f.write(requests.get(url).content)

url = "http://vis-www.cs.umass.edu/lfw/images/Colin_Powell/Colin_Powell_0001.jpg"
with open("faceB1.jpg", "wb") as f:
    f.write(requests.get(url).content)
