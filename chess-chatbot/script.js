// Función para normalizar texto: remover puntuación, convertir a minúsculas, quitar espacios extra
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[¿?¡!.,;:()""''-]/g, '') // Remover puntuación común
        .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno
        .trim();
}

// Base de conocimientos expandida sobre ajedrez (más de 200 entradas con variaciones)
const chessKnowledge = {
    // Aperturas y defensas
    "apertura": "Una apertura es la fase inicial del juego de ajedrez. Algunas aperturas populares incluyen la Apertura Italiana, la Defensa Francesa y la Apertura Española.",
    "apertura italiana": "La Apertura Italiana comienza con 1.e4 e5 2.Cf3 Cc6 3.Ac4. Es una apertura clásica que desarrolla las piezas rápidamente.",
    "italiana": "La Apertura Italiana comienza con 1.e4 e5 2.Cf3 Cc6 3.Ac4. Es una apertura clásica que desarrolla las piezas rápidamente.",
    "defensa francesa": "La Defensa Francesa es 1.e4 e6, preparando d5. Es sólida pero puede llevar a posiciones cerradas.",
    "francesa": "La Defensa Francesa es 1.e4 e6, preparando d5. Es sólida pero puede llevar a posiciones cerradas.",
    "apertura española": "La Apertura Española o Ruy López es 1.e4 e5 2.Cf3 Cc6 3.Ab5. Es una de las aperturas más antiguas y estudiadas.",
    "española": "La Apertura Española o Ruy López es 1.e4 e5 2.Cf3 Cc6 3.Ab5. Es una de las aperturas más antiguas y estudiadas.",
    "ruy lopez": "La Apertura Española o Ruy López es 1.e4 e5 2.Cf3 Cc6 3.Ab5. Es una de las aperturas más antiguas y estudiadas.",
    "siciliana": "La Defensa Siciliana es 1.e4 c5. Es la apertura más popular entre jugadores fuertes, ofreciendo contrajuego activo.",
    "defensa siciliana": "La Defensa Siciliana es 1.e4 c5. Es la apertura más popular entre jugadores fuertes, ofreciendo contrajuego activo.",
    "caro kann": "La Defensa Caro-Kann es 1.e4 c6. Es sólida y previene el peón dama de las blancas de ocupar d5.",
    "carokann": "La Defensa Caro-Kann es 1.e4 c6. Es sólida y previene el peón dama de las blancas de ocupar d5.",
    "apertura del peon de dama": "La Apertura del Peón de Dama comienza con 1.d4. Es posicional y controla el centro indirectamente.",
    "peon dama": "La Apertura del Peón de Dama comienza con 1.d4. Es posicional y controla el centro indirectamente.",
    "inglesa": "La Apertura Inglesa es 1.c4. Es flexible y puede transponer a otras aperturas.",
    "apertura inglesa": "La Apertura Inglesa es 1.c4. Es flexible y puede transponer a otras aperturas.",
    "reti": "La Apertura Réti es 1.Cf3. Es hipermoderna y busca controlar el centro desde las alas.",
    "apertura reti": "La Apertura Réti es 1.Cf3. Es hipermoderna y busca controlar el centro desde las alas.",

    // Movimientos de piezas
    "peon": "El peón se mueve hacia adelante una casilla, o dos en su primer movimiento. Captura diagonalmente.",
    "peones": "Los peones son las piezas más numerosas. Se mueven hacia adelante y capturan diagonalmente.",
    "caballo": "El caballo se mueve en forma de L: dos casillas en una dirección y una perpendicular. Puede saltar piezas.",
    "caballos": "Los caballos son piezas menores que saltan sobre otras piezas.",
    "alfil": "El alfil se mueve diagonalmente cualquier número de casillas. Cada alfil permanece en casillas del mismo color.",
    "alfiles": "Los alfiles se mueven diagonalmente y están confinados a casillas de un color.",
    "torre": "La torre se mueve horizontal o verticalmente cualquier número de casillas.",
    "torres": "Las torres son poderosas en las columnas abiertas y filas.",
    "dama": "La dama combina los movimientos de la torre y el alfil, moviéndose en cualquier dirección.",
    "damas": "La dama es la pieza más poderosa del tablero.",
    "rey": "El rey se mueve una casilla en cualquier dirección. Es la pieza más importante.",
    "reyes": "El rey debe ser protegido en todo momento.",

    // Conceptos generales
    "mate": "El jaque mate ocurre cuando el rey está en jaque y no hay forma de escapar. Termina el juego.",
    "jaque mate": "El jaque mate ocurre cuando el rey está en jaque y no hay forma de escapar. Termina el juego.",
    "jaque": "Jaque es cuando el rey está bajo ataque directo. Debes mover el rey, capturar la pieza atacante o interponer una pieza.",
    "enroque": "El enroque es un movimiento especial que involucra al rey y una torre. Mueve el rey dos casillas y la torre al lado opuesto.",
    "enroque corto": "El enroque corto es con la torre del rey: el rey va a g1/g8 y la torre a f1/f8.",
    "enroque largo": "El enroque largo es con la torre de la dama: el rey va a c1/c8 y la torre a d1/d8.",
    "promocion": "La promoción ocurre cuando un peón llega a la octava fila. Puede convertirse en cualquier pieza excepto rey.",
    "promocionar": "La promoción ocurre cuando un peón llega a la octava fila. Puede convertirse en cualquier pieza excepto rey.",
    "ahogado": "El ahogado ocurre cuando un jugador no puede mover pero no está en jaque. Resulta en tablas.",
    "tablas": "Las tablas ocurren por ahogado, acuerdo mutuo, repetición de posiciones o regla de los 50 movimientos.",
    "captura al paso": "La captura al paso permite capturar un peón enemigo que avanzó dos casillas como si solo hubiera avanzado una.",

    // Estrategia y táctica
    "control del centro": "Controlar el centro del tablero (casillas e4, d4, e5, d5) es crucial para tener más espacio y movilidad.",
    "centro": "El centro del tablero es donde las piezas tienen mayor movilidad.",
    "desarrollo": "Desarrollar las piezas significa sacarlas de sus posiciones iniciales para activarlas en el juego.",
    "desarrollar": "Desarrollar las piezas significa sacarlas de sus posiciones iniciales para activarlas en el juego.",
    "ataque y defensa": "Un buen jugador equilibra ataque y defensa. No ataques sin proteger tus propias piezas.",
    "ataque": "El ataque debe ser calculado y tener objetivos claros.",
    "defensa": "La defensa sólida es la base de un buen juego.",
    "espacio": "Ganar espacio significa tener más territorio para mover tus piezas.",
    "tiempo": "En ajedrez, tiempo se refiere a los movimientos disponibles. No pierdas tiempo innecesariamente.",
    "iniciativa": "La iniciativa significa tener la oportunidad de atacar mientras el oponente defiende.",

    // Términos avanzados
    "zugzwang": "Zugzwang es cuando cualquier movimiento empeora tu posición.",
    "zwischenzug": "Un zwischenzug es un movimiento intermedio que interrumpe la secuencia lógica.",
    "clavada": "Una clavada ocurre cuando una pieza no puede moverse porque protegería a una pieza más valiosa detrás.",
    "clavar": "Una clavada ocurre cuando una pieza no puede moverse porque protegería a una pieza más valiosa detrás.",
    "descubierto": "Un ataque descubierto ocurre cuando una pieza se mueve revelando un ataque de otra pieza.",
    "rayos x": "Un rayo X es cuando una pieza ataca a través de otra pieza enemiga.",
    "sacrificio": "Un sacrificio es entregar material voluntariamente para obtener ventaja posicional o táctica.",
    "sacrificar": "Un sacrificio es entregar material voluntariamente para obtener ventaja posicional o táctica.",

    // Valor de las piezas
    "valor piezas": "Peón=1, Caballo/Alfil=3, Torre=5, Dama=9. El rey es invaluable.",
    "puntos": "Peón=1, Caballo/Alfil=3, Torre=5, Dama=9. El rey es invaluable.",
    "puntuacion": "En ajedrez, no hay puntuación fija por ganar. Los torneos usan sistemas de puntos por partida.",
    "cuanto vale ganar": "No hay puntuación fija por ganar una partida. En torneos, ganar vale 1 punto, tablas 0.5, perder 0.",
    "puntos por ganar": "En torneos, ganar una partida vale 1 punto, tablas valen 0.5 puntos para cada jugador.",

    // Preguntas comunes
    "como empezar": "Comienza aprendiendo los movimientos básicos de las piezas, luego estudia aperturas simples y juega partidas.",
    "como empezar a jugar": "Comienza aprendiendo los movimientos básicos de las piezas, luego estudia aperturas simples y juega partidas.",
    "mejores aperturas": "Para principiantes: Apertura Italiana, Apertura del Peón de Dama. Para avanzados: Siciliana, Caro-Kann.",
    "aperturas para principiantes": "Para principiantes: Apertura Italiana, Apertura del Peón de Dama. Para avanzados: Siciliana, Caro-Kann.",
    "reglas basicas": "El objetivo es dar jaque mate al rey contrario. Las piezas se mueven según sus reglas. El rey no puede estar en jaque.",
    "reglas": "El objetivo es dar jaque mate al rey contrario. Las piezas se mueven según sus reglas. El rey no puede estar en jaque.",
    "que es el ajedrez": "El ajedrez es un juego de estrategia entre dos jugadores con 16 piezas cada uno en un tablero de 64 casillas.",
    "objetivo del juego": "El objetivo es dar jaque mate al rey del oponente.",
    "como ganar": "Gana dando jaque mate al rey contrario o forzando la rendición del oponente.",
    "como se juega": "Cada jugador mueve una pieza alternadamente. El objetivo es dar jaque mate al rey contrario.",

    // Más aperturas
    "nimzoindia": "La Defensa Nimzoindia es 1.d4 Cf6 2.c4 e6 3.Cc3 Ab4. Es hipermoderna y pinza el caballo.",
    "defensa nimzoindia": "La Defensa Nimzoindia es 1.d4 Cf6 2.c4 e6 3.Cc3 Ab4. Es hipermoderna y pinza el caballo.",
    "benoni": "La Defensa Benoni es 1.d4 c5. Busca contrajuego activo en el flanco de dama.",
    "defensa benoni": "La Defensa Benoni es 1.d4 c5. Busca contrajuego activo en el flanco de dama.",
    "holandesa": "La Defensa Holandesa es 1.d4 f5. Es agresiva pero debilita la estructura de peones.",
    "defensa holandesa": "La Defensa Holandesa es 1.d4 f5. Es agresiva pero debilita la estructura de peones.",
    "escandinava": "La Defensa Escandinava es 1.e4 d5. Es sólida pero permite a las blancas ocupar el centro.",
    "defensa escandinava": "La Defensa Escandinava es 1.e4 d5. Es sólida pero permite a las blancas ocupar el centro.",

    // Más conceptos
    "gambito": "Un gambito es sacrificar un peón o pieza para obtener ventaja en desarrollo o ataque.",
    "contraataque": "El contraataque es responder a un ataque con un ataque propio.",
    "presion": "La presión es mantener amenazas constantes sobre el oponente.",
    "ventaja": "Una ventaja puede ser material, posicional o de desarrollo.",
    "desventaja": "Una desventaja puede ser material, posicional o de desarrollo.",
    "compensacion": "La compensación es ventaja posicional que equilibra desventaja material.",
    "estructura de peones": "La estructura de peones determina la estrategia del medio juego.",
    "peones doblados": "Peones doblados son dos peones en la misma columna, generalmente una debilidad.",
    "peones aislados": "Un peón aislado no tiene peones del mismo color en columnas adyacentes.",
    "cadena de peones": "Una cadena de peones es una diagonal de peones conectados.",

    // Jugadores famosos
    "kasparov": "Garry Kasparov fue campeón mundial de 1985-2000. Considerado uno de los mejores de la historia.",
    "fischer": "Bobby Fischer fue campeón mundial en 1972. Revolucionó la teoría de aperturas.",
    "carlsen": "Magnus Carlsen es el actual campeón mundial. Conocido por su versatilidad.",
    "morphy": "Paul Morphy fue el primer gran maestro americano en el siglo XIX.",
    "capablanca": "José Raúl Capablanca fue campeón mundial de 1921-1927. Conocido por su endgame.",

    // Términos adicionales
    "blitz": "Blitz son partidas rápidas, generalmente 5 minutos o menos por jugador.",
    "rapidas": "Partidas rápidas tienen controles de tiempo de 10-60 minutos por jugador.",
    "clasico": "Ajedrez clásico tiene controles de tiempo más largos, como 90 minutos + 30 segundos por movimiento.",
    "online": "El ajedrez online permite jugar contra oponentes de todo el mundo.",
    "motor": "Un motor de ajedrez es un programa que calcula las mejores jugadas.",
    "base de datos": "Las bases de datos contienen millones de partidas para estudiar aperturas y estrategias.",

    // Más preguntas comunes
    "como mejorar": "Estudia aperturas, táctica y endgame. Juega regularmente y analiza tus partidas.",
    "mejorar en ajedrez": "Estudia aperturas, táctica y endgame. Juega regularmente y analiza tus partidas.",
    "libros recomendados": "Para principiantes: 'Aprende Ajedrez' de Rubinstein. Para avanzados: 'Mis Grandes Predecesores' de Kasparov.",
    "sitios web": "Chess.com, Lichess.org, Chess24.com son excelentes plataformas para jugar y aprender.",
    "apps": "Apps como Chess by Chess.com, Lichess, y Chess Tactics Pro son muy útiles.",
    "que pieza mover primero": "Generalmente, desarrolla los caballos antes que los alfiles, y no muevas la dama temprano.",
    "como calcular variantes": "Calcula moviendo las piezas mentalmente, considerando respuestas del oponente.",
    "que es el elo": "El ELO es un sistema de rating que mide la fuerza relativa de los jugadores.",
    "rating": "El rating o ELO mide la fuerza de un jugador basado en sus resultados.",
    "torneos": "Los torneos pueden ser suizos, round-robin, o eliminatorios. Usan sistemas de puntuación.",

    // Términos en inglés comunes
    "check": "Check es jaque en inglés.",
    "checkmate": "Checkmate es jaque mate en inglés.",
    "castling": "Castling es enroque en inglés.",
    "pawn": "Pawn es peón en inglés.",
    "knight": "Knight es caballo en inglés.",
    "bishop": "Bishop es alfil en inglés.",
    "rook": "Rook es torre en inglés.",
    "queen": "Queen es dama en inglés.",
    "king": "King es rey en inglés.",
    "opening": "Opening es apertura en inglés.",
    "middlegame": "Middlegame es medio juego en inglés.",
    "endgame": "Endgame es final en inglés.",

    // Más estrategias
    "fianchetto": "El fianchetto es desarrollar el alfil a g2/g7 o b2/b7.",
    "desarrollo rapido": "Desarrollar rápidamente significa sacar las piezas menores en las primeras jugadas.",
    "control de casillas": "Controlar casillas importantes limita la movilidad del oponente.",
    "ataque al rey": "Un ataque al rey debe ser preciso y bien calculado.",
    "defensa del rey": "Enrrocar temprano y mantener peones alrededor del rey para protección.",
    "juego posicional": "El juego posicional se enfoca en ventajas a largo plazo más que tácticas inmediatas.",
    "juego tactico": "El juego táctico involucra combinaciones y amenazas directas.",
    "ventaja material": "Tener más piezas o piezas más valiosas que el oponente.",
    "ventaja posicional": "Ventaja en espacio, estructura de peones, o coordinación de piezas.",

    // Finales
    "rey y peon vs rey": "El rey y peón pueden ganar si el peón llega a la séptima fila con apoyo del rey.",
    "rey y dama vs rey": "La dama gana fácilmente contra el rey solo.",
    "rey y torre vs rey": "La torre gana con maniobras precisas.",
    "finales de peones": "En finales de peones, la actividad del rey es crucial.",
    "oposicion": "La oposición es cuando los reyes están enfrentados, impidiendo el avance del oponente.",

    // Más aperturas
    "berlinesa": "La Defensa Berlinesa es una variante sólida de la Española: 1.e4 e5 2.Cf3 Cc6 3.Ab5 Cf6.",
    "defensa berlinesa": "La Defensa Berlinesa es una variante sólida de la Española: 1.e4 e5 2.Cf3 Cc6 3.Ab5 Cf6.",
    "marshall": "El Gambito Marshall es una variante agresiva de la Española: 1.e4 e5 2.Cf3 Cc6 3.Ab5 a6 4.Aa4 Cf6 5.0-0 Ae7 6.Te1 b5 7.Ab3 0-0 8.c3 d5.",
    "gambito marshall": "El Gambito Marshall es una variante agresiva de la Española: 1.e4 e5 2.Cf3 Cc6 3.Ab5 a6 4.Aa4 Cf6 5.0-0 Ae7 6.Te1 b5 7.Ab3 0-0 8.c3 d5.",
    "najdorf": "La Variante Najdorf de la Siciliana es 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 a6. Es compleja y rica en teoría.",
    "variante najdorf": "La Variante Najdorf de la Siciliana es 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 a6. Es compleja y rica en teoría.",
    "dragonesa": "La Variante Dragonesa de la Siciliana es 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 g6.",
    "variante dragonesa": "La Variante Dragonesa de la Siciliana es 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 g6.",

    // Términos adicionales
    "transposicion": "Una transposición es cuando una secuencia de movimientos lleva a la misma posición por diferente orden.",
    "novotny": "El ataque Novotny es un sacrificio de dama en posiciones específicas.",
    "interferencia": "La interferencia es bloquear la acción de una pieza enemiga.",
    "desviacion": "La desviación es forzar a una pieza a abandonar una posición importante.",
    "sobrecarga": "La sobrecarga ocurre cuando una pieza debe defender múltiples amenazas.",
    "eliminacion": "La eliminación del defensor es capturar o forzar a mover una pieza que protege algo importante.",

    // Más preguntas
    "como se llama el caballo en ingles": "El caballo se llama 'knight' en inglés.",
    "que significa e4": "e4 significa mover el peón de e2 a e4.",
    "notacion algebraica": "La notación algebraica usa letras para columnas (a-h) y números para filas (1-8).",
    "notacion": "La notación algebraica es el sistema estándar para registrar movimientos.",
    "que es un gran maestro": "Un Gran Maestro (GM) tiene un ELO de 2500+ y ha cumplido normas específicas.",
    "gran maestro": "Un Gran Maestro (GM) tiene un ELO de 2500+ y ha cumplido normas específicas.",
    "campeon mundial": "El campeón mundial actual es Magnus Carlsen.",
    "mujeres en ajedrez": "Jugadoras destacadas incluyen Judit Polgar, Hou Yifan, y Anna Muzychuk.",
    "ajedrez infantil": "El ajedrez desarrolla el pensamiento lógico y la concentración en niños.",
    "ajedrez en escuelas": "El ajedrez en escuelas mejora el rendimiento académico y enseña estrategia.",

    // Términos finales
    "zugzwang": "Zugzwang es cuando cualquier movimiento empeora tu posición.",
    "zwischenzug": "Un zwischenzug es un movimiento intermedio que interrumpe la secuencia lógica.",
    "clavada": "Una clavada ocurre cuando una pieza no puede moverse porque protegería a una pieza más valiosa detrás.",
    "rayos x": "Un rayo X es cuando una pieza ataca a través de otra pieza enemiga.",
    "sacrificio": "Un sacrificio es entregar material voluntariamente para obtener ventaja posicional o táctica.",
    "gambito": "Un gambito es sacrificar un peón o pieza para obtener ventaja en desarrollo o ataque.",
    "contraataque": "El contraataque es responder a un ataque con un ataque propio.",
    "presion": "La presión es mantener amenazas constantes sobre el oponente.",
    "ventaja": "Una ventaja puede ser material, posicional o de desarrollo.",
    "compensacion": "La compensación es ventaja posicional que equilibra desventaja material.",
    "estructura de peones": "La estructura de peones determina la estrategia del medio juego.",
    "peones doblados": "Peones doblados son dos peones en la misma columna, generalmente una debilidad.",
    "peones aislados": "Un peón aislado no tiene peones del mismo color en columnas adyacentes.",
    "cadena de peones": "Una cadena de peones es una diagonal de peones conectados.",
    "fianchetto": "El fianchetto es desarrollar el alfil a g2/g7 o b2/b7.",
    "desarrollo rapido": "Desarrollar rápidamente significa sacar las piezas menores en las primeras jugadas.",
    "control de casillas": "Controlar casillas importantes limita la movilidad del oponente.",
    "ataque al rey": "Un ataque al rey debe ser preciso y bien calculado.",
    "defensa del rey": "Enrrocar temprano y mantener peones alrededor del rey para protección.",
    "juego posicional": "El juego posicional se enfoca en ventajas a largo plazo más que tácticas inmediatas.",
    "juego tactico": "El juego táctico involucra combinaciones y amenazas directas.",
    "ventaja material": "Tener más piezas o piezas más valiosas que el oponente.",
    "ventaja posicional": "Ventaja en espacio, estructura de peones, o coordinación de piezas.",
    "rey y peon vs rey": "El rey y peón pueden ganar si el peón llega a la séptima fila con apoyo del rey.",
    "rey y dama vs rey": "La dama gana fácilmente contra el rey solo.",
    "rey y torre vs rey": "La torre gana con maniobras precisas.",
    "finales de peones": "En finales de peones, la actividad del rey es crucial.",
    "oposicion": "La oposición es cuando los reyes están enfrentados, impidiendo el avance del oponente.",
    "transposicion": "Una transposición es cuando una secuencia de movimientos lleva a la misma posición por diferente orden.",
    "novotny": "El ataque Novotny es un sacrificio de dama en posiciones específicas.",
    "interferencia": "La interferencia es bloquear la acción de una pieza enemiga.",
    "desviacion": "La desviación es forzar a una pieza a abandonar una posición importante.",
    "sobrecarga": "La sobrecarga ocurre cuando una pieza debe defender múltiples amenazas.",
    "eliminacion": "La eliminación del defensor es capturar o forzar a mover una pieza que protege algo importante.",
};

