// Mostrar el menú después de 8 segundos
setTimeout(() => {
    document.getElementById('intro-screen').style.display = 'none'; 
    document.getElementById('menu-screen').style.display = 'block'; 
}, 8000);
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameCtx; 
let score = 0; 
gameCtx = gameStageCanvas.getContext('2d');

// Configuración del canvas
canvas.width = 800;
canvas.height = 800;
const soundIconSize = 50;
let mouseX = 0, mouseY = 0;
// Limpiar el localStorage al cargar la página 
window.addEventListener('load', () => {
    localStorage.removeItem('highScores'); // Eliminar los High Scores almacenados
    loadHighScores(); 
});
// Obtener elementos del DOM
const instructionsScreen = document.getElementById('instructions-screen');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const menuScreen = document.getElementById('menu-screen');


// Variables del menú
let musicEnabled = true; 
let selectedShip = 1; 
let animationFrameId; // Variable global para almacenar el ID del bucle
// Variables para controlar el estado del stage
let gameState = 'preStage'; 
let stageTimer = 3; 
let stageCountdown; 
// Cargar imágenes de los íconos y naves
const soundOnIcon = new Image();
const soundOffIcon = new Image();
const ship1 = new Image();
const ship2 = new Image();
const ship3 = new Image();
const menuBackground = new Image();
// Inicializar el array de High Scores
let highScores = [];
// Función para cargar los High Scores desde localStorage
function loadHighScores() {
    const savedScores = localStorage.getItem('highScores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    } else {
        highScores = [
            { name: 'AAA', score: 0 },
            { name: 'AAA', score: 0 },
            { name: 'AAA', score: 0 },
            { name: 'AAA', score: 0 },
            { name: 'AAA', score: 0 }
        ];
    }
}
// Reproductor de música de fondo
const backgroundMusic = new Audio('/sounds/gameMusic.mp3');
backgroundMusic.loop = true; 
// Sonidos del juego
const shootSound = new Audio('/sounds/shoot.mp3'); 
const explosionSound = new Audio('/sounds/hit.mp3'); 
const explosionShipSound = new Audio('/sounds/enemyShoot.mp3'); 
const extraLifeSound = new Audio('/sounds/extraLife.mp3');
const stageStartSound = new Audio('/sounds/nextLevel.mp3');
const gameOverSound = new Audio('/sounds/gameOver.mp3');
// Sonido para la victoria
const victorySound = new Audio('/sounds/gameWin.mp3');
// Función para cargar todas las imágenes
function loadImages(callback) {
    let loaded = 0;
    const total = 6; 

    function checkLoaded() {
        loaded++;
        if (loaded === total) callback(); // Llamar al callback cuando todas las imágenes estén cargadas
    }

    // Asignar las rutas de las imágenes
    soundOnIcon.onload = checkLoaded;
    soundOffIcon.onload = checkLoaded;
    ship1.onload = checkLoaded;
    ship2.onload = checkLoaded;
    ship3.onload = checkLoaded;
    menuBackground.onload = checkLoaded;

    soundOnIcon.src = '/images/volume.png';
    soundOffIcon.src = '/images/volume-off.png';
    ship1.src = '/images/ship1.png';
    ship2.src = '/images/ship2.png';
    ship3.src = '/images/ship3.png';
    menuBackground.src = '/images/imagenFondo.jpg';
}
loadImages(() => {
    console.log('Todas las imágenes han sido cargadas');
    loadHighScores(); 
    setTimeout(() => {
        document.getElementById('intro-screen').style.display = 'none'; 
        document.getElementById('menu-screen').style.display = 'block'; 
        backgroundMusic.play(); 
        drawMenu(); 
    }, 8000);
});
// Función para cargar imágenes del juego
function loadGameImages(callback) {
    let loaded = 0;
    const total = 5; 
    function checkLoaded() {
        loaded++;
        if (loaded === total) callback(); // Llamar al callback cuando todas las imágenes estén cargadas
    }
    // Imagen de fondo del juego
    const gameBackground = new Image();
    gameBackground.onload = checkLoaded;
    gameBackground.src = '/images/stage1.png';

    // Nave del jugador
    const playerImage = new Image();
    playerImage.onload = checkLoaded;
    if (selectedShip === 1) playerImage.src = '/images/ship1.png';
    if (selectedShip === 2) playerImage.src = '/images/ship2.png';
    if (selectedShip === 3) playerImage.src = '/images/ship3.png';
    
    // Naves enemigas
    const enemy1 = new Image();
    const enemy2 = new Image();
    const enemy3 = new Image();
    const explosionImage = new Image();
    enemy1.onload = checkLoaded;
    enemy2.onload = checkLoaded;
    enemy3.onload = checkLoaded;
    enemy1.src = '/images/enemy1_ship1.png';
    enemy2.src = '/images/enemy2_ship1.png';
    enemy3.src = '/images/enemy3_ship1.png';
    explosionImage.src = 'images/estallidoNaveUsuario.png';

    return { gameBackground, playerImage, enemy1, enemy2, enemy3, explosionImage };
}
// Dibujar el menú
function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.8; 
    ctx.drawImage(menuBackground, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    // Fondo semi-transparente
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(50, 280, 700, 440);

    // Configuración del texto
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle'; 
    ctx.fillStyle = 'white';
    ctx.font = '20px "Silkscreen"';

    // Texto "Sonido"
    ctx.fillText('Activar Sonido', canvas.width / 2, 300);

    // Ícono de sonido (único)
    const soundIconX = canvas.width / 2 - soundIconSize/2;
    const soundIconY = 350;
    ctx.drawImage(
        musicEnabled ? soundOnIcon : soundOffIcon,
        soundIconX, soundIconY,
        soundIconSize, soundIconSize
    );
    // Hover effect
    if (mouseX > soundIconX && 
        mouseX < soundIconX + soundIconSize &&
        mouseY > soundIconY &&
        mouseY < soundIconY + soundIconSize) {
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(soundIconX, soundIconY, soundIconSize, soundIconSize);
    }

    // Texto "Selecciona tu nave"
    ctx.fillText('Selecciona tu nave', canvas.width / 2, 450);

    // Naves
    ctx.drawImage(ship1, canvas.width / 2 - 150, 500, 100, 100);
    ctx.drawImage(ship2, canvas.width / 2 - 50, 500, 100, 100);
    ctx.drawImage(ship3, canvas.width / 2 + 50, 500, 100, 100);

    // Borde rojo para la nave seleccionada
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    if (selectedShip === 1) ctx.strokeRect(canvas.width / 2 - 150, 500, 100, 100);
    if (selectedShip === 2) ctx.strokeRect(canvas.width / 2 - 50, 500, 100, 100);
    if (selectedShip === 3) ctx.strokeRect(canvas.width / 2 + 50, 500, 100, 100);

    // Variables de los botones
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonSpacing = 30; 
    const totalWidth = 2 * buttonWidth + buttonSpacing; 

    // Calcular la posición X para centrar los botones
    const centerX = (canvas.width - totalWidth) / 2; 
    const centerY = 650; 

    //Botón "Instrucciones"
    const buttonX1 = centerX;
    const borderRadius = 15; 
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 4;  
    ctx.strokeStyle = 'rgba(57, 255, 20, 1)';  
    ctx.lineJoin = 'round';  
    // Dibuja el botón de Instrucciones con esquinas redondeadas
    ctx.beginPath();
    ctx.moveTo(buttonX1 + borderRadius, centerY); // Esquina superior izquierda
    ctx.arcTo(buttonX1 + buttonWidth, centerY, buttonX1 + buttonWidth, centerY + buttonHeight, borderRadius); // Esquina superior derecha
    ctx.arcTo(buttonX1 + buttonWidth, centerY + buttonHeight, buttonX1, centerY + buttonHeight, borderRadius); // Esquina inferior derecha
    ctx.arcTo(buttonX1, centerY + buttonHeight, buttonX1, centerY, borderRadius); // Esquina inferior izquierda
    ctx.arcTo(buttonX1, centerY, buttonX1 + buttonWidth, centerY, borderRadius); // Esquina superior izquierda
    ctx.closePath();
    ctx.fill(); 
    ctx.stroke(); 
    ctx.fillStyle = 'black';
    ctx.fillText('Instrucciones', buttonX1 + buttonWidth / 2, centerY + buttonHeight / 2.5 + 5); 

    // Botón "Iniciar Juego"
    const buttonX2 = buttonX1 + buttonWidth + buttonSpacing;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';  
    ctx.lineWidth = 4;  
    ctx.strokeStyle = 'rgba(255, 0, 0, 1)';  
    ctx.lineJoin = 'round';  
    // Dibuja el botón con esquinas redondeadas
    ctx.beginPath();
    ctx.moveTo(buttonX2 + borderRadius, centerY); // Esquina superior izquierda
    ctx.arcTo(buttonX2 + buttonWidth, centerY, buttonX2 + buttonWidth, centerY + buttonHeight, borderRadius); // Esquina superior derecha
    ctx.arcTo(buttonX2 + buttonWidth, centerY + buttonHeight, buttonX2, centerY + buttonHeight, borderRadius); // Esquina inferior derecha
    ctx.arcTo(buttonX2, centerY + buttonHeight, buttonX2, centerY, borderRadius); // Esquina inferior izquierda
    ctx.arcTo(buttonX2, centerY, buttonX2 + buttonWidth, centerY, borderRadius); // Esquina superior izquierda
    ctx.closePath();
    ctx.fill(); 
    ctx.stroke(); 

    // Texto blanco en el centro
    ctx.fillStyle = 'white';  
    ctx.fillText('Iniciar Juego', buttonX2 + buttonWidth / 2, centerY + buttonHeight / 2.5 + 5); 

    // Devolver las coordenadas para el manejo de clics
    return { buttonX1, buttonX2, centerY, buttonWidth, buttonHeight, soundIconX, soundIconY };
}
// Actualizar posición del mouse
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    drawMenu(); 
});
// Evento de clic en el canvas
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Obtener las coordenadas de los botones
    const { buttonX1, buttonX2, centerY, buttonWidth, buttonHeight } = drawMenu();

    // Detectar clic en el ícono de sonido
    const soundIconX = canvas.width / 2 - soundIconSize/2;
    const soundIconY = 350;
    
    if (x > soundIconX && 
        x < soundIconX + soundIconSize &&
        y > soundIconY &&
        y < soundIconY + soundIconSize) {
        
        musicEnabled = !musicEnabled;
        if (musicEnabled) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
        playSound('/sounds/buttonPress.mp3');
    }

    // Detectar clic en las naves
    if (x > canvas.width / 2 - 150 && x < canvas.width / 2 - 50 && y > 500 && y < 600) {
        selectedShip = 1; 
        playSound('/sounds/buttonPress.mp3'); 
    } else if (x > canvas.width / 2 - 50 && x < canvas.width / 2 + 50 && y > 500 && y < 600) {
        selectedShip = 2; 
        playSound('/sounds/buttonPress.mp3'); 
    } else if (x > canvas.width / 2 + 50 && x < canvas.width / 2 + 150 && y > 500 && y < 600) {
        selectedShip = 3; 
        playSound('/sounds/buttonPress.mp3'); 
    }
    // Detectar clic en el botón "Instrucciones"
    if (x > buttonX1 && x < buttonX1 + buttonWidth && y > centerY && y < centerY + buttonHeight) {
        showInstructions(); 
        playSound('/sounds/buttonPress.mp3'); 
    }
    // Detectar clic en el botón "Iniciar Juego"
    if (x > buttonX2 && x < buttonX2 + buttonWidth && y > centerY && y < centerY + buttonHeight) {
        startGame(); 
        playSound('/sounds/buttonPress.mp3'); 
    }
    // Redibujar el menú después de cualquier cambio
    drawMenu();
});

