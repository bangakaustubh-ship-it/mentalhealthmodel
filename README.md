# 🧠 Mental Health Predictor - AI-Powered Student Wellness Analysis

A comprehensive machine learning web application that predicts mental health scores based on social media usage patterns, lifestyle factors, and academic stress. Built with Flask, Python, and modern web technologies.

## 🌟 Key Features

### 🤖 Advanced ML Model
- **Regression-based prediction** with 12 key features
- Trained on **5,000 student records**
- Analyzes social media usage, sleep patterns, physical activity, and stress levels
- Real-time predictions with actionable insights

### 💻 Professional Web Interface
- **Modern, responsive design** with smooth animations
- Interactive prediction form with real-time validation
- Visual score display with animated progress circles
- Personalized recommendations based on assessment results
- Mobile-friendly and accessible

### 📊 Comprehensive Analytics
- Detailed mental health score (1-10 scale)
- Status categorization (Excellent, Good, Fair, Needs Attention)
- Input summary visualization
- Evidence-based recommendations
- Model performance metrics and insights

## 🛠️ Technology Stack

### Backend
- **Flask** - Python web framework
- **Scikit-learn** - Machine learning model
- **Pandas & NumPy** - Data processing
- **Python 3.12+**

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - Interactive functionality
- **Font Awesome** - Icon library

### Data Science
- **Jupyter Notebook** - Model development and analysis
- **Matplotlib & Seaborn** - Data visualization

## 📋 Features Analyzed

1. **Personal Information**
   - Age, Gender, Country, Academic Level

2. **Social Media Usage**
   - Most used platform (Facebook, Instagram, Twitter, etc.)
   - Primary purpose (Education, Entertainment, Networking)
   - Average daily usage hours
   - Daily phone unlocks

3. **Lifestyle & Wellness**
   - Study hours per day
   - Physical activity hours
   - Sleep hours per night
   - Current stress level

## 🚀 Installation & Setup

### Prerequisites
```bash
python 3.12 or higher
pip (Python package manager)
```

### Installation Steps

1. **Clone or download this repository**
```bash
cd MentalHealthPredictot
```

2. **Install required packages**
```bash
pip install -r requirements.txt
```

3. **Verify model file exists**
Ensure `Mental_Health_Model.pkl` is in the project root directory

4. **Run the application**
```bash
python app.py
```

5. **Access the website**
Open your browser and navigate to:
```
http://localhost:5000
```

## 📱 Usage

1. **Navigate** to the "Try the Predictor" section
2. **Fill out the form** with your personal information and lifestyle data
3. **Submit** to receive your mental health score
4. **Review** personalized recommendations
5. **Export** results for your records (optional)

## 🎯 Model Performance

- **Dataset**: 5,000 student records
- **Features**: 12 comprehensive factors
- **R² Score**: ~0.85
- **MAE**: ~0.42
- **RMSE**: ~0.58

## 📊 Key Insights

### Negative Impact Factors
- Excessive social media usage (7+ hours/day)
- Poor sleep quality (under 6 hours)
- High stress levels
- Low physical activity

### Positive Impact Factors
- Regular physical activity (2+ hours/day)
- Adequate sleep (7-9 hours)
- Balanced study schedule
- Educational use of social media

## 🔒 Privacy & Disclaimer

⚠️ **Important**: This tool is for **educational and informational purposes only**. It should **not replace professional medical advice**, diagnosis, or treatment.

- No data is stored or transmitted to third parties
- All predictions are processed locally
- Results are private and confidential
- If experiencing mental health issues, please consult a qualified healthcare provider

## 📞 Emergency Resources

- **Crisis Helpline**: 988 (US)
- **Mental Health Resources**: https://www.mentalhealth.gov
- **NAMI Support**: https://www.nami.org

## 🎓 Project Structure

```
MentalHealthPredictot/
│
├── app.py                          # Flask application
├── Mental_Health_Model.pkl         # Trained ML model
├── mentalhealthpredictor.ipynb    # Model training notebook
├── Student Social Media...csv      # Training dataset
├── requirements.txt                # Python dependencies
├── README.md                       # Project documentation
│
├── templates/
│   └── index.html                  # Main web page
│
└── static/
    ├── css/
    │   └── style.css              # Stylesheet
    └── js/
        └── main.js                 # JavaScript functionality
```

## 🌐 API Endpoints

- `GET /` - Main application page
- `POST /predict` - Submit prediction request
- `GET /api/stats` - Model statistics
- `GET /api/health` - Health check
- `GET /api/model-info` - Detailed model information

## 💡 Future Enhancements

- [ ] User authentication and history tracking
- [ ] Data visualization dashboard
- [ ] Export results as PDF
- [ ] Multi-language support
- [ ] Integration with wearable devices
- [ ] Advanced analytics and trends
- [ ] Community forum for support

## 👨‍💻 Developer

**KAUSTUBH**
- Built with Python, Flask, and Machine Learning
- Designed for student mental health awareness
- Open for contributions and improvements

## 📄 License

This project is created for educational purposes. Feel free to use and modify with attribution.

## 🙏 Acknowledgments

- Dataset: Student Social Media And Mental Health Impact
- Icons: Font Awesome
- Fonts: Google Fonts (Inter)
- Inspiration: Mental health awareness in academic communities

---

**Built with ❤️ for student mental wellness**

*Last Updated: September 2026*
