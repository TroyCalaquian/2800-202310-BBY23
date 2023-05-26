import pandas as pd
import sys
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import OneHotEncoder
import json

encoder = OneHotEncoder(handle_unknown='ignore')
file_path = './song_details.csv'
file_data = pd.read_csv(file_path)

y = file_data.s_no
songarray = []

features = ['danceability', 'energy',
       'key', 'loudness', 'mode', 'speechiness', 'acousticness',
       'instrumentalness', 'liveness', 'valence', 'tempo']

x = file_data[features]
# inputfile = sys.argv[1]
inputfile = './inputtest.csv'
inputdata = pd.read_csv(inputfile)
model = DecisionTreeRegressor(random_state=10)
model.fit(x,y)
# print(inputdata)
for index, row in inputdata.iterrows():
    result = model.predict(inputdata)[index]
    songarray.extend(file_data[file_data['s_no'] == result].track_id)
output = json.dumps(songarray)
print(output)