// Variable para controlar la explosión
let isExploding = false;
let explosionTimeout;
let invincible = false; 
let invincibleTimeout;
// Variable para rastrear el último puntaje en el que se otorgó una vida extra
let lastExtraLifeScore = 0;
// Función para reproducir sonidos
function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play();
}
// Función para mostrar las instrucciones
function showInstructions() {
    // Mostrar la pantalla de instrucciones
    instructionsScreen.style.display = 'block'; 
    menuScreen.style.display = 'none'; 
    // Volver al menú principal desde la pantalla de instrucciones
    backToMenuBtn.addEventListener('click', () => {
    instructionsScreen.style.display = 'none'; 
    menuScreen.style.display = 'block'; 
});


}
// Función para iniciar el juego
function startGame() {
    console.log(`Juego iniciado con nave ${selectedShip}`);
    document.getElementById('menu-screen').style.display = 'none'; 
    document.getElementById('game-screen').style.display = 'block'; 
    initializeGameStage(); 
    // Cargar los High Scores al iniciar el juego
    loadHighScores();
}
// Función para inicializar la primera etapa del juego
function initializeGameStage() {
    const gameStageCanvas = document.getElementById('gameStageCanvas');
    const gameCtx = gameStageCanvas.getContext('2d');

    // Configuración del canvas del juego
    gameStageCanvas.width = 800;
    gameStageCanvas.height = 800;
    // Reiniciar la puntuación al iniciar el juego
    score = 0;
    let currentStage = 1; 
    // Variables del juego
    let bullets = [];
    let enemies = [];
    let lives = 3; 
    let keys = {};
    let enemyBullets = []; 
    const maxEnemyBullets = 10 + currentStage * 2; // Aumentar el límite con el nivel
    // Dimensiones de la nave del jugador
    const playerWidth = 60; 
    const playerHeight = 80; 
    // Dimensiones de las naves enemigas
    const enemyWidth = 40; 
    const enemyHeight = 60; 
    // Cargar imágenes del juego
    const { gameBackground, playerImage, enemy1, enemy2, enemy3, explosionImage } = loadGameImages(() => {
        console.log('Imágenes del juego cargadas');

        // Variables del jugador
        const player = {
            x: 375,
            y: 700,
            width: playerWidth,
            height: playerHeight,
            speed: 5
        };
        // Función para dibujar las vidas
        function drawLives() {
            gameCtx.fillStyle = 'white';
            gameCtx.font = '20px "Silkscreen"';
            gameCtx.textAlign = 'left';
            gameCtx.fillText('Vidas:', 10, 30);

            // Dibujar las naves que representan las vidas
            const lifeWidth = 40; 
            const lifeHeight = 60; 
            for (let i = 0; i < lives - 1; i++) {
                gameCtx.drawImage(playerImage, 100 + i * 40, 10, lifeWidth, lifeHeight);
            }
        }
         // Función para dibujar el indicador de Stage
        function drawStage() {
            gameCtx.fillStyle = 'white';
            gameCtx.font = '20px "Silkscreen"';
            gameCtx.textAlign = 'center';
            gameCtx.fillText(`Stage: ${currentStage}`, gameStageCanvas.width / 2, 30);
        }
        
        console.log('Iniciando gameLoop...');
        // Función principal del juego
        function gameLoop() {
            animationFrameId = requestAnimationFrame(gameLoop); // Actualizar el ID del bucle
            gameCtx.clearRect(0, 0, gameStageCanvas.width, gameStageCanvas.height);

            // Dibujar el fondo del juego
            gameCtx.drawImage(gameBackground, 0, 0, gameStageCanvas.width, gameStageCanvas.height);

            if (gameState === 'preStage') {
                // Mostrar pantalla de inicio de stage
                gameCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                gameCtx.fillRect(0, 0, canvas.width, canvas.height);
                
                gameCtx.fillStyle = '#00ff00'; 
                gameCtx.font = '80px "Silkscreen"';
                gameCtx.textAlign = 'center';
                gameCtx.fillText(`STAGE ${currentStage}`, canvas.width/2, canvas.height/2 - 50);
                
                gameCtx.font = '40px "Silkscreen"';
                gameCtx.fillText(`STARTING IN ${stageTimer}`, canvas.width/2, canvas.height/2 + 50);
                
                // Iniciar cuenta regresiva
                if (!stageCountdown) {
                    stageCountdown = setInterval(() => {
                        stageTimer--;
                        if (stageTimer <= 0) {
                            clearInterval(stageCountdown);
                            stageCountdown = null; 
                            gameState = 'playing';
                        }
                    }, 1000);
                }
                
            } else if (gameState === 'playing')
            // Actualizar y dibujar elementos
            updatePlayer();
            drawPlayer();
            shootBullet();
            updateBullets();
            drawBullets();
            updateEnemies();
            drawEnemies();
            shootEnemyBullets(); 
            updateEnemyBullets();
            drawEnemyBullets();
            checkCollisions();

            // Verificar si el jugador alcanza un múltiplo de 5000 puntos
            if (score >= lastExtraLifeScore + 5000) {
                lives++; 
                lastExtraLifeScore += 5000; 
                extraLifeSound.play(); 
                console.log('¡Has ganado una vida extra!');
            }
            // Mostrar puntuación
            gameCtx.fillStyle = 'white';
            gameCtx.font = '20px "Silkscreen"';
            gameCtx.fillText(`Score: ${score}`, 650, 30);
            drawLives(); 
            drawStage(); 
            
            // Verificar si el jugador ha perdido todas las vidas
            if (lives <= 0) {
                gameOver(); 
                return; // Detener el bucle
            }

            // Verificar si el jugador ha completado todos los niveles
            if (currentStage > 5) {
                showVictoryScreen(); 
                return; // Detener el bucle
            }
            
        }

        // Eventos de teclado
        window.addEventListener('keydown', (e) => keys[e.key] = true);
        window.addEventListener('keyup', (e) => keys[e.key] = false);

        // Función para dibujar la nave del jugador
        function drawPlayer() {
            if (isExploding) {
                gameCtx.drawImage(explosionImage, player.x, player.y, player.width, player.height);
            } else {
                gameCtx.drawImage(playerImage, player.x, player.y, player.width, player.height);
            }
        }

        // Función para mover la nave del jugador
        function updatePlayer() {
            if (gameState !== 'playing') return; 
            if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
            if (keys['ArrowRight'] && player.x < gameStageCanvas.width - player.width) player.x += player.speed;
        }

        // Función para disparar
        function shootBullet() {
            if (gameState !== 'playing') return; 
            if (keys[' ']) {
                bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, speed: 7 });
                shootSound.play(); 
                keys[' '] = false;
            }
        }

        // Función para actualizar los disparos
        function updateBullets() {
            bullets.forEach((bullet, index) => {
                bullet.y -= bullet.speed;
                if (bullet.y < 0) bullets.splice(index, 1);
            });
        }

        // Función para dibujar los disparos
        function drawBullets() {
            gameCtx.fillStyle = 'yellow';
            bullets.forEach(bullet => gameCtx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height));
        }

        // Función para generar enemigos
        function spawnEnemies() {
            enemies = []; 
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 3; j++) {
                    const enemyType = Math.floor(Math.random() * 3) + 1; // Elegir un tipo de enemigo aleatorio
                    enemies.push({
                        x: 100 + i * 60,
                        y: 50 + j * 40,
                        width: enemyWidth,
                        height: enemyHeight,
                        speed: 2 + currentStage, // Aumentar la velocidad de los enemigos con el nivel
                        type: enemyType,
                        canShoot: true // Permitir que la nave pueda disparar inicialmente
                    });
                }
            }
        }
        
        // Función para dibujar los enemigos
        function drawEnemies() {
            enemies.forEach(enemy => {
                if (enemy.type === 1) gameCtx.drawImage(enemy1, enemy.x, enemy.y, enemy.width, enemy.height);
                if (enemy.type === 2) gameCtx.drawImage(enemy2, enemy.x, enemy.y, enemy.width, enemy.height);
                if (enemy.type === 3) gameCtx.drawImage(enemy3, enemy.x, enemy.y, enemy.width, enemy.height);
            });
        }

        // Función para actualizar los enemigos
        function updateEnemies() {
            enemies.forEach(enemy => {
                enemy.x += enemy.speed;
                if (enemy.x <= 0 || enemy.x >= gameStageCanvas.width - enemy.width) enemy.speed *= -1;
            });
        }
        // Función para que las naves enemigas disparen
        function shootEnemyBullets() {
            if (gameState !== 'playing') return; // Evitar disparos en pre-stage
            const probability = 0.01 + (currentStage - 1) * 0.005; // Aumentar la probabilidad con el nivel
            if (enemyBullets.length >= maxEnemyBullets) return; // No permitir más balas si se alcanza el límite
            enemies.forEach(enemy => {
                if (Math.random() < probability) { // Probabilidad ajustada
                    enemyBullets.push({
                        x: enemy.x + enemy.width / 2 - 2.5,
                        y: enemy.y + enemy.height,
                        width: 5,
                        height: 10,
                        speed: 5 + currentStage // Aumentar la velocidad de las balas con el nivel
                    });

                    // Desactivar la capacidad de disparo temporalmente
                    enemy.canShoot = false;
                    setTimeout(() => {
                        enemy.canShoot = true; // Restaurar la capacidad de disparo después de un tiempo
                    }, 1000); // Tiempo de espera antes de permitir otro disparo (1 segundo)
                }
            });
        }

        // Función para actualizar las balas enemigas
        function updateEnemyBullets() {
            enemyBullets.forEach((bullet, index) => {
                bullet.y += bullet.speed;
                if (bullet.y > gameStageCanvas.height) enemyBullets.splice(index, 1); // Eliminar balas fuera de pantalla
            });
        }

        // Función para dibujar las balas enemigas
        function drawEnemyBullets() {
            gameCtx.fillStyle = 'red';
            enemyBullets.forEach(bullet => gameCtx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height));
        }
        // Función para detectar colisiones
        function checkCollisions() {
            // Colisiones entre balas del jugador y enemigos
            bullets.forEach((bullet, bIndex) => {
                enemies.forEach((enemy, eIndex) => {
                    if (
                        bullet.x < enemy.x + enemy.width &&
                        bullet.x + bullet.width > enemy.x &&
                        bullet.y < enemy.y + enemy.height &&
                        bullet.y + bullet.height > enemy.y
                    ) {
                        bullets.splice(bIndex, 1);
                        enemies.splice(eIndex, 1);

                        // Sumar puntos según el tipo de nave enemiga
                        if (enemy.type === 1) score += 100; // Nave enemiga 1: 100 puntos
                        if (enemy.type === 2) score += 200; // Nave enemiga 2: 200 puntos
                        if (enemy.type === 3) score += 300; // Nave enemiga 3: 300 puntos

                        // Reproducir sonido de colisión
                        explosionSound.play();
                    }
                });
            });
            // Colisiones entre balas enemigas y el jugador
            if (!invincible) { // Solo verificar colisiones si el jugador no está en estado de inmunidad
                enemyBullets.forEach((bullet, bIndex) => {
                    if (
                        bullet.x < player.x + player.width &&
                        bullet.x + bullet.width > player.x &&
                        bullet.y < player.y + player.height &&
                        bullet.y + bullet.height > player.y
                    ) {
                        enemyBullets.splice(bIndex, 1); // Eliminar la bala enemiga
                        lives--; 
                        explosionShipSound.play(); 

                        // Activar estado de inmunidad
                        invincible = true;
                        gameCtx.drawImage(explosionImage, player.x, player.y, player.width, player.height);

                        // Desactivar estado de inmunidad después de 2 segundos
                        clearTimeout(invincibleTimeout);
                        invincibleTimeout = setTimeout(() => {
                            invincible = false;
                        }, 2000); // Duración de la inmunidad: 2 segundos
                        // Mostrar explosión
                        isExploding = true;
                        gameCtx.drawImage(explosionImage, player.x, player.y, player.width, player.height);

                        // Restaurar la nave después de un breve período
                        clearTimeout(explosionTimeout);
                        explosionTimeout = setTimeout(() => {
                            isExploding = false;
                        }, 500); 

                        if (lives <= 0) {
                            gameOver(); 
                        }
                    }
                });

                        // Avanzar al siguiente nivel si no quedan enemigos
                        if (enemies.length === 0) {
                            clearInterval(stageCountdown);
                            stageCountdown = null;
                            
                            if (currentStage >= 5) { 
                                showVictoryScreen();
                                victorySound.play(); 
                                return;
                            }
                            
                            // Para stages intermedios
                            gameState = 'preStage';
                            currentStage++;
                            stageTimer = 3;
                            spawnEnemies();
                            stageStartSound.play(); 
                        };   
            
        }}

        // Inicializar el juego
        spawnEnemies();
        gameLoop();
    });
}
// Función para mostrar el input de nombre
function showNameInput(score) {
    console.log("Mostrando input de nombre...");

    // Ocultar todas las demás pantallas
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'none';

    // Mostrar el contenedor del input
    const inputContainer = document.getElementById('name-input-container');
    inputContainer.style.display = 'block';

    // Obtener el input y limpiar cualquier valor previo
    const input = document.getElementById('player-name-input');
    input.value = ''; 
    input.focus();

    // Eliminar event listeners previos asegurando que no haya duplicación
    input.replaceWith(input.cloneNode(true));

    // Obtener el nuevo input clonado
    const newInput = document.getElementById('player-name-input');

    // Definir la función de manejo del evento Enter
    function handleEnter(event) {
        if (event.key === 'Enter') {
            const playerName = newInput.value.trim() || 'AAA'; 

            // Ocultar el contenedor del input
            inputContainer.style.display = 'none';

            // Guardar el nombre y el puntaje
            saveHighScore(playerName, score);

            // Mostrar la pantalla de High Scores
            showHighScores();
        }
    }

    // Agregar event listener al nuevo input
    newInput.addEventListener('keydown', handleEnter);
}



