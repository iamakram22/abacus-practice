$(document).ready(function(){
    /**
     * DOM Elements
     */
    const disabledElement = $('.disabled-element');
    const numberContainer = $('#numbers');
    const entry = $('.entries');
    const yourAnswer = $('#yourAnswer');
    const messageContainer = $('#message');

    /**
     * Texts
     */
    const correct = 'Correct';
    const incorrect = 'Incorrect';

    /**
     * styling
     */
    const controls_height = $('#controls').outerHeight();
    $('#display').css('height', `calc(100svh - ${controls_height}px)`);
    const colors = ['#1a1a1a', '#ff5d52', '#fedc09', '#b1c642', '#68b9d8', '#023047', '#fb8500', '#e63946', '#588157', '#8338ec'];
    const colorsLength = colors.length;

    
    /**
     * Setting options
     */
    let settings = {
        numDigits : parseInt($('#digits').val()),
        numRows : parseInt($('#rows').val()),
        timeInterval : parseInt($('#time').val()),
        includeSubtractions : $('#subtractions').prop('checked'),
        speakNumbers : $('#speak').prop('checked')
    }
    $('#settings_save').click(function(){
        settings.numDigits = parseInt($('#digits').val());
        settings.numRows = parseInt($('#rows').val());
        settings.timeInterval = parseInt($('#time').val());
        settings.includeSubtractions = $('#subtractions').prop('checked');
        settings.speakNumbers = $('#speak').prop('checked');
    });

    /**
     * Validate settings
     */
    $('#setting_form').validate();

    /**
     * Disable settings save or close on invalid
     */
    $('#setting_form input').on('input',function() {             
        const isValid = $(this).valid();
        $('#settings_save, .btn-close').prop('disabled', !isValid);
    });

    /**
     * Game state management
     */
    let game = {
        currentIndex: 0,
        numbers: [],
        playnum: null,
        currentAnswer: 0,
        entryAdded: false
    };

    /**
     * Generates random numbers based on settings
     */
    function generateRandomNumbers() {
        game.numbers = Array.from({ length: settings.numRows }, () => {
            let number = '';
            for (let i = 0; i < settings.numDigits; i++) {
                number += Math.floor(Math.random() * 10);
            }
            return settings.includeSubtractions && Math.random() < 0.5 ? -parseInt(number) : parseInt(number);
        });
    }


    /**
     * Updates the current sum of numbers
     */
    function updateCurrentSum() {
        game.currentAnswer = game.numbers.reduce((acc, num) => acc + num, 0);
    }

    /**
     * Displays numbers
     */
    function displayNumbers() {
        beforeShowNumber();
        if (game.currentIndex < game.numbers.length) {
            numberContainer.fadeIn().text(game.numbers[game.currentIndex]);
            let i = Math.floor(Math.random() * colorsLength);
            numberContainer.css('color', colors[i]);
            if(settings.speakNumbers) {
                convertSpeech(game.numbers[game.currentIndex]);
            } else {
                game.currentIndex++;
            }
        } else {
            clearInterval(game.playnum);
            afterShowNumber();
        }
    }

    /**
     * Modifications before showing number
     */
    function beforeShowNumber() {
        disabledElement.prop('disabled', true);
        messageContainer.text('');
        numberContainer.hide();
    }

    /**
     * Modification after showing number
     */
    function afterShowNumber() {
        numberContainer.css('color', colors[0]);
        numberContainer.fadeIn().text('?');
        disabledElement.prop('disabled', false);
        yourAnswer.focus();
        
        // Check if the entry has already been added
        if (!game.entryAdded) {
            makeEntry(game.numbers);
        }
    }

    /**
     * Add numbers to the history panel
     * @param {Int} numbers 
     */
    function makeEntry(numbers) {
        const entryHtml = numbers.map((number, index) => {
            return number >= 0 ? (index === 0 ? number : ` + ${Math.abs(number)}`) : ` - ${Math.abs(number)}`;
        }).join('');
        entry.append(`${entryHtml}<br />`);
        game.entryAdded = true;
    }

    /**
     * Play the numbers
     */
    $('#play').click(function(){
        game.currentIndex = 0;
        generateRandomNumbers();
        updateCurrentSum();
        game.entryAdded = false;
        yourAnswer.val('');
        if(settings.speakNumbers) {
            displayNumbers();
        } else {
            game.playnum = setInterval(displayNumbers, settings.timeInterval);
        }
    });

    /**
     * Replay last numbers
     */
    $('#replay').click(function(){
        game.currentIndex = 0;
        yourAnswer.val('')
        if(settings.speakNumbers) {
            displayNumbers();
        } else {
            game.playnum = setInterval(displayNumbers, settings.timeInterval);
        }
    });

    /**
     * Perform Answer check
     */
    $('#check').click(function() {
        if (game.currentAnswer == yourAnswer.val()) {
            messageContainer.text(correct);
            if(settings.speakNumbers) convertSpeech(correct);
        } else {
            messageContainer.text(incorrect);
            if(settings.speakNumbers) convertSpeech(incorrect);
        }
    });

    /**
     * Change Speech voice
     */
    let voices = [];
    speechSynthesis.onvoiceschanged = function() {
        voices = speechSynthesis.getVoices();
    }

    /**
     * Convert text to speech
     * @param {str,int} toSpeak 
     */
    function convertSpeech(toSpeak) {
        const speakUtterance = new SpeechSynthesisUtterance();
        speakUtterance.voice = voices[2];
        speakUtterance.rate = 1.5;
        speakUtterance.pitch = 1;
        speakUtterance.lang = 'en-US'
        speakUtterance.text = toSpeak;
        if(settings.speakNumbers){
            speakUtterance.onend = function() {
                game.currentIndex++;
                if (game.currentIndex <= game.numbers.length) {
                    setTimeout(displayNumbers, settings.timeInterval);
                }
            }
        }
        speechSynthesis.speak(speakUtterance);
    }
    
});