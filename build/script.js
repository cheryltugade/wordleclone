import { THREE_LTR_WORDS, 
    FOUR_LTR_WORDS,
    FIVE_LTR_WORDS,
    SIX_LTR_WORDS,
    SEVEN_LTR_WORDS,
    EIGHT_LTR_WORDS, 
    ORRIN_WORDS
} from "./words.js";

const wordsMap = {
    3: THREE_LTR_WORDS,
    4: FOUR_LTR_WORDS,
    5: FIVE_LTR_WORDS,
    6: SIX_LTR_WORDS,
    7: SEVEN_LTR_WORDS,
    8: EIGHT_LTR_WORDS
};

const GUTTER_MODE = true;
const NUMBER_OF_GUESSES = 10;
const NUMBER_OF_LTRS = 4;
const WORDS  = wordsMap[NUMBER_OF_LTRS];

let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
console.log(rightGuessString)

// Variables for gutter mode
let greenIndices = [];
let yellowBoxMap = new Map();
let greyLetters = [];

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < NUMBER_OF_LTRS; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

initBoard()

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

function insertLetter (pressedKey) {
    if (nextLetter === NUMBER_OF_LTRS) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != NUMBER_OF_LTRS) {
        toastr.error("Not enough letters!")
        return
    }

    if (NUMBER_OF_LTRS === 5 ) {
        if (!WORDS.includes(guessString)) {
            toastr.error("Word not in list!")
            return
        }
    }

    if (GUTTER_MODE) {
        let notUsingGreen = false;
        let placingYellowAgain = false;
        let notUsingYellow = false;
        let usingGreyLetters = false;
        let letterReuseInFirstGuess = false;

        // Guessing a different letter in a location that is already green
        greenIndices.forEach((greenIndex) => {
            if (currentGuess[greenIndex] !== rightGuess[greenIndex]) {
                notUsingGreen = true;
            }
        });

        // Reusing a letter that was already yellow in that same location
        // Not using a letter that is yellow at all
        yellowBoxMap.forEach((letter, index) => {
            if (currentGuess[index] == letter) {
                placingYellowAgain = true;
            }
            if (!currentGuess.includes(letter)) {
                notUsingYellow = true;
            }
        })

        // Reusing a letter that is grey
        let letterSet = new Set();
        currentGuess.forEach((letter) => {
            if (greyLetters.includes(letter)) {
                usingGreyLetters = true;
            }
            letterSet.add(letter)
        });

        // Using a letter more than once in first guess
        if (guessesRemaining == NUMBER_OF_GUESSES && letterSet.size < NUMBER_OF_LTRS) {
            letterReuseInFirstGuess = true;
        }

        if (notUsingGreen) {
            toastr.error("Gutter: Not using a green letter/s!")
            return
        } else if (placingYellowAgain){
            toastr.error("Gutter: Placing a letter that was yellow in same box again!")
            return
        } else if (notUsingYellow) {
            toastr.error("Gutter: Not using a letter that was yellow!")
            return
        } else if (usingGreyLetters) {
            toastr.error("Gutter: Using a letter/s that is grey!")
            return
        } else if (letterReuseInFirstGuess) {
            toastr.error("Gutter: Using a letter/s more than once in first guess!")
            return
        }
    }
    
    for (let i = 0; i < NUMBER_OF_LTRS; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey'
            greyLetters.push(currentGuess[i])
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = 'green'
                greenIndices.push(i);
            } else {
                // shade box yellow
                letterColor = 'yellow'
                yellowBoxMap.set(i, currentGuess[i])
            }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i
        setTimeout(()=> {
        //flip box
        animateCSS(box, 'flipInX')
        //shade box
        box.style.backgroundColor = letterColor
        shadeKeyBoard(letter, letterColor)
    }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Game over!")
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: "${rightGuessString}"`)
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.8s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});