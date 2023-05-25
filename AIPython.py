import pandas as pd
import sys
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import OneHotEncoder

encoder = OneHotEncoder(handle_unknown='ignore')
file_path = './song_details.csv'
file_data = pd.read_csv(file_path)

y = file_data.s_no

features = ['danceability', 'energy',
       'key', 'loudness', 'mode', 'speechiness', 'acousticness',
       'instrumentalness', 'liveness', 'valence', 'tempo']

x = file_data[features]
inputfile = sys.argv[1]
inputdata = pd.read_csv(inputfile)
model = DecisionTreeRegressor(random_state=10)
model.fit(x,y)
result = model.predict(inputdata)[0]

print(file_data[file_data['s_no'] == result].track_id)