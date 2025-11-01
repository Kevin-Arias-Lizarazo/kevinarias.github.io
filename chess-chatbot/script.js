// Función para normalizar texto: remover puntuación, convertir a minúsculas, quitar espacios extra
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[¿?¡!.,;:()""''-]/g, '') // Remover puntuación común
        .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno
        .trim();
}

// Sistema de reglas para inferir temas basado en palabras clave
const topicKeywords = {
    openings: ['apertura', 'abertura', 'italiana', 'francesa', 'española', 'siciliana', 'caro', 'kan', 'nimzo', 'india', 'inglesa', 'reti', 'berlinesa', 'marshall', 'najdorf', 'dragon'],
    pieces: ['peon', 'peones', 'caballo', 'caballos', 'alfil', 'alfiles', 'torre', 'torres', 'dama', 'damas', 'rey', 'reyes', 'pieza', 'piezas', 'movimiento', 'mover'],
    tactics: ['mate', 'jaque', 'enroque', 'promocion', 'ahogado', 'tablas', 'captura', 'paso', 'clavada', 'descubierto', 'sacrificio', 'gambito', 'tactica'],
    strategy: ['centro', 'desarrollo', 'ataque', 'defensa', 'espacio', 'tiempo', 'iniciativa', 'control', 'posicion', 'estrategia', 'ventaja', 'desventaja'],
    endgame: ['final', 'finales', 'rey', 'peon', 'oposicion', 'zugzwang', 'endgame'],
    players: ['kasparov', 'fischer', 'carlsen', 'morphy', 'capablanca', 'jugador', 'campeon', 'gran', 'maestro'],
    basics: ['reglas', 'basicas', 'empezar', 'principiante', 'como', 'que', 'es', 'ajedrez', 'objetivo', 'ganar'],
    practice: ['mejorar', 'practica', 'libros', 'sitios', 'apps', 'torneos', 'elo', 'rating', 'calcular', 'variantes']
};

// Función para inferir tema basado en palabras clave
function inferTopic(userInput) {
    const normalizedInput = normalizeText(userInput);
    const words = normalizedInput.split(' ');

    let topicScores = {};

    // Contar ocurrencias de palabras clave por tema
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        let score = 0;
        for (const word of words) {
            if (keywords.some(keyword => keyword.includes(word) || word.includes(keyword))) {
                score += 2; // Coincidencia parcial
            }
            if (keywords.includes(word)) {
                score += 3; // Coincidencia exacta
            }
        }
        if (score > 0) {
            topicScores[topic] = score;
        }
    }

    // Encontrar el tema con mayor puntuación
    let bestTopic = null;
    let maxScore = 0;
    for (const [topic, score] of Object.entries(topicScores)) {
        if (score > maxScore) {
            maxScore = score;
            bestTopic = topic;
        }
    }

    return bestTopic;
}

// Función para generar respuestas coherentes basadas en reglas (actualizada para usar nueva memoria)
function generateCoherentResponse(userInput, inferredTopic, conversationContext) {
    const normalizedInput = normalizeText(userInput);

    // Reglas de coherencia basadas en contexto
    if (conversationContext.lastTopic && inferredTopic && conversationContext.lastTopic !== inferredTopic) {
        // Si cambia de tema, hacer transición suave
        return generateTopicTransition(conversationContext.lastTopic, inferredTopic, userInput);
    }

    // Si es el mismo tema, hacer respuestas más específicas
    if (conversationContext.lastTopic === inferredTopic) {
        return generateFollowUpResponse(inferredTopic, userInput, conversationContext);
    }

    return null; // Dejar que el sistema normal maneje
}

// Función para generar respuestas esperadas cuando hay un follow-up pendiente
function generateExpectedFollowUp(userInput) {
    const lastMessage = conversationMemory.history.recentMessages[conversationMemory.history.recentMessages.length - 1];

    // Resetear estado
    conversationMemory.state.followUpExpected = false;

    // Si esperaba una respuesta sobre mates
    if (lastMessage.bot.includes('mates básicos')) {
        return "¡Excelente! Empecemos con mates simples. El mate con dama y rey: la dama controla la fila del rey enemigo y el rey propio lo acorrala. ¡Es letal! ⚡ ¿Quieres ver el mate con dos torres?";
    }

    // Si esperaba detalles sobre aperturas
    if (conversationMemory.context.lastTopic === 'openings') {
        return "¡Perfecto! En las aperturas, el control del centro es crucial. Las casillas e4, d4, e5, d5 son las más importantes. ¿Te explico alguna apertura específica?";
    }

    // Respuesta genérica
    return "¡Gracias por tu respuesta! ¿En qué más puedo ayudarte sobre ajedrez?";
}

// Función para transiciones entre temas
function generateTopicTransition(fromTopic, toTopic, userInput) {
    const transitions = {
        'openings-pieces': "¡Excelente! Después de hablar de aperturas, veamos cómo se mueven las piezas. ",
        'pieces-tactics': "¡Genial! Ahora que sabes mover las piezas, hablemos de tácticas como el jaque mate. ",
        'tactics-strategy': "¡Perfecto! Las tácticas son importantes, pero la estrategia a largo plazo es clave. ",
        'strategy-endgame': "¡Muy bien! La estrategia del medio juego nos lleva naturalmente a los finales. ",
        'basics-openings': "¡Buen inicio! Ahora que conoces lo básico, exploremos las aperturas. "
    };

    const key = `${fromTopic}-${toTopic}`;
    return transitions[key] || "¡Cambio de tema interesante! ";
}

