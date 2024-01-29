/**
 * Setting options
 */
let numDigits = parseInt($('#digits').val());
let numRows = parseInt($('#rows').val());
let timeInterval = parseInt($('#time').val());
let includeSubtractions = $('#subtractions').prop('checked');
$('#settings_save').click(function(){
    numDigits = parseInt($('#digits').val());
    numRows = parseInt($('#rows').val());
    timeInterval = parseInt($('#time').val());
    includeSubtractions = $('#subtractions').prop('checked');
});

/**
 * DOM
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
let controls_height = $('#controls').outerHeight();
let main_height = 'calc(100svh - ' + controls_height + 'px)';
$(document).ready(function(){
    $('#display').css({
        'height' : main_height
    });
});

/**
 * Game state management
 */
let game = {
    currentIndex: 0,
    numbers: [],
    playnum: null,
    currentSum: 0,
    entryAdded: false
};

/**
 * Generates random numbers based on settings
 */
function generateRandomNumbers() {
    game.numbers = [];
    for (let i = 0; i < numRows; i++) {
        let number = '';
        for (let j = 0; j < numDigits; j++) {
            // Generate a random digit
            number += Math.floor(Math.random() * 10);
        }
        // Include subtractions if checked
        number = includeSubtractions && Math.random() < 0.5 ? -parseInt(number) : parseInt(number);

        game.numbers.push(number);
    }
}


/**
 * Updates the current sum of numbers
 */
function updateCurrentSum() {
    game.currentSum = game.numbers.reduce((acc, num) => acc + num, 0);
}

/**
 * Displays numbers
 */
function displayNumbers() {
    disabledElement.prop('disabled', true);
    messageContainer.text('');
    numberContainer.hide();
    if (game.currentIndex < game.numbers.length) {
        numberContainer.fadeIn().text(game.numbers[game.currentIndex]);
        speak(game.numbers[game.currentIndex]);
        game.currentIndex++;
    } else {
        numberContainer.fadeIn().text('?');
        clearInterval(game.playnum);
        disabledElement.prop('disabled', false);
        yourAnswer.focus();
        
        // Check if the entry has already been added
        if (!game.entryAdded) {
            makeEntry(game.numbers);
            game.entryAdded = true;
        }
    }
}

/**
 * Creates a visual entry of numbers in the UI
 */
function makeEntry(numbers) {
    numbers.forEach(function(number, index) {
        if (index === 0) {
            entry.append(number >= 0 ? number : ' - ' + Math.abs(number));
        } else {
            entry.append(number >= 0 ? ' + ' + number : ' - ' + Math.abs(number));
        }
    });

    entry.append('<br />');
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
    game.playnum = setInterval(displayNumbers, timeInterval);
});

/**
 * Replay last numbers
 */
$('#replay').click(function(){
    game.currentIndex = 0;
    updateCurrentSum();
    yourAnswer.val('')
    game.playnum = setInterval(displayNumbers, timeInterval);
});

/**
 * Perform Answer check
 */
$('#check').click(function() {
    let yourAns = $('#yourAnswer').val();
    if (game.currentSum == yourAns) {
        messageContainer.text(correct);
        speak(correct);
    } else {
        messageContainer.text(incorrect);
        speak(incorrect);
    }
});

/**
 * Validate settings
 */
$('#setting_form').validate();

/**
 * Disable settings save or close on invalid
 */
$('#setting_form input').keyup(function() {
    let invalid = $('#setting_form input.error');
    
    if(invalid.length > 0){
        $('#settings_save').prop('disabled', true);
        $('.btn-close').prop('disabled', true);
    } else {
        $('#settings_save').prop('disabled', false);
        $('.btn-close').prop('disabled', false);
    }
});

/**
 * Convert text to speech
 * @param {str,int} toSpeak 
 */
function speak(toSpeak) {
    const speakUtterance = new SpeechSynthesisUtterance();
    const voices = speechSynthesis.getVoices();
    speakUtterance.voice = voices[2];
    speakUtterance.rate = 1.5;
    speakUtterance.pitch = 1;

    console.log(voices);
    speakUtterance.text = toSpeak;
    speechSynthesis.speak(speakUtterance);
}