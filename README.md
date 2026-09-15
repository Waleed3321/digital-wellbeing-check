# Digital Wellbeing Check

A lightweight machine learning web app that estimates a student's digital wellbeing score based on social media usage, sleep, stress, study habits, and activity levels.

The project combines a trained ML model with a FastAPI backend and a simple front-end interface for interactive score prediction.

## Overview

This app predicts a wellbeing score on a scale from 0 to 10 using inputs such as:

- age
- gender
- country
- academic level
- most-used social platform
- primary reason for using social media
- daily usage hours
- daily unlocks
- study hours
- physical activity hours
- sleep hours
- stress level

The result is shown as a gauge and score band, helping the user understand whether their habits suggest a positive or strained wellbeing profile.

## Tech Stack

- Python
- FastAPI
- Pydantic
- scikit-learn
- pandas
- joblib
- HTML, CSS, JavaScript

## Project Structure

```text
.
├── index.html              # Front-end interface
├── style.css               # Styling for the dashboard and form
├── script.js               # Form logic, sliders, gauge rendering, API calls
├── main.py                 # FastAPI backend and model inference logic
├── Mental_Health_Model.pkl # Trained ML model
├── Student Social Media And Mental Health Impact.csv
├── ML_Project.ipynb        # Notebook used for model development and experiments
└── README.md               # Project documentation
```

## Model Notes

The model is loaded from `Mental_Health_Model.pkl` and receives a single input row generated from the form values. It predicts a numerical wellbeing score, which is rounded to two decimal places before being returned to the frontend.

A country grouping step is applied so countries outside the most common training set values are treated as `Other`.

## Prerequisites

- Python 3.10+
- pip
- A modern browser

## Setup

1. Open a terminal in the project folder.
2. Create and activate a virtual environment:

```bash
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

3. Install the required dependencies:

```bash
pip install fastapi uvicorn pandas scikit-learn joblib pydantic
```

4. Make sure the trained model file exists in the root directory:

```text
Mental_Health_Model.pkl
```

## Run the App

### Start the backend API

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

This starts the FastAPI server on:

```text
http://127.0.0.1:8000
```

### Start a simple frontend server

From another terminal, run:

```bash
python -m http.server 8001
```

Then open this URL in your browser:

```text
http://localhost:8001
```

## API Endpoint

### POST /predict

Request body example:

```json
{
  "age": 20,
  "gender": "Male",
  "country": "Pakistan",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 5.5,
  "daily_unlocks": 60,
  "study_hours": 3.0,
  "physical_activity_hours": 1.5,
  "sleep_hours_per_night": 7.0,
  "stress_level": "Medium"
}
```

Example response:

```json
{
  "predicted_mental_health_score": 6.78
}
```

## Usage

1. Fill in the form with your information.
2. Adjust the lifestyle sliders as needed.
3. Click “Check my score”.
4. The model returns a predicted wellbeing score and a practical interpretation band.

## Notes

- This project is intended for educational and demo purposes.
- The score is a model estimate, not a clinical diagnosis or medical assessment.
- The frontend expects the backend to be running locally before submitting predictions.

## License

This project is provided for learning and demonstration purposes.
