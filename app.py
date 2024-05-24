from flask import Flask, request, jsonify, render_template_string
from googletrans import Translator
from gtts import gTTS
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import os
import hashlib

nltk.download('vader_lexicon')

app = Flask(__name__, static_folder='', template_folder='')

def translate_text(text, target_language='en'):
    translator = Translator()
    translation = translator.translate(text, dest=target_language)
    return translation.text

def speak_text(text, lang='en'):
    tts = gTTS(text=text, lang=lang)
    hash_object = hashlib.md5(text.encode())
    output_path = f'static_{hash_object.hexdigest()}.mp3'  # Generate unique filename based on text content
    tts.save(output_path)
    return output_path

def detect_emotional_tone(text):
    sia = SentimentIntensityAnalyzer()
    sentiment = sia.polarity_scores(text)
    return sentiment

@app.route('/')
def index():
    with open('index.html') as file:
        return render_template_string(file.read())

@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    original_text = data.get('text')
    target_language = data.get('target_language', 'en')

    if not original_text:
        return jsonify({"error": "No text provided"})

    sentiment = detect_emotional_tone(original_text)
    translated_text = translate_text(original_text, target_language)
    audio_url = speak_text(translated_text, lang=target_language)

    response = {
        "original_text": original_text,
        "translated_text": translated_text,
        "sentiment": sentiment,
        "audio_url": audio_url
    }
    return jsonify(response)

@app.route('/<filename>')
def serve_static(filename):
    return app.send_static_file(filename)

if __name__ == '__main__':
    app.run(debug=True)
