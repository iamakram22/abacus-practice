$(document).ready(function(){
    /**
     * DOM Elements
     */
    const disabledElement = $('.disabled-element');
    const numberContainer = $('#numbers');
    const entry = $('.entries');
    const yourAnswer = $('#yourAnswer');
    const messageContainer = $('#message');
    const settingCompliment = $('#compliments');
    const settingRows = $('#rows');

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
     * Direct sum combinations
     */
    const directSums = [
        [2, 2, 5], [1, 1, 2, 5], [1, 3, 5], [1, 1, 2], [5, 4], [6, 1, 2], [6, 1, 1, 1], [7, 2], [7, 1, 1],
        [8, 1], [1, 1, 1, 1, 5], [2, 1, 5], [1, 1, 1, 5], [6, 2], [6, 1, 1], [2, 2], [6, 1, 2], [3, 5], [2, 5],
        [1, 1, 5], [6, 1], [1, 5], [5, 1], [1, 1, 1, 1], [1, 2, 1], [2, 2], [3, 1], [1, 1, 1], [2, 1], [1, 1]
    ]
    let directSumComb = directSums;
    
    /**
     * Setting options
     */
    let settings = {
        compliments : $('#compliments').val(),
        numDigits : parseInt($('#digits').val()),
        numRows : parseInt($('#rows').val()),
        timeInterval : parseInt($('#time').val()),
        includeSubtractions : $('#subtractions').prop('checked'),
        speakNumbers : $('#speak').prop('checked')
    }

    /**
     * Random number options
     */
    let numOptions = {
        start: 1,
        end: 5,
        maxSum: 9,
        minSum: 0,
    }
    
    // Update the number options
    updateRandomNumberOption();

    /**
     * Update settings on save
     */
    $('#settings_save').click(function(){
        settings.numDigits = parseInt($('#digits').val());
        settings.numRows = parseInt($('#rows').val());
        settings.timeInterval = parseInt($('#time').val());
        settings.includeSubtractions = $('#subtractions').prop('checked');
        settings.speakNumbers = $('#speak').prop('checked');
        settings.compliments = $('#compliments').val();

        // Update direct sum values
        if(settings.compliments === 'direct') {
            directSumComb = modifyDirectSumCombDigits(directSumComb);
        }

        updateRandomNumberOption();
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
     * Disable Digits field for direct sum
     */
    settingCompliment.on('change', function() {
        if($(this).val() === 'direct') {
            settingRows.parent().hide();
        } else {
            settingRows.parent().show();
        }
    })
    /**
     * Generate random number
     * @param {Int} num 
     * @returns int
     */
    function mathRandom(end, start = null) {
        return start ? Math.floor(Math.random() * (end - start) + start) : Math.floor(Math.random() * end);
    }

    /**
     * Modify the directSumComb digits matching setting.numDigits
     * @param {Object} directSumComb  
     * @returns Object
     */
    function modifyDirectSumCombDigits(directSumComb) {
        directSumComb = directSums; // First reset to default
        
        const modifiedDirectSumComb = [];

        for (const combination of directSumComb) {
            const modifiedCombination = combination.map(num => {
                const newNum = parseInt(num.toString().repeat(settings.numDigits));
                return newNum;
            });
            modifiedDirectSumComb.push(modifiedCombination);
        }
        
        return modifiedDirectSumComb;
    }

    /**
     * Fetch random array for direct sum
     * @param {Object} object 
     * @returns array
     */
    function fetchDirectSum(object) {
        let randomIndex = mathRandom(object.length);
        return object[randomIndex];
    }

    /**
     * Make selected directSum values negative
     * @param {Array} directSum 
     * @returns Array
     */
    function makeDirectSumNegative(directSum) {
        let negativeNums = [];
        negativeNums[0] = directSum[0]; // Skip first num, require to calculate the sum later
        for (let i = 1; i < directSum.length; i++) {
            if(directSum[i] === 5) continue; // Skip 5 to avoid 5 compliments
            negativeNums[i] = -directSum[i];
            let currentSum = negativeNums.reduce((acc, curr) => acc + curr, 0);
            if (currentSum >= 0) {
                directSum[i] = negativeNums[i];
            }
        }
        return directSum;
    }

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
        /**
         * Get predefined direct sums
         */
        if(settings.compliments === 'direct') {
            const currentDirectSum = fetchDirectSum(directSumComb);
            game.numbers = !settings.includeSubtractions ? currentDirectSum : makeDirectSumNegative(currentDirectSum);
            return game.numbers;
        }
        /**
         * Generate random numbers for others
         */
        game.numbers = Array.from({ length: settings.numRows }, (_, index) => {
            const generateNumber = () => {
                return mathRandom(numOptions.end, numOptions.start);
            };
    
            const randomNumber = settings.includeSubtractions && Math.random() < 0.5 && index > 0 ? -generateNumber() : generateNumber();
    
            return randomNumber;
        });

        let checkNums = [];
        for (let i = 0; i < game.numbers.length; i++) {
            checkNums[i] = game.numbers[i];
            let currentSum = checkNums.reduce((acc, curr) => acc + curr, 0);
            if (currentSum < 0 && checkNums[i] < 0) {
                game.numbers[i] = Math.abs(game.numbers[i]);
            }
        }
    }

    /**
     * Updates the current sum of numbers
     */
    function updateCurrentSum() {
        game.currentAnswer = game.numbers.reduce((acc, num) => acc + num, 0);

        const complimentsType = settings.compliments;

        if(complimentsType === 'direct') return;

        // Modify the number according to compliments logic
        if (complimentsType === '5_comp' && (game.currentAnswer > numOptions.maxSum || game.currentAnswer < numOptions.minSum)) {
            game.numbers = game.numbers.map(e => mathRandom(numOptions.end, numOptions.start));
            updateCurrentSum();
        } else if (game.currentAnswer < 0) {
            game.numbers = game.numbers.map((e, i) => Math.random() < 0.5 && i > 0 ? -e : e);
            updateCurrentSum();
        }

        // Check if includeSubtractions is true and ensure at least one digit is negative
        const hasNegative = game.numbers.some(num => num < 0);
        if (settings.includeSubtractions && !hasNegative) {
            const smallestNumber = game.numbers.reduce((prev, num) => Math.min(prev, num));
            if (smallestNumber >= 0) {
                let index = game.numbers.indexOf(smallestNumber);
                index = index === 0 ? index + 1 : index;
                game.numbers[index] = -smallestNumber;
                game.currentAnswer = game.numbers.reduce((acc, num) => acc + num, 0);
            }
        }
    }

    /**
     * Update random number logic
     */
    function updateRandomNumberOption() {
        const complimentsType = settings.compliments;
        const digits = settings.numDigits;
        const value = (10 ** digits) / 10; // Multiplier value for the mathRandom
        numOptions.start = value; // Set start to 1
        
        if (complimentsType === '5_comp') {
            numOptions.end = 5 * value; // End to 5
            numOptions.minSum = 5; // Min sum to 5
            numOptions.maxSum = 10 * value - 1; // Max sum to 9
        } else {
            numOptions.end = 10 * value; // End to 10
            numOptions.minSum = null; // No min sum limit
            numOptions.maxSum = null; // No max sum limit
        }
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
     * Get Speech voice
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