// Función para mostrar la pantalla de High Scores
function showHighScores() {
    console.log("Mostrando pantalla de High Scores...");

    // Limpiar la lista de High Scores
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = '';

    // Agregar los puntajes al DOM
    highScores.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
        highScoresList.appendChild(listItem);
    });

    // Mostrar el contenedor de High Scores
    document.getElementById('high-scores-container').style.display = 'block';

    // Ocultar la pantalla después de 5 segundos
    setTimeout(() => {
        document.getElementById('high-scores-container').style.display = 'none';
        document.getElementById('menu-screen').style.display = 'block'; 
        document.getElementById('game-screen').style.display = 'none'; 
        drawMenu(); // Redibujar el menú
    }, 5000);
}
// Función para guardar el puntaje
function saveHighScore(name, score) {
    console.log("Guardando puntaje:", name, score);

    // Agregar el nuevo puntaje al array
    highScores.push({ name, score });

    // Ordenar por puntaje descendente
    highScores.sort((a, b) => b.score - a.score);

    // Mantener solo los 5 mejores puntajes
    highScores = highScores.slice(0, 5);

    // Rellenar las posiciones vacías con valores predeterminados
    while (highScores.length < 5) {
        highScores.push({ name: 'AAA', score: 0 });
    }

    // Guardar en localStorage
    localStorage.setItem('highScores', JSON.stringify(highScores));
}
function resetGame() {
    // Detener el bucle del juego
    cancelAnimationFrame(animationFrameId);

    // Reiniciar variables del juego
    score = 0;
    lives = 3;
    bullets = [];
    enemies = [];
    enemyBullets = [];
    currentStage = 1;

    // Limpiar el canvas
    gameCtx.clearRect(0, 0, gameStageCanvas.width, gameStageCanvas.height);

    // Detener la música de fondo
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; 

    // Volver al menú principal
    document.getElementById('game-screen').style.display = 'none'; 
    document.getElementById('menu-screen').style.display = 'block'; 
    drawMenu(); // Redibujar el menú
}
// Función para mostrar la pantalla de Game Over
function gameOver() {
    stageStartSound.pause();
    stageStartSound.currentTime = 0;
    backgroundMusic.pause();
    gameOverSound.play();
    cancelAnimationFrame(animationFrameId); // Detener el bucle del juego

    // Limpiar el canvas
    gameCtx.clearRect(0, 0, gameStageCanvas.width, gameStageCanvas.height);

    // Dibujar fondo negro
    gameCtx.fillStyle = 'black';
    gameCtx.fillRect(0, 0, gameStageCanvas.width, gameStageCanvas.height);

    // Dibujar el texto "GAME OVER"
    gameCtx.fillStyle = 'red';
    gameCtx.font = '100px "Silkscreen"';
    gameCtx.textAlign = 'center';
    gameCtx.fillText('GAME OVER', gameStageCanvas.width / 2, gameStageCanvas.height / 2);

    // Mostrar la puntuación final
    gameCtx.fillStyle = 'white';
    gameCtx.font = '30px "Silkscreen"';
    gameCtx.fillText(`Final Score: ${score}`, gameStageCanvas.width / 2, gameStageCanvas.height / 2 + 100);

    // Mostrar el input de nombre después de 5 segundos
    setTimeout(() => {
        console.log("Mostrando input de nombre...");
        showNameInput(score);
    }, 5000);

    // Escuchar eventos de teclado para reiniciar manualmente
    window.addEventListener('keydown', handleGameOverKeyPress);
}