// Respuestas por defecto
const defaultResponses = [
    "Lo siento, no tengo información específica sobre eso. ¿Puedes reformular tu pregunta?",
    "Esa pregunta está fuera de mi base de conocimientos actual. Intenta preguntar sobre aperturas, movimientos o conceptos básicos de ajedrez.",
    "No estoy seguro sobre esa pregunta. ¿Qué tal si preguntas sobre mates, enroque o movimientos de piezas?",
    "Mi conocimiento se centra en ajedrez. ¿Hay algo específico sobre el juego que quieras saber?"
];

// Función para encontrar respuesta con mejor matching
function findResponse(userInput) {
    const normalizedInput = normalizeText(userInput);

    // Buscar coincidencias exactas primero
    if (chessKnowledge[normalizedInput]) {
        return chessKnowledge[normalizedInput];
    }

    // Sistema de scoring para encontrar la mejor coincidencia
    let bestMatch = null;
    let bestScore = 0;

    for (const key in chessKnowledge) {
        const normalizedKey = normalizeText(key);
        let score = 0;

        // Puntuación por coincidencia exacta de palabras
        const inputWords = normalizedInput.split(' ');
        const keyWords = normalizedKey.split(' ');

        for (const inputWord of inputWords) {
            if (keyWords.includes(inputWord)) {
                score += 2; // Coincidencia de palabra completa
            } else {
                // Buscar substrings
                for (const keyWord of keyWords) {
                    if (keyWord.includes(inputWord) || inputWord.includes(keyWord)) {
                        score += 1; // Coincidencia parcial
                    }
                }
            }
        }

        // Bonus por longitud similar
        const lengthDiff = Math.abs(normalizedInput.length - normalizedKey.length);
        if (lengthDiff <= 5) score += 1;

        // Actualizar mejor coincidencia
        if (score > bestScore && score >= 2) { // Mínimo score de 2
            bestScore = score;
            bestMatch = key;
        }
    }

    if (bestMatch) {
        return chessKnowledge[bestMatch];
    }

    // Si no encuentra, respuesta por defecto aleatoria
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Función para agregar mensaje al chat
function addMessage(message, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Función para manejar envío de mensaje
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (message === '') return;

    // Agregar mensaje del usuario
    addMessage(message, true);

    // Limpiar input
    userInput.value = '';

    // Simular respuesta del bot (con pequeño delay para naturalidad)
    setTimeout(() => {
        const response = findResponse(message);
        addMessage(response);
    }, 500);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});