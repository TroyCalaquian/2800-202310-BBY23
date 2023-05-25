import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier

# Load and preprocess the data
df = pd.read_csv('song_details.csv')

# Split the data into features and labels
features = df.drop('likes', axis=1)
labels = df['likes']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

# Scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train the model
model = MLPClassifier(hidden_layer_sizes=(16,), activation='relu', solver='adam', random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate the model
accuracy = model.score(X_test_scaled, y_test)
print('Accuracy:', accuracy)

# Generate song recommendations
user_preferences = [[0.7, 0.8, 2, -6.2, 1, 0.05, 0.2, 0.1, 0.3, 0.6, 120]]  # Adjust the values based on user preferences
user_preferences_scaled = scaler.transform(user_preferences)
recommendations = model.predict(user_preferences_scaled)
print('Recommendations:', recommendations)