// Función para manejar el reinicio desde la pantalla de Game Over
function handleGameOverKeyPress(event) {
    if (event.key === 'Enter') {
        console.log("Volviendo al menú principal...");
        resetGame(); // Reiniciar el juego manualmente si se presiona Enter
        window.removeEventListener('keydown', handleGameOverKeyPress); 
    }
}
// Función para mostrar la pantalla de Victoria
function showVictoryScreen() {
    // Detener cualquier sonido previo
    stageStartSound.pause();
    stageStartSound.currentTime = 0;
    backgroundMusic.pause();
    
    // Solo reproducir sonido de victoria
    victorySound.play();
    cancelAnimationFrame(animationFrameId); // Detener el bucle del juego

    // Limpiar el canvas
    gameCtx.clearRect(0, 0, gameStageCanvas.width, gameStageCanvas.height);

    // Dibujar imagen de fondo de victoria
    gameCtx.fillStyle = 'black';
    gameCtx.fillRect(0, 0, gameStageCanvas.width, gameStageCanvas.height);

    // Dibujar el texto "¡VICTORY!"
    gameCtx.fillStyle = 'gold';
    gameCtx.font = '100px "Silkscreen"';
    gameCtx.textAlign = 'center';
    gameCtx.fillText('¡VICTORY!', gameStageCanvas.width / 2, gameStageCanvas.height / 2);

    // Mostrar la puntuación final
    gameCtx.fillStyle = 'white';
    gameCtx.font = '30px "Silkscreen"';
    gameCtx.fillText(`Final Score: ${score}`, gameStageCanvas.width / 2, gameStageCanvas.height / 2 + 100);

    // Mostrar el input de nombre después de 5 segundos
    setTimeout(() => {
        console.log("Mostrando input de nombre...");
        showNameInput(score);
    }, 5000);

    // Escuchar eventos de teclado para reiniciar manualmente
    window.addEventListener('keydown', handleVictoryKeyPress);
}

// Función para manejar el reinicio desde la pantalla de Victoria
function handleVictoryKeyPress(event) {
    if (event.key === 'Enter') {
        console.log("Volviendo al menú principal...");
        resetGame(); // Reiniciar el juego manualmente si se presiona Enter
        window.removeEventListener('keydown', handleVictoryKeyPress); 
    }
}

// Cargar imágenes y luego dibujar el menú
loadImages(() => {
    console.log('Todas las imágenes han sido cargadas');
    setTimeout(() => {
        document.getElementById('intro-screen').style.display = 'none'; 
        document.getElementById('menu-screen').style.display = 'block'; 
        backgroundMusic.play(); 
        drawMenu(); 
    }, 8000);
});