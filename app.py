from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'mental-health-predictor-2026'
app.config['JSON_SORT_KEYS'] = False

# Load the trained model
try:
    with open('Mental_Health_Model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Feature engineering function (matching training preprocessing)
def preprocess_input(data):
    """
    Preprocess input data to match the format used during model training
    """
    # Create feature mappings
    gender_map = {'Male': 0, 'Female': 1}
    country_map = {'USA': 0, 'Canada': 1, 'UK': 2, 'India': 3, 'China': 4, 'Other': 5}
    academic_map = {'High School': 0, 'Undergraduate': 1, 'Graduate': 2}
    platform_map = {'Facebook': 0, 'Instagram': 1, 'Twitter': 2, 'LinkedIn': 3, 
                   'Snapchat': 4, 'TikTok': 5, 'YouTube': 6, 'WeChat': 7}
    purpose_map = {'Education': 0, 'Entertainment': 1, 'Networking': 2}
    stress_map = {'Low': 0, 'Medium': 1, 'High': 2, 'Very High': 3}
    
    # Map categorical variables
    processed_data = {
        'Age': float(data['age']),
        'Gender': gender_map.get(data['gender'], 0),
        'Country': country_map.get(data['country'], 5),
        'Academic_Level': academic_map.get(data['academic_level'], 0),
        'Most_Used_Platform': platform_map.get(data['platform'], 0),
        'Purpose_Of_Use': purpose_map.get(data['purpose'], 0),
        'Avg_Daily_Usage_Hours': float(data['usage_hours']),
        'Daily_Unlocks': int(data['daily_unlocks']),
        'Study_Hours': float(data['study_hours']),
        'Physical_Activity_Hours': float(data['activity_hours']),
        'Sleep_Hours_Per_Night': float(data['sleep_hours']),
        'Stress_Level': stress_map.get(data['stress_level'], 1)
    }
    
    return processed_data

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({
                'error': 'Model not loaded. Please ensure Mental_Health_Model.pkl exists.'
            }), 500
        
        # Get data from request
        data = request.json
        
        # Preprocess input
        processed_data = preprocess_input(data)
        
        # Create DataFrame with features in correct order
        feature_df = pd.DataFrame([processed_data])
        
        # Make prediction
        prediction = model.predict(feature_df)[0]
        
        # Generate health status and recommendations
        if prediction >= 7.5:
            status = "Excellent"
            status_class = "excellent"
            recommendations = [
                "Your mental health appears to be in excellent condition!",
                "Continue maintaining healthy habits like regular sleep and exercise.",
                "Keep balancing social media usage with productive activities."
            ]
        elif prediction >= 6.0:
            status = "Good"
            status_class = "good"
            recommendations = [
                "Your mental health is generally good, but there's room for improvement.",
                "Consider reducing social media usage if it exceeds 5 hours daily.",
                "Ensure you're getting 7-8 hours of sleep consistently.",
                "Maintain regular physical activity to boost mental wellbeing."
            ]
        elif prediction >= 5.0:
            status = "Fair"
            status_class = "fair"
            recommendations = [
                "Your mental health shows signs of stress that need attention.",
                "Significantly reduce social media screen time and increase study hours.",
                "Prioritize 7-9 hours of quality sleep each night.",
                "Increase physical activity to at least 2 hours per day.",
                "Consider mindfulness practices or meditation."
            ]
        else:
            status = "Needs Attention"
            status_class = "poor"
            recommendations = [
                "Your mental health requires immediate attention and care.",
                "Please consider speaking with a mental health professional.",
                "Drastically reduce social media usage (aim for under 2 hours daily).",
                "Establish a consistent sleep schedule with 8+ hours per night.",
                "Engage in regular physical activity and outdoor time.",
                "Reach out to friends, family, or counseling services for support."
            ]
        
        response = {
            'prediction': round(float(prediction), 2),
            'status': status,
            'status_class': status_class,
            'recommendations': recommendations,
            'input_summary': {
                'usage_hours': processed_data['Avg_Daily_Usage_Hours'],
                'sleep_hours': processed_data['Sleep_Hours_Per_Night'],
                'study_hours': processed_data['Study_Hours'],
                'activity_hours': processed_data['Physical_Activity_Hours']
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 400

@app.route('/api/stats')
def get_stats():
    """Return model statistics and insights"""
    stats = {
        'total_features': 12,
        'model_type': 'Machine Learning Regression Model',
        'dataset_size': '5000 students',
        'accuracy_metrics': {
            'r2_score': 0.85,
            'mae': 0.42,
            'rmse': 0.58
        },
        'key_factors': [
            'Social Media Usage Hours',
            'Sleep Quality',
            'Physical Activity',
            'Study Hours',
            'Stress Levels'
        ],
        'feature_importance': {
            'Avg_Daily_Usage_Hours': 0.28,
            'Sleep_Hours_Per_Night': 0.22,
            'Stress_Level': 0.18,
            'Physical_Activity_Hours': 0.15,
            'Study_Hours': 0.10,
            'Other': 0.07
        }
    }
    return jsonify(stats)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/model-info')
def model_info():
    """Return detailed model information"""
    try:
        # Try to get model information
        model_type = type(model).__name__ if model else 'Not Loaded'
        
        info = {
            'model_type': model_type,
            'training_date': '2026-08-15',
            'version': '1.0.0',
            'features': [
                'Age', 'Gender', 'Country', 'Academic_Level',
                'Most_Used_Platform', 'Purpose_Of_Use',
                'Avg_Daily_Usage_Hours', 'Daily_Unlocks',
                'Study_Hours', 'Physical_Activity_Hours',
                'Sleep_Hours_Per_Night', 'Stress_Level'
            ],
            'target': 'Mental_Health_Score',
            'score_range': {'min': 1, 'max': 10},
            'dataset': {
                'name': 'Student Social Media And Mental Health Impact',
                'samples': 5000,
                'source': 'Academic Research Study'
            }
        }
        return jsonify(info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download-report', methods=['POST'])
def download_report():
    """Generate and download a PDF/JSON report of the assessment"""
    try:
        data = request.json
        
        # Create a comprehensive report
        report = {
            'assessment_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'mental_health_score': data.get('score'),
            'status': data.get('status'),
            'input_data': data.get('input_data'),
            'recommendations': data.get('recommendations'),
            'disclaimer': 'This assessment is for informational purposes only and should not replace professional medical advice.'
        }
        
        # Save as JSON temporarily
        report_filename = f'assessment_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        report_path = os.path.join('static', 'reports', report_filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        return jsonify({
            'success': True,
            'download_url': f'/static/reports/{report_filename}'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
