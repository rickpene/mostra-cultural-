// Configurações do jogo
const WORD = 'vinho';
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

// Estado do jogo
let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let guesses = [];

// Elementos DOM
const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');

// Layout do teclado
const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

// Inicializar o jogo
function initGame() {
    createBoard();
    createKeyboard();
    restartBtn.style.display = 'none';
    restartBtn.addEventListener('click', () => {
        resetGame();
        gameBoard.style.display = 'flex';
        keyboard.style.display = 'block';
        restartBtn.style.display = 'none';
    });
    document.addEventListener('keydown', handleKeyPress);
}

// Criar o tabuleiro
function createBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.setAttribute('data-row', i);
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-row', i);
            tile.setAttribute('data-col', j);
            row.appendChild(tile);
        }
        
        gameBoard.appendChild(row);
    }
}

// Criar o teclado
function createKeyboard() {
    keyboard.innerHTML = '';
    keyboardLayout.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.classList.add('keyboard-row');
        
        row.forEach(key => {
            const keyButton = document.createElement('button');
            keyButton.classList.add('key');
            keyButton.textContent = key;
            keyButton.setAttribute('data-key', key);
            
            if (key === 'ENTER' || key === '⌫') {
                keyButton.classList.add('wide');
            }
            
            keyButton.addEventListener('click', () => handleKeyClick(key));
            keyboardRow.appendChild(keyButton);
        });
        
        keyboard.appendChild(keyboardRow);
    });
}

// Manipular clique de tecla
function handleKeyClick(key) {
    if (gameOver) return;
    
    if (key === 'ENTER') {
        submitGuess();
    } else if (key === '⌫') {
        deleteLetter();
    } else {
        addLetter(key);
    }
}

// Manipular pressionar tecla do teclado físico
function handleKeyPress(e) {
    if (gameOver) return;
    
    const key = e.key.toUpperCase();
    
    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (/^[A-Z]$/.test(key)) {
        addLetter(key);
    }
}

// Adicionar letra
function addLetter(letter) {
    if (currentTile < WORD_LENGTH) {
        const tile = document.querySelector(`[data-row="${currentRow}"][data-col="${currentTile}"]`);
        tile.textContent = letter;
        tile.classList.add('filled');
        currentTile++;
    }
}

// Deletar letra
function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.querySelector(`[data-row="${currentRow}"][data-col="${currentTile}"]`);
        tile.textContent = '';
        tile.classList.remove('filled');
    }
}

// Submeter tentativa
function submitGuess() {
    if (currentTile !== WORD_LENGTH) {
        showMessage('Palavra incompleta!', 'error');
        return;
    }
    
    // Obter a palavra digitada
    const guess = getCurrentGuess();
    guesses.push(guess);
    
    // Verificar a tentativa
    checkGuess(guess);
    
    // Verificar se ganhou
    if (guess === WORD) {
        gameOver = true;
        showMessage('Tudo pode ser usado para avançar entre as pistas; guarde-as, pois serão importantes.');
        gameBoard.style.display = 'none';
        keyboard.style.display = 'none';
        restartBtn.style.display = 'block';
        return;
    }
    
    // Avançar para a próxima linha
    currentRow++;
    currentTile = 0;
    
    // Verificar se perdeu
    if (currentRow === MAX_ATTEMPTS) {
        gameOver = true;
        showMessage(`Fim de jogo! A palavra era: ${WORD}`, 'error');
    }
}

// Obter a palavra atual
function getCurrentGuess() {
    let guess = '';
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
        guess += tile.textContent;
    }
    return guess;
}

// Verificar tentativa
function checkGuess(guess) {
    const letterCount = {};
    const guessArray = guess.split('');
    const wordArray = WORD.split('');
    const status = Array(WORD_LENGTH).fill('absent');
    
    // Contar letras na palavra correta
    for (let letter of wordArray) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
    
    // Primeira passagem: marcar letras corretas
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessArray[i] === wordArray[i]) {
            status[i] = 'correct';
            letterCount[guessArray[i]]--;
        }
    }
    
    // Segunda passagem: marcar letras presentes
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (status[i] !== 'correct' && letterCount[guessArray[i]] > 0) {
            status[i] = 'present';
            letterCount[guessArray[i]]--;
        }
    }
    
    // Aplicar estilos aos tiles
    for (let i = 0; i < WORD_LENGTH; i++) {
        const tile = document.querySelector(`[data-row="${currentRow}"][data-col="${i}"]`);
        
        setTimeout(() => {
            tile.classList.add(status[i]);
        }, i * 200);
        
        // Atualizar teclado
        updateKeyboard(guessArray[i], status[i]);
    }
}

// Atualizar teclado
function updateKeyboard(letter, status) {
    const key = document.querySelector(`[data-key="${letter}"]`);
    if (!key) return;
    
    const currentStatus = key.classList.contains('correct') ? 'correct' :
                         key.classList.contains('present') ? 'present' :
                         key.classList.contains('absent') ? 'absent' : '';
    
    // Só atualizar se o novo status for melhor
    if (status === 'correct' || 
        (status === 'present' && currentStatus !== 'correct') ||
        (status === 'absent' && !currentStatus)) {
        key.classList.remove('correct', 'present', 'absent');
        key.classList.add(status);
    }
}

// Mostrar mensagem
function showMessage(text, type = '') {
    message.textContent = text;
    message.className = 'message';
    if (type) {
        message.classList.add(type);
    }
    
    if (type === 'error') {
        setTimeout(() => {
            message.textContent = '';
        }, 2000);
    }
}

// Resetar jogo
function resetGame() {
    currentRow = 0;
    currentTile = 0;
    gameOver = false;
    guesses = [];
    message.textContent = '';
    
    // Limpar tabuleiro
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.className = 'tile';
    });
    
    // Limpar teclado
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
}

// Iniciar o jogo quando a página carregar
initGame();