// Función para respuestas de seguimiento en el mismo tema
function generateFollowUpResponse(topic, userInput, context) {
    const followUps = {
        openings: [
            "¡Me encanta que preguntes más sobre aperturas! ¿Quieres que te explique alguna variante específica?",
            "¡Las aperturas son fascinantes! ¿Te gustaría saber más sobre defensas o ataques en esta apertura?",
            "¿Qué te parece si profundizamos en esta apertura? Puedo contarte sobre sus ideas principales."
        ],
        pieces: [
            "¡Excelente pregunta sobre piezas! ¿Quieres que te detalle cómo se mueve alguna en particular?",
            "¡Las piezas tienen movimientos únicos! ¿Te explico alguna combinación interesante?",
            "¿Te gustaría saber más sobre el valor relativo de las piezas?"
        ],
        tactics: [
            "¡Las tácticas son emocionantes! ¿Quieres que te enseñe algún patrón común?",
            "¡Buena pregunta táctica! ¿Te muestro ejemplos de mates clásicos?",
            "¿Quieres practicar identificando amenazas tácticas?"
        ]
    };

    const responses = followUps[topic];
    return responses ? responses[Math.floor(Math.random() * responses.length)] : null;
}

// Base de conocimientos expandida sobre ajedrez (más de 200 entradas con variaciones)
const chessKnowledge = {
    // Aperturas y defensas
    "apertura": "¡Excelente pregunta! Una apertura es la fase inicial del juego de ajedrez. ♟️ Algunas aperturas populares incluyen la Apertura Italiana, la Defensa Francesa y la Apertura Española. ¿Quieres que te explique alguna en detalle?",
    "apertura italiana": "¡La Italiana es clásica! Comienza con 1.e4 e5 2.Cf3 Cc6 3.Ac4. Es una apertura que desarrolla las piezas rápidamente y prepara ataques al rey contrario. ¿Te gustaría ver algunas variantes?",
    "italiana": "¡La Italiana es clásica! Comienza con 1.e4 e5 2.Cf3 Cc6 3.Ac4. Es una apertura que desarrolla las piezas rápidamente y prepara ataques al rey contrario. ¿Te gustaría ver algunas variantes?",
    "defensa francesa": "¡La Francesa es muy sólida! Es 1.e4 e6, preparando d5. Puede llevar a posiciones cerradas pero ofrece contrajuego en el flanco de dama. Es perfecta para jugadores pacientes. 🤔",
    "francesa": "¡La Francesa es muy sólida! Es 1.e4 e6, preparando d5. Puede llevar a posiciones cerradas pero ofrece contrajuego en el flanco de dama. Es perfecta para jugadores pacientes. 🤔",
    "apertura española": "¡La Española o Ruy López es fascinante! 1.e4 e5 2.Cf3 Cc6 3.Ab5. Es una de las aperturas más antiguas y estudiadas. ¡Ha resistido el paso del tiempo! 👑",
    "española": "¡La Española o Ruy López es fascinante! 1.e4 e5 2.Cf3 Cc6 3.Ab5. Es una de las aperturas más antiguas y estudiadas. ¡Ha resistido el paso del tiempo! 👑",
    "ruy lopez": "¡La Española o Ruy López es fascinante! 1.e4 e5 2.Cf3 Cc6 3.Ab5. Es una de las aperturas más antiguas y estudiadas. ¡Ha resistido el paso del tiempo! 👑",
    "siciliana": "¡La Siciliana es mi favorita! 1.e4 c5. Es la apertura más popular entre jugadores fuertes porque ofrece un contrajuego activo inmediato. ¡Muy agresiva! 🔥",
    "defensa siciliana": "¡La Siciliana es mi favorita! 1.e4 c5. Es la apertura más popular entre jugadores fuertes porque ofrece un contrajuego activo inmediato. ¡Muy agresiva! 🔥",
    "caro kann": "¡La Caro-Kann es muy sólida! 1.e4 c6. Previene que el peón dama blanco ocupe d5 y prepara un desarrollo armonioso. Perfecta para principiantes. 👍",
    "carokann": "¡La Caro-Kann es muy sólida! 1.e4 c6. Previene que el peón dama blanco ocupe d5 y prepara un desarrollo armonioso. Perfecta para principiantes. 👍",
    "apertura del peon de dama": "¡La del Peón de Dama es estratégica! Comienza con 1.d4. Controla el centro indirectamente y es ideal para jugadores posicionales. ¿Quieres saber más sobre ella?",
    "peon dama": "¡La del Peón de Dama es estratégica! Comienza con 1.d4. Controla el centro indirectamente y es ideal para jugadores posicionales. ¿Quieres saber más sobre ella?",
    "inglesa": "¡La Inglesa es flexible! 1.c4. Puede transponer a otras aperturas y es perfecta para sorprender a tus oponentes. ¡Muy versátil! 🎭",
    "apertura inglesa": "¡La Inglesa es flexible! 1.c4. Puede transponer a otras aperturas y es perfecta para sorprender a tus oponentes. ¡Muy versátil! 🎭",
    "reti": "¡La Réti es hipermoderna! 1.Cf3. Busca controlar el centro desde las alas. ¡Muy elegante y estratégica! 🤓",
    "apertura reti": "¡La Réti es hipermoderna! 1.Cf3. Busca controlar el centro desde las alas. ¡Muy elegante y estratégica! 🤓",

    // Movimientos de piezas
    "peon": "¡Los peones son los soldados del ajedrez! ♟️ Se mueven hacia adelante una casilla (o dos en el primer movimiento) y capturan diagonalmente. ¡No pueden retroceder, así que cuídalos!",
    "peones": "¡Los peones son los soldados del ajedrez! ♟️ Son las piezas más numerosas y avanzan hacia adelante, capturando diagonalmente. ¡Su humildad es engañosa!",
    "caballo": "¡El caballo es un saltador nato! 🐎 Se mueve en L: dos casillas en una dirección y una perpendicular. ¡Puede saltar sobre otras piezas, qué elegante!",
    "caballos": "¡Los caballos son piezas menores pero astutas! 🐎 Saltan sobre otras piezas en forma de L. ¡Perfectos para ataques sorpresa!",
    "alfil": "¡El alfil es el francotirador diagonal! ⚪ Se mueve cualquier número de casillas diagonalmente. Cada uno queda confinado a casillas de un color. ¡Muy elegante!",
    "alfiles": "¡Los alfiles son los francotiradores! ⚪⚫ Se mueven diagonalmente y están confinados a un color. ¡Trabajan en pareja para controlar el tablero!",
    "torre": "¡La torre es la artillería pesada! 🏰 Se mueve horizontal o verticalmente cualquier número de casillas. ¡Poderosa en columnas abiertas!",
    "torres": "¡Las torres son la artillería pesada! 🏰 Se mueven en líneas rectas y son devastadoras en posiciones abiertas. ¡El enroque las activa!",
    "dama": "¡La dama es la reina del tablero! 👸 Combina movimientos de torre y alfil. ¡Es la pieza más poderosa, pero protégela bien!",
    "damas": "¡La dama es la reina del tablero! 👸 Es la pieza más poderosa, moviéndose en todas direcciones. ¡Un error con ella puede costar la partida!",
    "rey": "¡El rey es el objetivo final! 👑 Se mueve una casilla en cualquier dirección. ¡Debes protegerlo siempre, es la pieza más importante!",
    "reyes": "¡Los reyes son sagrados! 👑 Deben ser protegidos en todo momento. ¡El jaque mate termina el juego!",

    // Conceptos generales
    "mate": "¡Jaque mate! ⚡ Es cuando el rey está en jaque y no hay forma de escapar. ¡Eso termina la partida! ¿Quieres que te enseñe algunos mates básicos?",
    "jaque mate": "¡Jaque mate! ⚡ Es cuando el rey está en jaque y no hay forma de escapar. ¡Eso termina la partida! ¿Quieres que te enseñe algunos mates básicos?",
    "mates": "¡Los mates son el objetivo final! ⚡ Existen mates básicos y avanzados. ¿Quieres que te enseñe mates con dama y rey, o mates más complejos?",
    "mate basico": "¡Empecemos con mates básicos! El más simple es dama + rey vs rey solo. La dama controla la fila del rey enemigo mientras tu rey lo acorrala. ¡Es letal! ⚡",
    "mate dama": "¡El mate con dama es elegante! 👸 La dama controla filas y diagonales. El mate básico: Dama en la fila 7, rey propio en la 8. ¡El rey enemigo no puede escapar!",
    "mate torre": "¡El mate con torres es poderoso! 🏰 Dos torres en la misma fila crean un 'mate del pasillo'. Una torre controla la fila, la otra acorrala. ¡Muy efectivo!",
    "mate caballo": "¡El mate con caballo es especial! 🐎 El caballo controla casillas que otras piezas no pueden. ¡Perfecto para mates en esquinas!",
    "mate alfil": "¡El mate con alfiles es coordinado! ⚪⚫ Dos alfiles pueden acorralar al rey en la esquina. ¡Trabajan mejor en equipo!",
    "mate pastor": "¡El mate del pastor es clásico! ♟️ Un peón corona y el rey propio protege. ¡Un final emocionante que requiere precisión!",
    "jaque": "¡Jaque! ⚠️ El rey está bajo ataque directo. Debes mover el rey, capturar la pieza atacante o interponer otra pieza. ¡Rápido, defiéndete!",
    "enroque": "¡El enroque es mágico! 🏰 Es un movimiento especial con rey y torre. Mueve el rey dos casillas y la torre al lado opuesto. ¡Protege al rey y activa la torre!",
    "enroque corto": "¡Enroque corto! 👑 El rey va a g1/g8 y la torre a f1/f8. ¡Es el más común y rápido!",
    "enroque largo": "¡Enroque largo! 👑 El rey va a c1/c8 y la torre a d1/d8. ¡Más lento pero a veces necesario!",
    "promocion": "¡Promoción! 🎉 Cuando un peón llega a la octava fila, ¡puede convertirse en cualquier pieza excepto rey! ¿En qué lo convertirías tú?",
    "promocionar": "¡Promoción! 🎉 Cuando un peón llega a la octava fila, ¡puede convertirse en cualquier pieza excepto rey! ¿En qué lo convertirías tú?",
    "ahogado": "¡Ahogado! 🤝 Ocurre cuando no puedes mover pero no estás en jaque. ¡Resulta en tablas! Es como un empate forzado.",
    "tablas": "¡Tablas! 🤝 Pueden ocurrir por ahogado, acuerdo mutuo, repetición de posiciones o la regla de los 50 movimientos. ¡A veces salvar una partida!",
    "captura al paso": "La captura al paso permite capturar un peón enemigo que avanzó dos casillas como si solo hubiera avanzado una.",

    // Estrategia y táctica
    "control del centro": "¡El centro es el corazón del ajedrez! 🎯 Controlar e4, d4, e5, d5 es crucial para tener más espacio y movilidad. ¡Las piezas centrales dominan el tablero!",
    "centro": "¡El centro es el corazón del ajedrez! 🎯 Ahí las piezas tienen máxima movilidad. ¡Controlarlo es ganar la batalla!",
    "desarrollo": "¡Desarrollar es activar! 🚀 Sacar las piezas de sus posiciones iniciales para que participen en la batalla. ¡No las dejes dormidas!",
    "desarrollar": "¡Desarrollar es activar! 🚀 Sacar las piezas de sus posiciones iniciales para que participen en la batalla. ¡No las dejes dormidas!",
    "ataque y defensa": "¡Equilibrio perfecto! ⚖️ Un buen jugador ataca y defiende. ¡No ataques sin proteger tus piezas, o te arrepentirás!",
    "ataque": "¡El ataque debe ser calculado! ⚔️ Ten objetivos claros y asegúrate de que sea seguro. ¡La precipitación pierde partidas!",
    "defensa": "¡La defensa es el alma del ajedrez! 🛡️ Una defensa sólida es la base de un buen juego. ¡Protege tu rey y piezas!",
    "espacio": "¡Ganar espacio es conquistar! 🌍 Más territorio significa más libertad para mover tus piezas. ¡Expándete estratégicamente!",
    "tiempo": "¡El tiempo es oro! ⏰ Cada movimiento cuenta. ¡No pierdas tiempo innecesariamente, tu oponente te castigará!",
    "iniciativa": "¡La iniciativa es poder! 💪 Atacar mientras el oponente defiende. ¡Mantén el control del juego!",

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
    "como empezar": "¡Comienza tu viaje ajedrecístico! 📚 Primero aprende los movimientos básicos de las piezas, luego estudia aperturas simples como la Italiana, y ¡juega muchas partidas! ¿Quieres que te ayude con los movimientos básicos?",
    "como empezar a jugar": "¡Comienza tu viaje ajedrecístico! 📚 Primero aprende los movimientos básicos de las piezas, luego estudia aperturas simples como la Italiana, y ¡juega muchas partidas! ¿Quieres que te ayude con los movimientos básicos?",
    "mejores aperturas": "¡Depende de tu nivel! 🎯 Para principiantes: Italiana o Peón de Dama (sencillas y educativas). Para avanzados: Siciliana o Caro-Kann (más complejas pero poderosas). ¿Cuál te interesa?",
    "aperturas para principiantes": "¡Depende de tu nivel! 🎯 Para principiantes: Italiana o Peón de Dama (sencillas y educativas). Para avanzados: Siciliana o Caro-Kann (más complejas pero poderosas). ¿Cuál te interesa?",
    "reglas basicas": "¡Las reglas son simples pero profundas! 📖 Objetivo: dar jaque mate al rey contrario. Las piezas se mueven según sus reglas. ¡El rey nunca puede estar en jaque! ¿Quieres que te explique alguna pieza?",
    "reglas": "¡Las reglas son simples pero profundas! 📖 Objetivo: dar jaque mate al rey contrario. Las piezas se mueven según sus reglas. ¡El rey nunca puede estar en jaque! ¿Quieres que te explique alguna pieza?",
    "que es el ajedrez": "¡El ajedrez es arte y ciencia! 🎨 Es un juego de estrategia entre dos jugadores con 16 piezas cada uno en un tablero de 64 casillas. ¡Ha fascinado a reyes, generales y genios por siglos!",
    "objetivo del juego": "¡El objetivo es capturar el rey enemigo! 👑 Dar jaque mate significa que el rey está en jaque y no puede escapar. ¡Es el fin del juego!",
    "como ganar": "¡Gana siendo el último en pie! 🏆 Da jaque mate al rey contrario o fuerza la rendición de tu oponente. ¡La estrategia y táctica te llevarán ahí!",
    "como se juega": "¡Es un baile de piezas! 💃 Cada jugador mueve una pieza alternadamente. El objetivo es dar jaque mate al rey contrario. ¡Pero con miles de posibilidades!",

    // Más aperturas
    "nimzoindia": "¡La Nimzoindia es fascinante! 1.d4 Cf6 2.c4 e6 3.Cc3 Ab4. Es hipermoderna y pinza el caballo de las blancas. ¡Muy estratégica! 🧠",
    "defensa nimzoindia": "¡La Nimzoindia es fascinante! 1.d4 Cf6 2.c4 e6 3.Cc3 Ab4. Es hipermoderna y pinza el caballo de las blancas. ¡Muy estratégica! 🧠",
    "benoni": "¡La Benoni es para jugadores agresivos! 1.d4 c5. Busca contrajuego activo en el flanco de dama. ¡Riesgosa pero emocionante! ⚡",
    "defensa benoni": "¡La Benoni es para jugadores agresivos! 1.d4 c5. Busca contrajuego activo en el flanco de dama. ¡Riesgosa pero emocionante! ⚡",
    "holandesa": "¡La Holandesa es muy agresiva! 1.d4 f5. Es agresiva pero debilita la estructura de peones. ¡Para jugadores valientes! 🛡️",
    "defensa holandesa": "¡La Holandesa es muy agresiva! 1.d4 f5. Es agresiva pero debilita la estructura de peones. ¡Para jugadores valientes! 🛡️",
    "escandinava": "¡La Escandinava es sólida! 1.e4 d5. Es sólida pero permite a las blancas ocupar el centro. ¡Buena para contrajuego! 👍",
    "defensa escandinava": "¡La Escandinava es sólida! 1.e4 d5. Es sólida pero permite a las blancas ocupar el centro. ¡Buena para contrajuego! 👍",

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
    "kasparov": "¡Garry Kasparov es una leyenda! 🏆 Campeón mundial de 1985-2000. ¡Uno de los mejores de la historia! Su agresividad y preparación eran incomparables. ¿Sabías que derrotó a una computadora?",
    "fischer": "¡Bobby Fischer fue un genio excéntrico! 🏆 Campeón mundial en 1972. ¡Revolucionó la teoría de aperturas! Su partida contra Spassky es legendaria.",
    "carlsen": "¡Magnus Carlsen es el rey actual! 👑 Campeón mundial desde 2013. ¡Conocido por su versatilidad y finales magistrales! Juega como si leyera la mente.",
    "morphy": "¡Paul Morphy fue un prodigio! 🌟 Primer gran maestro americano en el siglo XIX. ¡Derrotó a todos los mejores jugadores europeos! Un talento natural.",
    "capablanca": "¡Capablanca fue elegante! 🎩 Campeón mundial de 1921-1927. ¡Conocido por su endgame impecable! Jugaba con tanta facilidad que parecía simple.",

    // Términos adicionales
    "blitz": "Blitz son partidas rápidas, generalmente 5 minutos o menos por jugador.",
    "rapidas": "Partidas rápidas tienen controles de tiempo de 10-60 minutos por jugador.",
    "clasico": "Ajedrez clásico tiene controles de tiempo más largos, como 90 minutos + 30 segundos por movimiento.",
    "online": "El ajedrez online permite jugar contra oponentes de todo el mundo.",
    "motor": "Un motor de ajedrez es un programa que calcula las mejores jugadas.",
    "base de datos": "Las bases de datos contienen millones de partidas para estudiar aperturas y estrategias.",

    // Más preguntas comunes
    "como mejorar": "¡Mejorar requiere dedicación! 📈 Estudia aperturas, practica táctica y domina los finales. Juega regularmente y analiza tus partidas. ¡La práctica hace al maestro! ¿Por dónde quieres empezar?",
    "mejorar en ajedrez": "¡Mejorar requiere dedicación! 📈 Estudia aperturas, practica táctica y domina los finales. Juega regularmente y analiza tus partidas. ¡La práctica hace al maestro! ¿Por dónde quieres empezar?",
    "libros recomendados": "¡Los libros son tesoros! 📚 Para principiantes: 'Aprende Ajedrez' de Rubinstein. Para avanzados: 'Mis Grandes Predecesores' de Kasparov. ¡Cada página es una lección!",
    "sitios web": "¡El mundo online del ajedrez es increíble! 🌐 Chess.com, Lichess.org, Chess24.com son excelentes para jugar y aprender. ¡Miles de jugadores te esperan!",
    "apps": "¡Las apps son perfectas para practicar! 📱 Chess by Chess.com, Lichess, y Chess Tactics Pro son muy útiles. ¡Practica táctica donde sea!",
    "que pieza mover primero": "¡Orden importa! 🎯 Generalmente, desarrolla los caballos antes que los alfiles, y ¡no muevas la dama temprano! Podría ser atacada.",
    "como calcular variantes": "¡El cálculo es un arte! 🧠 Mueve las piezas mentalmente, considera respuestas del oponente. ¡Visualiza 3-5 movimientos adelante! ¿Difícil al principio, pero se mejora!",
    "que es el elo": "¡El ELO es tu pasaporte! 🎫 Es un sistema de rating que mide la fuerza relativa de los jugadores. ¡Sube con victorias, baja con derrotas!",
    "rating": "¡El rating mide tu fuerza! 📊 Basado en resultados contra oponentes. ¡Es como un termómetro de tu habilidad ajedrecística!",
    "torneos": "¡Los torneos son emocionantes! 🏆 Pueden ser suizos, round-robin, o eliminatorios. ¡Usan sistemas de puntuación y hay premios! ¿Quieres participar en uno?",

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
    "transposicion": "¡La transposición es como un atajo! Una secuencia de movimientos que lleva a la misma posición por diferente orden. ¡Muy útil para confundir a tus oponentes! 🎭",
    "novotny": "¡El ataque Novotny es espectacular! Es un sacrificio de dama en posiciones específicas. ¡Raro pero devastador! 💥",
    "interferencia": "¡La interferencia es como poner una pared! Bloquear la acción de una pieza enemiga. ¡Genial para tácticas! 🚧",
    "desviacion": "¡La desviación es distracción máxima! Forzar a una pieza a abandonar una posición importante. ¡Divide y vencerás! 🎯",
    "sobrecarga": "¡La sobrecarga es caos controlado! Ocurre cuando una pieza debe defender múltiples amenazas. ¡Aprovecha esa debilidad! ⚖️",
    "eliminacion": "¡La eliminación del defensor es letal! Capturar o forzar a mover una pieza que protege algo importante. ¡Como quitar el soporte de un puente! 🌉",

    // Más preguntas
    "como se llama el caballo en ingles": "¡El caballo se llama 'knight' en inglés! 🐎 Es como un caballero medieval saltando sobre el tablero.",
    "que significa e4": "¡e4 es el movimiento más común! ♟️ Significa mover el peón de e2 a e4. ¡Abre diagonales y ocupa el centro!",
    "notacion algebraica": "¡La notación algebraica es el idioma del ajedrez! 📝 Usa letras para columnas (a-h) y números para filas (1-8). ¡Esencial para estudiar!",
    "notacion": "¡La notación algebraica es el idioma del ajedrez! 📝 Usa letras para columnas (a-h) y números para filas (1-8). ¡Esencial para estudiar!",
    "que es un gran maestro": "¡Un Gran Maestro es la élite! 🏆 Tiene un ELO de 2500+ y ha cumplido normas específicas. ¡Como un doctorado en ajedrez!",
    "gran maestro": "¡Un Gran Maestro es la élite! 🏆 Tiene un ELO de 2500+ y ha cumplido normas específicas. ¡Como un doctorado en ajedrez!",
    "campeon mundial": "¡El campeón mundial actual es Magnus Carlsen! 👑 Desde 2013, es el rey indiscutible. ¡Un genio estratégico!",
    "mujeres en ajedrez": "¡Las mujeres en ajedrez son increíbles! 👩‍🎨 Jugadoras destacadas incluyen Judit Polgar, Hou Yifan, y Anna Muzychuk. ¡Rompiendo barreras!",
    "ajedrez infantil": "¡El ajedrez infantil es maravilloso! 🧒 Desarrolla el pensamiento lógico, concentración y toma de decisiones en niños. ¡Un superpoder mental!",
    "ajedrez en escuelas": "¡El ajedrez en escuelas es revolucionario! 🏫 Mejora el rendimiento académico, enseña estrategia y fomenta el pensamiento crítico. ¡Más escuelas deberían tenerlo!",

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

// Respuestas por defecto con personalidad
const defaultResponses = [
    "¡Ups! Esa pregunta me pilla un poco fuera de juego. ¿Puedes preguntarme sobre aperturas, mates o movimientos de piezas? 😊",
    "Hmm, no tengo información específica sobre eso en mi repertorio de ajedrez. ¿Qué tal si hablamos de la Defensa Siciliana o el enroque? ♟️",
    "¡Buena pregunta, pero estoy especializado en ajedrez! Pregúntame sobre jaques, promociones o estrategias básicas. 🤔",
    "Mi expertise está en el tablero de ajedrez. ¿Quieres saber sobre el valor de las piezas o aperturas famosas? 👑"
];

// Memoria conversacional avanzada
let conversationMemory = {
    context: {
        lastTopic: null,
        messageCount: 0,
        userName: null,
        greeted: false,
        topicsDiscussed: new Set(),
        currentExpectation: null, // Qué espera el usuario (ej: explicación detallada, ejemplo, etc.)
        conversationFlow: [] // Flujo de la conversación
    },
    history: {
        recentMessages: [], // Últimas 10 preguntas/respuestas
        maxHistory: 10,
        topicSequence: [], // Secuencia de temas discutidos
        userPreferences: new Set() // Preferencias del usuario (ej: nivel principiante/avanzado)
    },
    state: {
        waitingForResponse: false,
        followUpExpected: false,
        lastQuestionType: null
    }
};

// Función para actualizar el historial de conversación
function updateConversationHistory(userMessage, botResponse, topic = null) {
    // Agregar al historial reciente
    conversationMemory.history.recentMessages.push({
        user: userMessage,
        bot: botResponse,
        topic: topic,
        timestamp: Date.now()
    });

    // Mantener solo las últimas N mensajes
    if (conversationMemory.history.recentMessages.length > conversationMemory.history.maxHistory) {
        conversationMemory.history.recentMessages.shift();
    }

    // Actualizar secuencia de temas
    if (topic && (conversationMemory.history.topicSequence.length === 0 ||
                  conversationMemory.history.topicSequence[conversationMemory.history.topicSequence.length - 1] !== topic)) {
        conversationMemory.history.topicSequence.push(topic);
        // Mantener solo últimas 5 transiciones
        if (conversationMemory.history.topicSequence.length > 5) {
            conversationMemory.history.topicSequence.shift();
        }
    }
}

// Función para detectar si una pregunta es de seguimiento
function isFollowUpQuestion(userInput) {
    const normalizedInput = normalizeText(userInput);
    const recentMessages = conversationMemory.history.recentMessages;

    if (recentMessages.length === 0) return false;

    const lastBotMessage = recentMessages[recentMessages.length - 1].bot.toLowerCase();

    // Detectar preguntas de seguimiento comunes
    const followUpIndicators = [
        'si', 'claro', 'por supuesto', 'exacto', 'bien', 'ok', 'dale',
        'explícame', 'dime más', 'cuéntame', 'detalles', 'ejemplos',
        'cómo', 'qué', 'cuál', 'dónde', 'cuándo'
    ];

    // Si el último mensaje del bot terminaba con pregunta y el usuario responde afirmativamente
    const botAskedQuestion = lastBotMessage.includes('?') || lastBotMessage.includes('¿');
    const userAgrees = followUpIndicators.some(indicator => normalizedInput.includes(indicator));

    return botAskedQuestion && userAgrees;
}

// Función para generar respuestas basadas en contexto conversacional
function generateContextualResponse(userInput, inferredTopic) {
    const recentMessages = conversationMemory.history.recentMessages;

    // Si es una respuesta de seguimiento
    if (isFollowUpQuestion(userInput)) {
        return generateFollowUpFromHistory(userInput);
    }

    // Si el usuario pregunta sobre algo ya discutido
    if (recentMessages.length > 0) {
        const alreadyDiscussed = checkIfTopicAlreadyDiscussed(userInput);
        if (alreadyDiscussed) {
            return generateReminderResponse(alreadyDiscussed);
        }
    }

    // Si hay un flujo de conversación esperado
    if (conversationMemory.state.followUpExpected) {
        return generateExpectedFollowUp(userInput);
    }

    return null;
}

// Función para verificar si un tema ya fue discutido
function checkIfTopicAlreadyDiscussed(userInput) {
    const normalizedInput = normalizeText(userInput);

    for (const message of conversationMemory.history.recentMessages) {
        const botResponse = normalizeText(message.bot);
        // Buscar si la respuesta contiene información similar
        if (botResponse.includes(normalizedInput) ||
            wordSimilarity(normalizedInput, botResponse) > 0.8) {
            return message;
        }
    }

    return null;
}

// Función para generar recordatorios de temas ya discutidos
function generateReminderResponse(previousMessage) {
    const reminderResponses = [
        `¡Ya hablamos de eso! ${previousMessage.bot.split('.')[0]}. ¿Quieres que profundicemos más o cambiamos de tema? 🤔`,
        `¡Recuerdo que mencioné eso! ${previousMessage.bot.split('.')[0]}. ¿Hay algo específico que quieras saber al respecto? 💭`,
        `¡Sí, lo comentamos antes! ${previousMessage.bot.split('.')[0]}. ¿Te gustaría más detalles sobre ese tema? 📚`
    ];

    return reminderResponses[Math.floor(Math.random() * reminderResponses.length)];
}

// Función para generar seguimientos basados en el historial
function generateFollowUpFromHistory(userInput) {
    const lastMessage = conversationMemory.history.recentMessages[conversationMemory.history.recentMessages.length - 1];

    // Si el último mensaje era sobre mates
    if (lastMessage.bot.includes('mate') || lastMessage.bot.includes('jaque mate')) {
        return generateMateExamples();
    }

    // Si era sobre aperturas
    if (lastMessage.topic === 'openings') {
        return generateOpeningDetails(lastMessage);
    }

    // Si era sobre piezas
    if (lastMessage.topic === 'pieces') {
        return generatePieceDetails(lastMessage);
    }

    // Respuesta genérica de seguimiento
    const followUpResponses = [
        "¡Genial! Me encanta que preguntes más. ¿Qué aspecto te interesa específicamente? 🤓",
        "¡Perfecto! Vamos a profundizar. ¿Hay algo en particular que quieras explorar? 🔍",
        "¡Excelente! Me gusta tu curiosidad. ¿Qué te gustaría saber ahora? 💡"
    ];

    return followUpResponses[Math.floor(Math.random() * followUpResponses.length)];
}

// Función para generar ejemplos de mates
function generateMateExamples() {
    const mateExamples = [
        "¡Claro! Un mate básico es con dama y rey: La dama controla la fila/hilera del rey enemigo. ¡Es letal! 👸⚔️ ¿Quieres ver otro ejemplo?",
        "¡Por supuesto! El mate del pasillo: Dos torres en la misma fila con el rey enemigo. ¡No hay escape! 🏰💥 ¿Te explico más mates?",
        "¡Genial! El mate con dos alfiles: Los alfiles acorralan al rey en la esquina. ¡Coordinación perfecta! ⚪⚫ ¿Quieres ejemplos avanzados?"
    ];

    return mateExamples[Math.floor(Math.random() * mateExamples.length)];
}

// Función para generar detalles de aperturas
function generateOpeningDetails(lastMessage) {
    const openingDetails = [
        "¡Excelente! En esta apertura, el control del centro es clave. ¿Quieres que te muestre las ideas principales de las blancas y negras? 🎯",
        "¡Perfecto! Esta apertura tiene muchas variantes. ¿Te gustaría que te explique alguna línea principal o una defensa específica? 📖",
        "¡Me encanta! Esta apertura ha evolucionado mucho. ¿Quieres saber sobre sus orígenes históricos o jugadas modernas? 🕰️"
    ];

    return openingDetails[Math.floor(Math.random() * openingDetails.length)];
}

// Función para generar detalles de piezas
function generatePieceDetails(lastMessage) {
    const pieceDetails = [
        "¡Claro! Esta pieza tiene movimientos únicos. ¿Quieres que te muestre combinaciones típicas o posiciones ventajosas? ♟️",
        "¡Genial! El valor de las piezas es relativo. ¿Te explico cómo calcular ventajas materiales o posiciones estratégicas? ⚖️",
        "¡Perfecto! Las piezas trabajan mejor en equipo. ¿Quieres ejemplos de coordinación entre piezas? 🤝"
    ];

    return pieceDetails[Math.floor(Math.random() * pieceDetails.length)];
}

// Saludos y despedidas expandidos
const greetings = ["hola", "buenos dias", "buenas tardes", "buenas noches", "hey", "hi", "saludos", "buen dia", "buenas", "que tal", "como estas", "holi"];
const goodbyes = ["adios", "hasta luego", "chau", "nos vemos", "bye", "hasta pronto", "gracias", "chao"];
const thanks = ["gracias", "thank you", "thanks", "agradecido", "muchas gracias", "te agradezco"];
const questions = ["como", "que", "cual", "cuando", "donde", "por que", "para que"];
const agreements = ["si", "claro", "por supuesto", "exacto", "correcto", "bien"];
const disagreements = ["no", "pero", "sin embargo", "aunque"];

// Respuestas para interacciones sociales con contexto
const socialResponses = {
    greeting: {
        firstTime: [
            "¡Hola! 👋 Soy tu compañero apasionado de ajedrez. ¿En qué puedo ayudarte hoy? Puedo explicarte aperturas fascinantes, mates increíbles, movimientos de piezas y mucho más. ♟️",
            "¡Buenas! 😊 Me encanta hablar de ajedrez. ¿Qué quieres saber? ¿Aperturas, tácticas, estrategia?",
            "¡Hola! 🎯 Listo para sumergirnos en el fascinante mundo del ajedrez. ¿Por dónde empezamos?"
        ],
        returning: [
            "¡Hola de nuevo! 👋 ¿Continuamos nuestra conversación sobre ajedrez?",
            "¡Qué bueno verte otra vez! 😊 ¿Qué más quieres saber sobre el ajedrez?",
            "¡Hola! ♟️ ¿Listo para más conocimientos de ajedrez?"
        ]
    },
    goodbye: [
        "¡Hasta luego! 👋 Que tengas excelentes partidas. ¡Practica lo que aprendimos!",
        "¡Nos vemos! ♟️ Recuerda: el ajedrez es paciencia y estrategia. ¡Hasta pronto!",
        "¡Adiós! 😊 Que el ajedrez te traiga muchas victorias. ¡Cuídate!",
        "¡Chao! 🎯 Fue un placer hablar de ajedrez contigo. ¡Hasta la próxima!"
    ],
    thanks: [
        "¡De nada! 😊 Siempre es un placer compartir mi pasión por el ajedrez.",
        "¡Con gusto! ♟️ ¿Hay algo más que quieras saber sobre el juego?",
        "¡Me alegra ayudar! 🤗 El ajedrez es mejor cuando se comparte. ¿Más preguntas?",
        "¡No hay de qué! 🎉 ¿Quieres que profundicemos en algún tema específico?"
    ],
    agreement: [
        "¡Exacto! 🎯",
        "¡Así es! 👍",
        "¡Perfecto! 💯",
        "¡Totalmente de acuerdo! 🤝"
    ],
    question: [
        "¡Buena pregunta! 🤔 Déjame pensar...",
        "¡Pregunta interesante! 💭",
        "¡Excelente duda! 🤓 Vamos a resolverla."
    ]
};

// Función para detectar tipo de interacción social con contexto
function detectSocialInteraction(userInput) {
    const normalizedInput = normalizeText(userInput);

    // Detectar preguntas
    for (const question of questions) {
        if (normalizedInput.includes(question)) {
            return 'question';
        }
    }

    // Detectar acuerdos
    for (const agreement of agreements) {
        if (normalizedInput.includes(agreement)) {
            return 'agreement';
        }
    }

    // Detectar saludos
    for (const greeting of greetings) {
        if (normalizedInput.includes(greeting)) {
            return conversationContext.greeted ? 'greeting_returning' : 'greeting_first';
        }
    }

    // Detectar despedidas
    for (const goodbye of goodbyes) {
        if (normalizedInput.includes(goodbye)) {
            return 'goodbye';
        }
    }

    // Detectar agradecimientos
    for (const thank of thanks) {
        if (normalizedInput.includes(thank)) {
            return 'thanks';
        }
    }

    return null;
}

// Función de distancia de Levenshtein para fuzzy matching
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Función para calcular similitud de palabras
function wordSimilarity(word1, word2) {
    const maxLen = Math.max(word1.length, word2.length);
    if (maxLen === 0) return 1;
    const distance = levenshteinDistance(word1, word2);
    return (maxLen - distance) / maxLen;
}

// Función mejorada para encontrar respuesta con memoria conversacional completa
function findResponse(userInput) {
    const normalizedInput = normalizeText(userInput);
    const inferredTopic = inferTopic(userInput);

    // Actualizar contador de mensajes
    conversationMemory.context.messageCount++;

    // Verificar interacciones sociales primero
    const socialType = detectSocialInteraction(userInput);
    if (socialType) {
        let response;
        if (socialType === 'greeting_first') {
            conversationMemory.context.greeted = true;
            response = socialResponses.greeting.firstTime[Math.floor(Math.random() * socialResponses.greeting.firstTime.length)];
        } else if (socialType === 'greeting_returning') {
            response = socialResponses.greeting.returning[Math.floor(Math.random() * socialResponses.greeting.returning.length)];
        } else if (socialType === 'question') {
            response = socialResponses.question[Math.floor(Math.random() * socialResponses.question.length)];
        } else if (socialType === 'agreement') {
            response = socialResponses.agreement[Math.floor(Math.random() * socialResponses.agreement.length)];
        } else {
            const responses = socialResponses[socialType];
            response = responses[Math.floor(Math.random() * responses.length)];
        }

        // Actualizar historial
        updateConversationHistory(userInput, response, inferredTopic);

        // Actualizar contexto si es despedida
        if (socialType === 'goodbye') {
            conversationMemory.context.greeted = false;
        }

        return response;
    }

    // Generar respuesta contextual basada en conversación previa
    const contextualResponse = generateContextualResponse(userInput, inferredTopic);
    if (contextualResponse) {
        updateConversationHistory(userInput, contextualResponse, inferredTopic);
        conversationMemory.context.lastTopic = inferredTopic;
        if (inferredTopic) {
            conversationMemory.context.topicsDiscussed.add(inferredTopic);
        }
        return contextualResponse;
    }

    // Generar respuesta coherente basada en reglas y contexto
    const coherentResponse = generateCoherentResponse(userInput, inferredTopic, conversationMemory.context);
    if (coherentResponse) {
        updateConversationHistory(userInput, coherentResponse, inferredTopic);
        conversationMemory.context.lastTopic = inferredTopic;
        if (inferredTopic) {
            conversationMemory.context.topicsDiscussed.add(inferredTopic);
        }
        return coherentResponse;
    }

    // Buscar coincidencias exactas primero
    if (chessKnowledge[normalizedInput]) {
        updateConversationHistory(userInput, chessKnowledge[normalizedInput], inferredTopic);
        conversationMemory.context.lastTopic = inferredTopic;
        if (inferredTopic) {
            conversationMemory.context.topicsDiscussed.add(inferredTopic);
        }
        return chessKnowledge[normalizedInput];
    }

    // Sistema de scoring mejorado con fuzzy matching
    let bestMatch = null;
    let bestScore = 0;
    let bestSimilarity = 0;

    const inputWords = normalizedInput.split(' ');

    for (const key in chessKnowledge) {
        const normalizedKey = normalizeText(key);
        let score = 0;
        let totalSimilarity = 0;
        let wordMatches = 0;

        // Puntuación por coincidencia exacta de palabras
        const keyWords = normalizedKey.split(' ');

        for (const inputWord of inputWords) {
            let wordScore = 0;
            let bestWordSimilarity = 0;

            for (const keyWord of keyWords) {
                // Coincidencia exacta
                if (keyWord === inputWord) {
                    wordScore = 5;
                    bestWordSimilarity = 1;
                    wordMatches++;
                    break;
                }
                // Fuzzy matching para palabras similares
                const similarity = wordSimilarity(inputWord, keyWord);
                if (similarity > bestWordSimilarity) {
                    bestWordSimilarity = similarity;
                }
                // Substrings
                if (keyWord.includes(inputWord) || inputWord.includes(keyWord)) {
                    wordScore = Math.max(wordScore, 3);
                }
            }

            // Usar fuzzy similarity si no hay coincidencia exacta
            if (wordScore === 0 && bestWordSimilarity >= 0.7) {
                wordScore = bestWordSimilarity * 4; // Puntaje basado en similitud
            }

            score += wordScore;
            totalSimilarity += bestWordSimilarity;
        }

        // Bonus por múltiples palabras coincidentes
        if (wordMatches > 1) score += wordMatches * 2;

        // Bonus por longitud similar (más flexible)
        const lengthDiff = Math.abs(normalizedInput.length - normalizedKey.length);
        if (lengthDiff <= 10) score += Math.max(0, 3 - lengthDiff * 0.3);

        // Bonus por alta similitud promedio
        const avgSimilarity = totalSimilarity / inputWords.length;
        if (avgSimilarity >= 0.6) score += avgSimilarity * 3;

        // Actualizar mejor coincidencia con umbral más bajo para fuzzy matching
        const minScore = inputWords.length >= 3 ? 3 : 2; // Más flexible para frases cortas
        if (score > bestScore && score >= minScore) {
            bestScore = score;
            bestMatch = key;
            bestSimilarity = avgSimilarity;
        }
    }

    if (bestMatch) {
        const response = chessKnowledge[bestMatch];
        updateConversationHistory(userInput, response, inferredTopic);
        conversationMemory.context.lastTopic = inferredTopic;
        if (inferredTopic) {
            conversationMemory.context.topicsDiscussed.add(inferredTopic);
        }
        return response;
    }

    // Si no encuentra, respuesta por defecto aleatoria
    const defaultResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    updateConversationHistory(userInput, defaultResponse, null);
    return defaultResponse;
}

// Función para agregar mensaje al chat
function addMessage(message, isUser = false, isTyping = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    if (isTyping) {
        messageDiv.className += ' typing-indicator';
        messageDiv.innerHTML = `<p><span class="typing-dots">Escribiendo<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span></p>`;
    } else {
        messageDiv.innerHTML = `<p>${message}</p>`;
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
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

    // Mostrar indicador de escritura
    const typingIndicator = addMessage('', false, true);

    // Simular respuesta del bot (con delay variable para naturalidad)
    const delay = 800 + Math.random() * 1200; // Entre 800ms y 2s
    setTimeout(() => {
        // Remover indicador de escritura
        typingIndicator.remove();

        const response = findResponse(message);
        addMessage(response);
    }, delay);
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