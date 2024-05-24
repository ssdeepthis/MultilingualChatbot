document.getElementById('speak-btn').addEventListener('click', function() {
    var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US'; // This can be dynamic if needed
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
        var originalText = event.results[0][0].transcript;
        displayUserMessage(originalText);

        var targetLanguage = document.getElementById('target-language').value;

        sendToBackend(originalText, targetLanguage);
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error', event.error);
    };

    recognition.start();
});

document.getElementById('send-btn').addEventListener('click', function() {
    var userInput = document.getElementById('user-input').value.trim();
    if (userInput !== '') {
        displayUserMessage(userInput);

        var targetLanguage = document.getElementById('target-language').value;

        sendToBackend(userInput, targetLanguage);

        document.getElementById('user-input').value = '';
    }
});

function displayUserMessage(message) {
    var chatMessages = document.getElementById('chat-messages');
    var userMessageElement = document.createElement('div');
    userMessageElement.className = 'user-message';
    userMessageElement.textContent = message;
    chatMessages.appendChild(userMessageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayBotMessage(message, sentiment, audioUrl) {
    var chatMessages = document.getElementById('chat-messages');
    var botMessageElement = document.createElement('div');
    botMessageElement.className = 'bot-message';
    
    var sentimentText = getSentimentText(sentiment);

    botMessageElement.innerHTML = `<p>${message}</p><small>Sentiment: ${sentimentText}</small>`;
    chatMessages.appendChild(botMessageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    var audioElement = new Audio(audioUrl);
    audioElement.play();
}

function getSentimentText(sentiment) {
    let sentimentCategory;
    if (sentiment.compound >= 0.05) {
        sentimentCategory = `<span class="positive">Positive</span>`;
    } else if (sentiment.compound <= -0.05) {
        sentimentCategory = `<span class="negative">Negative</span>`;
    } else {
        sentimentCategory = `<span class="neutral">Neutral</span>`;
    }
    
    return `Positive: ${sentiment.pos.toFixed(2)}, Neutral: ${sentiment.neu.toFixed(2)}, Negative: ${sentiment.neg.toFixed(2)}, Compound: ${sentiment.compound.toFixed(2)} (${sentimentCategory})`;
}

function sendToBackend(message, targetLanguage) {
    fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: message, target_language: targetLanguage })
    })
    .then(response => response.json())
    .then(data => {
        displayBotMessage(data.translated_text, data.sentiment, data.audio_url);
    })
    .catch(error => console.error('Error:', error));
}
