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

// Función para generar respuestas coherentes basadas en reglas y contexto por defecto
function generateCoherentResponse(userInput, inferredTopic, conversationContext) {
    const normalizedInput = normalizeText(userInput);

    // Reglas de coherencia basadas en contexto por defecto
    if (conversationContext.skillLevel === 'beginner' && !inferredTopic) {
        // Si es principiante y no hay tema claro, asumir que quiere aprender lo básico
        return generateBeginnerGuidance(userInput);
    }

    // Si el usuario parece principiante, guiarlo hacia conceptos fundamentales
    if (conversationContext.messageCount <= 3 && conversationContext.skillLevel === 'beginner') {
        return generateProgressiveLearning(userInput, conversationContext);
    }

    // Reglas de coherencia basadas en contexto
    if (conversationContext.lastTopic && inferredTopic && conversationContext.lastTopic !== inferredTopic) {
        // Si cambia de tema, hacer transición suave
        return generateTopicTransition(conversationContext.lastTopic, inferredTopic, userInput);
    }

    // Si es el mismo tema, hacer respuestas más específicas
    if (conversationContext.lastTopic === inferredTopic) {
        return generateFollowUpResponse(inferredTopic, userInput, conversationContext);
    }

    // Si no hay tema inferido pero hay contexto, usar el contexto por defecto
    if (!inferredTopic && conversationContext.lastTopic) {
        return generateContextBasedResponse(userInput, conversationContext);
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
    "mate": [
        "¡Jaque mate! ⚡ Es cuando el rey está en jaque y no hay forma de escapar. ¡Eso termina la partida!",
        "¡Jaque mate! ⚡ El rey enemigo está atacado y no puede huir. ¡Victoria total!",
        "¡Mate! ⚡ El rey está en jaque sin escapatoria posible. ¡Fin del juego!",
        "¡Jaque mate! ⚡ El rey contrario no tiene defensa. ¡Has ganado!"
    ],
    "jaque mate": [
        "¡Jaque mate! ⚡ Es cuando el rey está en jaque y no hay forma de escapar. ¡Eso termina la partida!",
        "¡Jaque mate! ⚡ El rey enemigo está atacado y no puede huir. ¡Victoria total!",
        "¡Mate! ⚡ El rey está en jaque sin escapatoria posible. ¡Fin del juego!",
        "¡Jaque mate! ⚡ El rey contrario no tiene defensa. ¡Has ganado!"
    ],
    "mates": [
        "¡Los mates son el objetivo final! ⚡ Existen mates básicos y avanzados. ¿Quieres aprender algunos?",
        "¡Los mates son fascinantes! ⚡ Cada uno tiene su propia belleza táctica. ¿Cuál te interesa?",
        "¡Los mates son el alma del ajedrez! ⚡ Desde mates simples hasta combinaciones complejas. ¿Qué tipo buscas?"
    ],
    "mate basico": [
        "¡Empecemos con mates básicos! El más simple es dama + rey vs rey solo. La dama controla la fila del rey enemigo mientras tu rey lo acorrala. ¡Es letal! ⚡",
        "¡Mate básico! Dama en la fila 7, rey propio en la 8. El rey enemigo no puede escapar de la fila 8. ¡Victoria sencilla!",
        "¡Mate elemental! Dama controla la fila, rey acorrala. El rey contrario queda atrapado en la última fila. ¡Fácil pero efectivo!"
    ],
    "mate dama": [
        "¡El mate con dama es elegante! 👸 La dama controla filas y diagonales. El mate básico: Dama en la fila 7, rey propio en la 8. ¡El rey enemigo no puede escapar!",
        "¡Mate de dama! 👸 Es letal porque controla tanto filas como diagonales. ¡El rey no tiene dónde esconderse!",
        "¡Dama mate! 👸 La pieza más poderosa para mates. Controla todo el tablero. ¡Imparable!"
    ],
    "mate torre": [
        "¡El mate con torres es poderoso! 🏰 Dos torres en la misma fila crean un 'mate del pasillo'. Una torre controla la fila, la otra acorrala. ¡Muy efectivo!",
        "¡Mate de torres! 🏰 Dos torres coordinadas son devastadoras. Una controla la fila del rey, la otra lo empuja. ¡Sin escapatoria!",
        "¡Torres mate! 🏰 Cuando dos torres trabajan juntas, crean un pasillo mortal. ¡El rey queda atrapado!"
    ],
    "mate caballo": [
        "¡El mate con caballo es especial! 🐎 El caballo controla casillas que otras piezas no pueden. ¡Perfecto para mates en esquinas!",
        "¡Mate de caballo! 🐎 El caballo salta sobre las piezas y controla casillas alternas. ¡Ideal para mates en bordes!",
        "¡Caballo mate! 🐎 Su movimiento en L lo hace perfecto para mates en esquinas donde el rey queda atrapado. ¡Muy táctico!"
    ],
    "mate alfil": [
        "¡El mate con alfiles es coordinado! ⚪⚫ Dos alfiles pueden acorralar al rey en la esquina. ¡Trabajan mejor en equipo!",
        "¡Mate de alfiles! ⚪⚫ Los alfiles controlan diagonales del mismo color. ¡Juntos son imparables!",
        "¡Alfiles mate! ⚪⚫ Dos alfiles coordinados crean una red diagonal mortal. ¡El rey no puede escapar!"
    ],
    "mate pastor": [
        "¡El mate del pastor es clásico! ♟️ Un peón corona y el rey propio protege. ¡Un final emocionante que requiere precisión!",
        "¡Mate pastor! ♟️ El peón corona en la octava fila y se convierte en dama. ¡El rey enemigo no puede detenerlo!",
        "¡Pastor mate! ♟️ Un peón que llega a la octava fila se corona. ¡Si el rey contrario no puede impedirlo, es mate!"
    ],
    "jaque": [
        "¡Jaque! ⚠️ El rey está bajo ataque directo. Debes mover el rey, capturar la pieza atacante o interponer otra pieza. ¡Rápido, defiéndete!",
        "¡Jaque! ⚠️ Tu rey está en peligro. ¡Mueve el rey, captura la amenaza o interpón una pieza!",
        "¡Jaque! ⚠️ El rey enemigo ataca. ¡Defiéndete inmediatamente!"
    ],
    "enroque": [
        "¡El enroque es mágico! 🏰 Es un movimiento especial con rey y torre. Mueve el rey dos casillas y la torre al lado opuesto. ¡Protege al rey y activa la torre!",
        "¡Enroque! 🏰 Rey y torre se mueven juntos. ¡Es la mejor forma de proteger al rey!",
        "¡Enroque! 🏰 Un movimiento especial que pone al rey a salvo y activa la torre. ¡Esencial en casi todas las partidas!"
    ],
    "enroque corto": [
        "¡Enroque corto! 👑 El rey va a g1/g8 y la torre a f1/f8. ¡Es el más común y rápido!",
        "¡Enroque corto! 👑 Rey a g1/g8, torre a f1/f8. ¡Rápido y seguro!",
        "¡Enroque corto! 👑 El movimiento más popular. ¡Rey protegido en segundos!"
    ],
    "enroque largo": [
        "¡Enroque largo! 👑 El rey va a c1/c8 y la torre a d1/d8. ¡Más lento pero a veces necesario!",
        "¡Enroque largo! 👑 Rey a c1/c8, torre a d1/d8. ¡Útil cuando el flanco de rey está comprometido!",
        "¡Enroque largo! 👑 Menos común pero estratégico. ¡A veces la mejor opción!"
    ],
    "promocion": [
        "¡Promoción! 🎉 Cuando un peón llega a la octava fila, ¡puede convertirse en cualquier pieza excepto rey! ¿En qué lo convertirías tú?",
        "¡Promoción! 🎉 El peón llega a la octava fila y ¡se transforma! ¿Dama, torre, caballo o alfil?",
        "¡Promoción! 🎉 Un peón en la octava fila se corona. ¡Elige sabiamente tu nueva pieza!"
    ],
    "promocionar": [
        "¡Promoción! 🎉 Cuando un peón llega a la octava fila, ¡puede convertirse en cualquier pieza excepto rey! ¿En qué lo convertirías tú?",
        "¡Promoción! 🎉 El peón llega a la octava fila y ¡se transforma! ¿Dama, torre, caballo o alfil?",
        "¡Promoción! 🎉 Un peón en la octava fila se corona. ¡Elige sabiamente tu nueva pieza!"
    ],
    "ahogado": [
        "¡Ahogado! 🤝 Ocurre cuando no puedes mover pero no estás en jaque. ¡Resulta en tablas! Es como un empate forzado.",
        "¡Ahogado! 🤝 No puedes mover ninguna pieza pero no estás en jaque. ¡Tablas automáticas!",
        "¡Ahogado! 🤝 Una posición de tablas donde no hay movimientos legales. ¡Un empate inesperado!"
    ],
    "tablas": [
        "¡Tablas! 🤝 Pueden ocurrir por ahogado, acuerdo mutuo, repetición de posiciones o la regla de los 50 movimientos. ¡A veces salvar una partida!",
        "¡Tablas! 🤝 Ahogado, repetición, regla de 50 movimientos o acuerdo. ¡No siempre es derrota!",
        "¡Tablas! 🤝 Hay varias formas: ahogado, repetición, regla 50, o acuerdo mutuo. ¡Un resultado válido!"
    ],
    "captura al paso": [
        "La captura al paso permite capturar un peón enemigo que avanzó dos casillas como si solo hubiera avanzado una.",
        "¡Captura al paso! ♟️ Si un peón avanza dos casillas, puedes capturarlo como si solo hubiera avanzado una.",
        "¡Captura al paso! ♟️ Una regla especial para peones. ¡Captura diagonalmente aunque el peón esté a tu lado!"
    ],
    "enroque": [
        "¡El enroque es mágico! 🏰 Es un movimiento especial con rey y torre. Mueve el rey dos casillas y la torre al lado opuesto. ¡Protege al rey y activa la torre!",
        "¡Enroque! 🏰 Rey y torre se mueven juntos. ¡Es la mejor forma de proteger al rey!",
        "¡Enroque! 🏰 Un movimiento especial que pone al rey a salvo y activa la torre. ¡Esencial en casi todas las partidas!"
    ],
    "enroque corto": [
        "¡Enroque corto! 👑 El rey va a g1/g8 y la torre a f1/f8. ¡Es el más común y rápido!",
        "¡Enroque corto! 👑 Rey a g1/g8, torre a f1/f8. ¡Rápido y seguro!",
        "¡Enroque corto! 👑 El movimiento más popular. ¡Rey protegido en segundos!"
    ],
    "enroque largo": [
        "¡Enroque largo! 👑 El rey va a c1/c8 y la torre a d1/d8. ¡Más lento pero a veces necesario!",
        "¡Enroque largo! 👑 Rey a c1/c8, torre a d1/d8. ¡Útil cuando el flanco de rey está comprometido!",
        "¡Enroque largo! 👑 Menos común pero estratégico. ¡A veces la mejor opción!"
    ],
    "promocion": [
        "¡Promoción! 🎉 Cuando un peón llega a la octava fila, ¡puede convertirse en cualquier pieza excepto rey! ¿En qué lo convertirías tú?",
        "¡Promoción! 🎉 El peón llega a la octava fila y ¡se transforma! ¿Dama, torre, caballo o alfil?",
        "¡Promoción! 🎉 Un peón en la octava fila se corona. ¡Elige sabiamente tu nueva pieza!"
    ],
    "promocionar": [
        "¡Promoción! 🎉 Cuando un peón llega a la octava fila, ¡puede convertirse en cualquier pieza excepto rey! ¿En qué lo convertirías tú?",
        "¡Promoción! 🎉 El peón llega a la octava fila y ¡se transforma! ¿Dama, torre, caballo o alfil?",
        "¡Promoción! 🎉 Un peón en la octava fila se corona. ¡Elige sabiamente tu nueva pieza!"
    ],
    "ahogado": [
        "¡Ahogado! 🤝 Ocurre cuando no puedes mover pero no estás en jaque. ¡Resulta en tablas! Es como un empate forzado.",
        "¡Ahogado! 🤝 No puedes mover ninguna pieza pero no estás en jaque. ¡Tablas automáticas!",
        "¡Ahogado! 🤝 Una posición de tablas donde no hay movimientos legales. ¡Un empate inesperado!"
    ],
    "tablas": [
        "¡Tablas! 🤝 Pueden ocurrir por ahogado, acuerdo mutuo, repetición de posiciones o la regla de los 50 movimientos. ¡A veces salvar una partida!",
        "¡Tablas! 🤝 Ahogado, repetición, regla de 50 movimientos o acuerdo. ¡No siempre es derrota!",
        "¡Tablas! 🤝 Hay varias formas: ahogado, repetición, regla 50, o acuerdo mutuo. ¡Un resultado válido!"
    ],
    "captura al paso": [
        "La captura al paso permite capturar un peón enemigo que avanzó dos casillas como si solo hubiera avanzado una.",
        "¡Captura al paso! ♟️ Si un peón avanza dos casillas, puedes capturarlo como si solo hubiera avanzado una.",
        "¡Captura al paso! ♟️ Una regla especial para peones. ¡Captura diagonalmente aunque el peón esté a tu lado!"
    ],

    // Más términos comunes que faltaban
    "mate pastor": [
        "¡El mate del pastor es clásico! ♟️ Un peón corona y el rey propio protege. ¡Un final emocionante que requiere precisión!",
        "¡Mate pastor! ♟️ El peón corona en la octava fila y se convierte en dama. ¡El rey enemigo no puede detenerlo!",
        "¡Pastor mate! ♟️ Un peón que llega a la octava fila se corona. ¡Si el rey contrario no puede impedirlo, es mate!"
    ],
    "defensa karo kann": [
        "¡La Caro-Kann es muy sólida! 1.e4 c6. Previene que el peón dama blanco ocupe d5 y prepara un desarrollo armonioso. Perfecta para principiantes. 👍",
        "¡Caro-Kann! 1.e4 c6. ¡Defensa sólida que evita d5 blanco! Desarrollo tranquilo y seguro.",
        "¡Defensa Caro-Kann! 1.e4 c6. ¡Bloquea el centro y prepara desarrollo. Muy posicional!"
    ],
    "karokann": [
        "¡La Caro-Kann es muy sólida! 1.e4 c6. Previene que el peón dama blanco ocupe d5 y prepara un desarrollo armonioso. Perfecta para principiantes. 👍",
        "¡Caro-Kann! 1.e4 c6. ¡Defensa sólida que evita d5 blanco! Desarrollo tranquilo y seguro.",
        "¡Defensa Caro-Kann! 1.e4 c6. ¡Bloquea el centro y prepara desarrollo. Muy posicional!"
    ],
    "mate rey": [
        "¡El mate con rey es fundamental! 👑 El rey controla casillas adyacentes y es la pieza más valiosa. ¡Protégelo siempre!",
        "¡Rey mate! 👑 El rey se mueve una casilla en cualquier dirección. ¡Es la pieza más importante!",
        "¡Mate rey! 👑 El objetivo final del juego. ¡Capturar el rey enemigo gana la partida!"
    ],
    "rey mate": [
        "¡El mate con rey es fundamental! 👑 El rey controla casillas adyacentes y es la pieza más valiosa. ¡Protégelo siempre!",
        "¡Rey mate! 👑 El rey se mueve una casilla en cualquier dirección. ¡Es la pieza más importante!",
        "¡Mate rey! 👑 El objetivo final del juego. ¡Capturar el rey enemigo gana la partida!"
    ]
    ,
    // Estrategia y táctica
    "control del centro": [
        "¡El centro es el corazón del ajedrez! 🎯 Controlar e4, d4, e5, d5 es crucial para tener más espacio y movilidad. ¡Las piezas centrales dominan el tablero!",
        "¡El centro es clave! 🎯 e4, d4, e5, d5 son las casillas vitales. ¡Controla el centro, controla el juego!",
        "¡Centro del tablero! 🎯 Ahí las piezas tienen máxima potencia. ¡Ocuparlo es fundamental!"
    ],
    "centro": [
        "¡El centro es el corazón del ajedrez! 🎯 Ahí las piezas tienen máxima movilidad. ¡Controlarlo es ganar la batalla!",
        "¡Centro del tablero! 🎯 Las casillas centrales dan poder a todas las piezas. ¡Objetivo principal!",
        "¡El centro es poder! 🎯 Controla e4, d4, e5, d5 y tendrás ventaja. ¡Esencial!"
    ],
    "desarrollo": [
        "¡Desarrollar es activar! 🚀 Sacar las piezas de sus posiciones iniciales para que participen en la batalla. ¡No las dejes dormidas!",
        "¡Desarrollo rápido! 🚀 Caballos antes que alfiles, no muevas la dama temprano. ¡Activa tus piezas!",
        "¡Desarrollar piezas! 🚀 Cada pieza en su mejor casilla. ¡El desarrollo temprano es clave!"
    ],
    "desarrollar": [
        "¡Desarrollar es activar! 🚀 Sacar las piezas de sus posiciones iniciales para que participen en la batalla. ¡No las dejes dormidas!",
        "¡Desarrollo rápido! 🚀 Caballos antes que alfiles, no muevas la dama temprano. ¡Activa tus piezas!",
        "¡Desarrollar piezas! 🚀 Cada pieza en su mejor casilla. ¡El desarrollo temprano es clave!"
    ],
    "ataque y defensa": [
        "¡Equilibrio perfecto! ⚖️ Un buen jugador ataca y defiende. ¡No ataques sin proteger tus piezas, o te arrepentirás!",
        "¡Ataque y defensa! ⚖️ Debes hacer ambas cosas bien. ¡Equilibra agresión con seguridad!",
        "¡Ofensiva y defensiva! ⚖️ Ataca cuando sea seguro, defiende cuando sea necesario. ¡Balance perfecto!"
    ],
    "ataque": [
        "¡El ataque debe ser calculado! ⚔️ Ten objetivos claros y asegúrate de que sea seguro. ¡La precipitación pierde partidas!",
        "¡Ataque inteligente! ⚔️ Calcula variantes, protege tus piezas. ¡Un buen ataque es imparable!",
        "¡Atacar con cabeza! ⚔️ Busca debilidades, calcula consecuencias. ¡El ataque debe ser sólido!"
    ],
    "defensa": [
        "¡La defensa es el alma del ajedrez! 🛡️ Una defensa sólida es la base de un buen juego. ¡Protege tu rey y piezas!",
        "¡Defensa sólida! 🛡️ Rey seguro, piezas protegidas. ¡La mejor defensa es un buen ataque!",
        "¡Defender bien! 🛡️ Anticipa amenazas, protege puntos débiles. ¡Defensa preventiva!"
    ],
    "espacio": [
        "¡Ganar espacio es conquistar! 🌍 Más territorio significa más libertad para mover tus piezas. ¡Expándete estratégicamente!",
        "¡Espacio en el tablero! 🌍 Más casillas para moverte significa más opciones. ¡Expándete!",
        "¡Ganar territorio! 🌍 Controla más casillas, limita al oponente. ¡El espacio es ventaja!"
    ],
    "tiempo": [
        "¡El tiempo es oro! ⏰ Cada movimiento cuenta. ¡No pierdas tiempo innecesariamente, tu oponente te castigará!",
        "¡Tiempo en ajedrez! ⏰ Cada jugada importa. ¡Movimientos lentos dan ventaja al rival!",
        "¡No pierdas tiempo! ⏰ Cada movimiento debe tener propósito. ¡La inactividad es peligrosa!"
    ],
    "iniciativa": [
        "¡La iniciativa es poder! 💪 Atacar mientras el oponente defiende. ¡Mantén el control del juego!",
        "¡Iniciativa! 💪 Atacar mientras defienden. ¡Controla el ritmo de la partida!",
        "¡Tomar iniciativa! 💪 Ataca, amenaza, presiona. ¡No dejes que el rival dicte el juego!"
    ],

    // Términos avanzados
    "zugzwang": [
        "¡Zugzwang! 😰 Es cuando cualquier movimiento que hagas empeora tu posición. ¡Una situación terrible!",
        "¡Zugzwang! 😰 Cualquier jugada legal hace tu posición peor. ¡Muy frustrante!",
        "¡Zugzwang! 😰 No puedes mover sin perjudicarte. ¡Una posición desesperada!"
    ],
    "zwischenzug": [
        "¡Zwischenzug! 🎭 Un movimiento intermedio que interrumpe la secuencia lógica del oponente. ¡Muy astuto!",
        "¡Zwischenzug! 🎭 Un movimiento sorpresa entre los movimientos esperados. ¡Rompe los planes!",
        "¡Zwischenzug! 🎭 Intercalar un movimiento que cambia todo. ¡Tácticas avanzadas!"
    ],
    "clavada": [
        "¡Clavada! 📌 Una pieza no puede moverse porque protegería a una pieza más valiosa detrás. ¡Inmovilizada!",
        "¡Clavada! 📌 La pieza está 'clavada' protegiendo a otra más importante. ¡No puede escapar!",
        "¡Clavada! 📌 Una pieza inmóvil porque moverla expondría a una pieza valiosa. ¡Táctica clásica!"
    ],
    "clavar": [
        "¡Clavada! 📌 Una pieza no puede moverse porque protegería a una pieza más valiosa detrás. ¡Inmovilizada!",
        "¡Clavada! 📌 La pieza está 'clavada' protegiendo a otra más importante. ¡No puede escapar!",
        "¡Clavada! 📌 Una pieza inmóvil porque moverla expondría a una pieza valiosa. ¡Táctica clásica!"
    ],
    "descubierto": [
        "¡Ataque descubierto! 💥 Una pieza se mueve revelando un ataque oculto de otra pieza. ¡Sorpresa letal!",
        "¡Descubierto! 💥 Mueves una pieza y revelas un ataque escondido. ¡Amenaza doble!",
        "¡Ataque descubierto! 💥 Una pieza se mueve y descubre un ataque mortal. ¡Muy peligroso!"
    ],
    "rayos x": [
        "¡Rayos X! 🔍 Una pieza ataca a través de otra pieza enemiga. ¡Como ver a través de las piezas!",
        "¡Rayos X! 🔍 Ataque que atraviesa piezas enemigas. ¡Amenaza invisible!",
        "¡Rayos X! 🔍 Una pieza ataca pasando por encima de otras. ¡Difícil de ver!"
    ],
    "sacrificio": [
        "¡Sacrificio! 🎁 Entregar material voluntariamente para obtener ventaja posicional o táctica. ¡Inversión estratégica!",
        "¡Sacrificio! 🎁 Dar una pieza para conseguir algo mejor. ¡A veces necesario para ganar!",
        "¡Sacrificio! 🎁 Entregar material por compensación. ¡El ajedrez es sacrificio y ganancia!"
    ],
    "sacrificar": [
        "¡Sacrificio! 🎁 Entregar material voluntariamente para obtener ventaja posicional o táctica. ¡Inversión estratégica!",
        "¡Sacrificio! 🎁 Dar una pieza para conseguir algo mejor. ¡A veces necesario para ganar!",
        "¡Sacrificio! 🎁 Entregar material por compensación. ¡El ajedrez es sacrificio y ganancia!"
    ],

    // Valor de las piezas
    "valor piezas": [
        "¡Valor de las piezas! ⚖️ Peón=1, Caballo/Alfil=3, Torre=5, Dama=9. El rey es invaluable.",
        "¡Valor relativo! ⚖️ Peones valen 1, menores (caballo/alfil) 3, torres 5, dama 9. ¡Rey priceless!",
        "¡Puntos de las piezas! ⚖️ Peón:1, Caballo/Alfil:3, Torre:5, Dama:9. ¡Rey incalculable!"
    ],
    "puntos": [
        "¡Valor de las piezas! ⚖️ Peón=1, Caballo/Alfil=3, Torre=5, Dama=9. El rey es invaluable.",
        "¡Valor relativo! ⚖️ Peones valen 1, menores (caballo/alfil) 3, torres 5, dama 9. ¡Rey priceless!",
        "¡Puntos de las piezas! ⚖️ Peón:1, Caballo/Alfil:3, Torre:5, Dama:9. ¡Rey incalculable!"
    ],
    "puntuacion": [
        "¡Puntuación en torneos! 🏆 Ganar=1 punto, tablas=0.5 para cada uno, perder=0. ¡Así se decide el campeón!",
        "¡Sistema de puntos! 🏆 Victoria vale 1, empate 0.5 cada uno. ¡Así funcionan los torneos!",
        "¡Puntuación! 🏆 Ganar: 1 punto, tablas: 0.5 cada jugador, perder: 0. ¡Competencia justa!"
    ],
    "cuanto vale ganar": [
        "¡Ganar vale 1 punto! 🏆 En torneos, tablas valen 0.5 para cada jugador. ¡Perder no da puntos!",
        "¡Victoria = 1 punto! 🏆 Tablas = 0.5 cada uno. ¡Así se acumulan puntos en torneos!",
        "¡Ganar partida = 1 punto! 🏆 Empate = 0.5 para ambos. ¡Perder = 0 puntos!"
    ],
    "puntos por ganar": [
        "¡Ganar vale 1 punto! 🏆 Tablas valen 0.5 puntos para cada jugador. ¡Sistema justo!",
        "¡Puntuación por partida! 🏆 Victoria: 1 punto, empate: 0.5 cada uno, derrota: 0.",
        "¡Así se puntúa! 🏆 Ganar: 1, tablas: 0.5 cada jugador, perder: 0. ¡Competencia!"
    ],

    // Preguntas comunes
    "como empezar": [
        "¡Comienza tu viaje ajedrecístico! 📚 Primero aprende los movimientos básicos de las piezas, luego estudia aperturas simples como la Italiana, y ¡juega muchas partidas!",
        "¡Primeros pasos! 📚 Aprende movimientos de piezas, reglas básicas, luego juega. ¡La práctica es clave!",
        "¡Comienza aquí! 📚 Movimientos básicos → reglas → aperturas simples → ¡jugar mucho!"
    ],
    "como empezar a jugar": [
        "¡Comienza tu viaje ajedrecístico! 📚 Primero aprende los movimientos básicos de las piezas, luego estudia aperturas simples como la Italiana, y ¡juega muchas partidas!",
        "¡Primeros pasos! 📚 Aprende movimientos de piezas, reglas básicas, luego juega. ¡La práctica es clave!",
        "¡Comienza aquí! 📚 Movimientos básicos → reglas → aperturas simples → ¡jugar mucho!"
    ],
    "mejores aperturas": [
        "¡Depende de tu nivel! 🎯 Para principiantes: Italiana o Peón de Dama (sencillas y educativas). Para avanzados: Siciliana o Caro-Kann (más complejas pero poderosas).",
        "¡Aperturas según nivel! 🎯 Novatos: Italiana, Española. Intermedios: Siciliana. Avanzados: Najdorf, Berlinesa.",
        "¡Escoge por estilo! 🎯 Si te gusta atacar: Italiana. Si prefieres sólido: Caro-Kann. ¡Encuentra tu apertura!"
    ],
    "aperturas para principiantes": [
        "¡Depende de tu nivel! 🎯 Para principiantes: Italiana o Peón de Dama (sencillas y educativas). Para avanzados: Siciliana o Caro-Kann (más complejas pero poderosas).",
        "¡Aperturas según nivel! 🎯 Novatos: Italiana, Española. Intermedios: Siciliana. Avanzados: Najdorf, Berlinesa.",
        "¡Escoge por estilo! 🎯 Si te gusta atacar: Italiana. Si prefieres sólido: Caro-Kann. ¡Encuentra tu apertura!"
    ],
    "reglas basicas": [
        "¡Las reglas son simples pero profundas! 📖 Objetivo: dar jaque mate al rey contrario. Las piezas se mueven según sus reglas. ¡El rey nunca puede estar en jaque!",
        "¡Reglas fundamentales! 📖 Jaque mate gana. Piezas tienen movimientos específicos. Rey no puede estar en jaque. ¡Eso es lo básico!",
        "¡Reglas esenciales! 📖 Dar mate al rey enemigo. Cada pieza se mueve de forma única. ¡Rey siempre protegido!"
    ],
    "reglas": [
        "¡Las reglas son simples pero profundas! 📖 Objetivo: dar jaque mate al rey contrario. Las piezas se mueven según sus reglas. ¡El rey nunca puede estar en jaque!",
        "¡Reglas fundamentales! 📖 Jaque mate gana. Piezas tienen movimientos específicos. Rey no puede estar en jaque. ¡Eso es lo básico!",
        "¡Reglas esenciales! 📖 Dar mate al rey enemigo. Cada pieza se mueve de forma única. ¡Rey siempre protegido!"
    ],
    "que es el ajedrez": [
        "¡El ajedrez es arte y ciencia! 🎨 Es un juego de estrategia entre dos jugadores con 16 piezas cada uno en un tablero de 64 casillas. ¡Ha fascinado a reyes, generales y genios por siglos!",
        "¡Ajedrez: guerra mental! 🧠 Dos jugadores, 16 piezas cada uno, tablero 8x8. ¡Objetivo: capturar el rey enemigo!",
        "¡Ajedrez: el juego rey! 👑 Estrategia pura entre dos mentes. ¡32 piezas en 64 casillas, infinitas posibilidades!"
    ],
    "objetivo del juego": [
        "¡El objetivo es capturar el rey enemigo! 👑 Dar jaque mate significa que el rey está en jaque y no puede escapar. ¡Es el fin del juego!",
        "¡Objetivo: jaque mate! ⚡ Capturar el rey contrario. ¡El rey no puede ser capturado, pero sí acorralado!",
        "¡Ganar dando mate! 👑 El rey enemigo debe estar en jaque sin escapatoria. ¡Eso termina la partida!"
    ],
    "como ganar": [
        "¡Gana siendo el último en pie! 🏆 Da jaque mate al rey contrario o fuerza la rendición de tu oponente. ¡La estrategia y táctica te llevarán ahí!",
        "¡Gana con jaque mate! 🏆 O cuando tu rival se rinde. ¡Mejor posición + mejor técnica = victoria!",
        "¡Victoria por mate! 🏆 O rendición del oponente. ¡Construye ventaja y ataca cuando sea seguro!"
    ],
    "como se juega": [
        "¡Es un baile de piezas! 💃 Cada jugador mueve una pieza alternadamente. El objetivo es dar jaque mate al rey contrario. ¡Pero con miles de posibilidades!",
        "¡Juegan alternadamente! 🔄 Blancas primero. Cada movimiento debe ser legal. ¡Objetivo: mate al rey!",
        "¡Turnos alternos! ↔️ Blancas empiezan. Mueven una pieza por turno. ¡Gana quien dé jaque mate!"
    ],

    // Más aperturas
    "nimzoindia": [
        "¡La Nimzoindia es fascinante! 1.d4 Cf6 2.c4 e6 3.Cc3 Ab4. Es hipermoderna y pinza el caballo de las blancas. ¡Muy estratégica! 🧠",
        "¡Nimzoindia! 🧠 Hipermoderna clásica. El alfil negro pinza el caballo blanco. ¡Control posicional!",
        "¡Defensa Nimzoindia! 🧠 1.d4 Cf6 2.c4 e6 3.Cc3 Ab4. ¡Pinza y desarrolla! Estratégica pura."
    ],
    "defensa nimzoindia": [
        "¡La Nimzoindia es fascinante! 1.d4 Cf6 2.c4 e6 3.Cc3 Ab4. Es hipermoderna y pinza el caballo de las blancas. ¡Muy estratégica! 🧠",
        "¡Nimzoindia! 🧠 Hipermoderna clásica. El alfil negro pinza el caballo blanco. ¡Control posicional!",
        "¡Defensa Nimzoindia! 🧠 1.d4 Cf6 2.c4 e6 3.Cc3 Ab4. ¡Pinza y desarrolla! Estratégica pura."
    ],
    "benoni": [
        "¡La Benoni es para jugadores agresivos! 1.d4 c5. Busca contrajuego activo en el flanco de dama. ¡Riesgosa pero emocionante! ⚡",
        "¡Benoni! ⚡ Contrajuego inmediato. Las negras atacan el centro desde el flanco. ¡Muy combativa!",
        "¡Defensa Benoni! ⚡ 1.d4 c5. ¡Las negras contraatacan desde el principio! Para jugadores valientes."
    ],
    "defensa benoni": [
        "¡La Benoni es para jugadores agresivos! 1.d4 c5. Busca contrajuego activo en el flanco de dama. ¡Riesgosa pero emocionante! ⚡",
        "¡Benoni! ⚡ Contrajuego inmediato. Las negras atacan el centro desde el flanco. ¡Muy combativa!",
        "¡Defensa Benoni! ⚡ 1.d4 c5. ¡Las negras contraatacan desde el principio! Para jugadores valientes."
    ],
    "holandesa": [
        "¡La Holandesa es muy agresiva! 1.d4 f5. Es agresiva pero debilita la estructura de peones. ¡Para jugadores valientes! 🛡️",
        "¡Holandesa! 🛡️ f5 inmediato. ¡Agresiva pero arriesgada! La estructura de peones se debilita.",
        "¡Defensa Holandesa! 🛡️ 1.d4 f5. ¡Las negras contraatacan en el flanco rey! Muy agresiva."
    ],
    "defensa holandesa": [
        "¡La Holandesa es muy agresiva! 1.d4 f5. Es agresiva pero debilita la estructura de peones. ¡Para jugadores valientes! 🛡️",
        "¡Holandesa! 🛡️ f5 inmediato. ¡Agresiva pero arriesgada! La estructura de peones se debilita.",
        "¡Defensa Holandesa! 🛡️ 1.d4 f5. ¡Las negras contraatacan en el flanco rey! Muy agresiva."
    ],
    "escandinava": [
        "¡La Escandinava es sólida! 1.e4 d5. Es sólida pero permite a las blancas ocupar el centro. ¡Buena para contrajuego! 👍",
        "¡Escandinava! 👍 d5 contra e4. ¡Sólida pero las blancas controlan el centro!",
        "¡Defensa Escandinava! 👍 1.e4 d5. ¡Las negras capturan el peón central! Contrajuego inmediato."
    ],
    "defensa escandinava": [
        "¡La Escandinava es sólida! 1.e4 d5. Es sólida pero permite a las blancas ocupar el centro. ¡Buena para contrajuego! 👍",
        "¡Escandinava! 👍 d5 contra e4. ¡Sólida pero las blancas controlan el centro!",
        "¡Defensa Escandinava! 👍 1.e4 d5. ¡Las negras capturan el peón central! Contrajuego inmediato."
    ],

    // Más conceptos
    "gambito": [
        "¡Gambito! 🎁 Sacrificar un peón o pieza para obtener ventaja en desarrollo o ataque. ¡Inversión táctica!",
        "¡Gambito! 🎁 Dar material por compensación. ¡Desarrollo rápido o ataque fuerte!",
        "¡Gambito! 🎁 Sacrificio por iniciativa. ¡Las blancas a menudo gambitean peones por desarrollo!"
    ],
    "contraataque": [
        "¡Contraataque! ⚔️ Responder a un ataque con un ataque propio. ¡La mejor defensa es un buen ataque!",
        "¡Contraataque! ⚔️ Atacar mientras te atacan. ¡Sorprende a tu oponente!",
        "¡Contraataque! ⚔️ Responder agresivamente. ¡No solo defiendas, ¡ataca tú también!"
    ],
    "presion": [
        "¡Presión! 💪 Mantener amenazas constantes sobre el oponente. ¡No dejes que respire!",
        "¡Presión constante! 💪 Amenazas que obligan a defender. ¡Mantén la iniciativa!",
        "¡Presión! 💪 Amenazas continuas que limitan las opciones del rival. ¡Controla el juego!"
    ],
    "ventaja": [
        "¡Ventaja! ✅ Puede ser material, posicional o de desarrollo. ¡Aprovecha cualquier superioridad!",
        "¡Ventaja! ✅ Material (más piezas), posicional (mejor estructura), desarrollo (piezas más activas).",
        "¡Ventaja! ✅ Tres tipos: material, posicional, desarrollo. ¡Convierte una en las otras!"
    ],
    "desventaja": [
        "¡Desventaja! ❌ Puede ser material, posicional o de desarrollo. ¡Compensa o defiende!",
        "¡Desventaja! ❌ Menos piezas, peor posición, desarrollo atrasado. ¡Busca compensación!",
        "¡Desventaja! ❌ Tres tipos principales. ¡A veces se puede compensar con actividad!"
    ],
    "compensacion": [
        "¡Compensación! ⚖️ Ventaja posicional que equilibra desventaja material. ¡Actividad por material!",
        "¡Compensación! ⚖️ Cuando la actividad compensa la desventaja material. ¡Iniciativa vale piezas!",
        "¡Compensación! ⚖️ Posición fuerte que vale el material sacrificado. ¡Ataque por peones!"
    ],
    "estructura de peones": [
        "¡Estructura de peones! 🏗️ Determina la estrategia del medio juego. ¡Isolados, doblados, cadena!",
        "¡Peones! 🏗️ Su disposición determina el plan estratégico. ¡Débil o fuerte según configuración!",
        "¡Estructura! 🏗️ Los peones son el esqueleto de la posición. ¡Planifica según su formación!"
    ],
    "peones doblados": [
        "¡Peones doblados! ⚠️ Dos peones en la misma columna, generalmente una debilidad. ¡Difíciles de defender!",
        "¡Doblados! ⚠️ Peones en la misma columna. ¡Debilidad porque no se protegen mutuamente!",
        "¡Peones doblados! ⚠️ Una columna con dos peones propios. ¡Objetivo táctico para el rival!"
    ],
    "peones aislados": [
        "¡Peón aislado! 🎯 No tiene peones del mismo color en columnas adyacentes. ¡Débil pero potencialmente fuerte!",
        "¡Aislado! 🎯 Peón sin compañeros en columnas vecinas. ¡Débil en defensa, fuerte en ataque!",
        "¡Peón aislado! 🎯 Ventaja: espacio y ataque. Desventaja: difícil de defender. ¡Equilibrio delicado!"
    ],
    "cadena de peones": [
        "¡Cadena de peones! ⛰️ Una diagonal de peones conectados. ¡Fuerza posicional importante!",
        "¡Cadena! ⛰️ Peones en diagonal conectados. ¡Base de ataque o defensa sólida!",
        "¡Cadena de peones! ⛰️ Diagonal de peones apoyándose. ¡Estructura fuerte pero rígida!"
    ],

    // Jugadores famosos
    "kasparov": [
        "¡Garry Kasparov es una leyenda! 🏆 Campeón mundial de 1985-2000. ¡Uno de los mejores de la historia! Su agresividad y preparación eran incomparables.",
        "¡Kasparov! 🏆 El 'Tigre de Bakú'. ¡Derrotó a Karpov y a Deep Blue! Preparación impecable.",
        "¡Garry Kasparov! 🏆 15 años campeón. ¡Mejoró el ajedrez con su agresividad y profundidad!"
    ],
    "fischer": [
        "¡Bobby Fischer fue un genio excéntrico! 🏆 Campeón mundial en 1972. ¡Revolucionó la teoría de aperturas! Su partida contra Spassky es legendaria.",
        "¡Fischer! 🏆 El americano que conquistó el mundo. ¡11½-8½ contra Spassky! Genio incomprendido.",
        "¡Bobby Fischer! 🏆 Revolucionó las aperturas. ¡Su match contra Spassky es historia del ajedrez!"
    ],
    "carlsen": [
        "¡Magnus Carlsen es el rey actual! 👑 Campeón mundial desde 2013. ¡Conocido por su versatilidad y finales magistrales! Juega como si leyera la mente.",
        "¡Carlsen! 👑 El 'Mozart del ajedrez'. ¡Versátil, creativo, finales perfectos! Campeón desde 2013.",
        "¡Magnus Carlsen! 👑 Actual campeón. ¡Su estilo universal lo hace imbatible en cualquier posición!"
    ],
    "morphy": [
        "¡Paul Morphy fue un prodigio! 🌟 Primer gran maestro americano en el siglo XIX. ¡Derrotó a todos los mejores jugadores europeos! Un talento natural.",
        "¡Morphy! 🌟 Prodigio americano. ¡Derrotó a los mejores europeos sin preparación! Talento puro.",
        "¡Paul Morphy! 🌟 El 'Napoleón del ajedrez'. ¡Invencible en su época dorada!"
    ],
    "capablanca": [
        "¡Capablanca fue elegante! 🎩 Campeón mundial de 1921-1927. ¡Conocido por su endgame impecable! Jugaba con tanta facilidad que parecía simple.",
        "¡Capablanca! 🎩 'La máquina de jugar ajedrez'. ¡Endgame perfecto, estilo elegante!",
        "¡José Raúl Capablanca! 🎩 Jugaba con tanta facilidad que parecía simple. ¡Endgame maestro!"
    ],

    // Términos adicionales
    "blitz": [
        "¡Blitz! ⚡ Partidas rápidas, generalmente 5 minutos o menos por jugador. ¡Adrenalina pura!",
        "¡Blitz! ⚡ 5 minutos o menos. ¡Rápido, intuitivo, emocionante! Para amantes de la velocidad.",
        "¡Partidas blitz! ⚡ Menos de 5 minutos. ¡Errores abundan, diversión garantizada!"
    ],
    "rapidas": [
        "¡Rápidas! ⏱️ Controles de tiempo de 10-60 minutos por jugador. ¡Equilibrio entre pensamiento y velocidad!",
        "¡Partidas rápidas! ⏱️ 10-60 minutos. ¡Buen ritmo para mostrar habilidad sin presión extrema!",
        "¡Rápidas! ⏱️ Tiempo suficiente para calcular pero no para aburrirse. ¡Formato popular!"
    ],
    "clasico": [
        "¡Clásico! 🕰️ Controles de tiempo más largos, como 90 minutos + 30 segundos por movimiento. ¡Ajedrez puro!",
        "¡Ajedrez clásico! 🕰️ 90+30 o similar. ¡Tiempo para profundidad estratégica máxima!",
        "¡Clásico! 🕰️ El formato tradicional. ¡Donde la estrategia profunda prevalece!"
    ],
    "online": [
        "¡Online! 🌐 Permite jugar contra oponentes de todo el mundo. ¡Comunidades enormes!",
        "¡Ajedrez online! 🌐 Chess.com, Lichess, etc. ¡Juega cuando quieras, contra quien quieras!",
        "¡Online! 🌐 Mundial de jugadores disponibles. ¡Aprende, compite, diviértete!"
    ],
    "motor": [
        "¡Motor! 🤖 Programa que calcula las mejores jugadas. ¡Como Stockfish o Komodo!",
        "¡Motor de ajedrez! 🤖 Calcula millones de posiciones por segundo. ¡Ayuda para análisis!",
        "¡Motor! 🤖 Software avanzado que 'piensa' en ajedrez. ¡Útil para estudiar y jugar!"
    ],
    "base de datos": [
        "¡Base de datos! 📚 Millones de partidas para estudiar aperturas y estrategias. ¡Conocimiento acumulado!",
        "¡Bases de datos! 📚 Colecciones masivas de partidas. ¡Estudia lo que jugaron los maestros!",
        "¡Base de datos! 📚 Tesoro de conocimiento ajedrecístico. ¡Aprende de millones de partidas!"
    ],

    // Más preguntas comunes
    "como mejorar": [
        "¡Mejorar requiere dedicación! 📈 Estudia aperturas, practica táctica y domina los finales. Juega regularmente y analiza tus partidas.",
        "¡Mejora paso a paso! 📈 Aperturas → táctica → estrategia → finales. ¡Juega y analiza constantemente!",
        "¡Camino al progreso! 📈 Estudio sistemático + práctica regular + análisis de errores. ¡Así se mejora!"
    ],
    "mejorar en ajedrez": [
        "¡Mejorar requiere dedicación! 📈 Estudia aperturas, practica táctica y domina los finales. Juega regularmente y analiza tus partidas.",
        "¡Mejora paso a paso! 📈 Aperturas → táctica → estrategia → finales. ¡Juega y analiza constantemente!",
        "¡Camino al progreso! 📈 Estudio sistemático + práctica regular + análisis de errores. ¡Así se mejora!"
    ],
    "libros recomendados": [
        "¡Los libros son tesoros! 📚 Para principiantes: 'Aprende Ajedrez' de Rubinstein. Para avanzados: 'Mis Grandes Predecesores' de Kasparov.",
        "¡Biblioteca ajedrecística! 📚 'Ajedrez Básico' para novatos, 'Mis Grandes Predecesores' para avanzados.",
        "¡Lecturas esenciales! 📚 Rubinstein para principiantes, Kasparov para maestros. ¡Cada libro es un nivel!"
    ],
    "sitios web": [
        "¡El mundo online del ajedrez es increíble! 🌐 Chess.com, Lichess.org, Chess24.com son excelentes para jugar y aprender.",
        "¡Plataformas online! 🌐 Chess.com (tutoriales), Lichess (gratuito), Chess24 (profesional). ¡Todas geniales!",
        "¡Comunidades online! 🌐 Únete a millones de jugadores. ¡Aprende, compite, mejora!"
    ],
    "apps": [
        "¡Las apps son perfectas para practicar! 📱 Chess by Chess.com, Lichess, y Chess Tactics Pro son muy útiles.",
        "¡Apps móviles! 📱 Chess.com, Lichess, Chess Tactics Pro. ¡Practica táctica en cualquier lugar!",
        "¡Ajedrez en el bolsillo! 📱 Apps para estudiar aperturas, táctica, y jugar contra motores."
    ],
    "que pieza mover primero": [
        "¡Orden importa! 🎯 Generalmente, desarrolla los caballos antes que los alfiles, y ¡no muevas la dama temprano!",
        "¡Secuencia de desarrollo! 🎯 Caballos primero (no bloquean alfiles), luego alfiles, torres, finalmente dama.",
        "¡Orden correcto! 🎯 Caballos → alfiles → enrocar → conectar torres. ¡Dama al final!"
    ],
    "como calcular variantes": [
        "¡El cálculo es un arte! 🧠 Mueve las piezas mentalmente, considera respuestas del oponente. ¡Visualiza 3-5 movimientos adelante!",
        "¡Cálculo de variantes! 🧠 Analiza árbol de movimientos. Considera respuestas, contra-respuestas. ¡Profundidad importa!",
        "¡Calcular bien! 🧠 Visualiza secuencias, evalúa posiciones, considera todas las respuestas posibles."
    ],
    "que es el elo": [
        "¡El ELO es tu pasaporte! 🎫 Es un sistema de rating que mide la fuerza relativa de los jugadores. ¡Sube con victorias, baja con derrotas!",
        "¡ELO! 🎫 Sistema de puntuación. 1200 principiante, 2000 fuerte club, 2500 maestro. ¡Tu nivel numérico!",
        "¡Rating ELO! 🎫 Mide fuerza relativa. ¡Ganas puntos a mejores oponentes, pierdes con más débiles!"
    ],
    "rating": [
        "¡El rating mide tu fuerza! 📊 Basado en resultados contra oponentes. ¡Es como un termómetro de tu habilidad ajedrecística!",
        "¡Rating! 📊 Tu nivel numérico. ¡Sube ganando a mejores, baja perdiendo con peores!",
        "¡Puntuación! 📊 Refleja tu fuerza. ¡Trabaja para subirlo con estudio y práctica!"
    ],
    "torneos": [
        "¡Los torneos son emocionantes! 🏆 Pueden ser suizos, round-robin, o eliminatorios. ¡Usan sistemas de puntuación y hay premios!",
        "¡Torneos! 🏆 Suizos (todos juegan igual), round-robin (todos vs todos), eliminatorios (brackets).",
        "¡Competiciones! 🏆 Desde locales hasta campeonatos mundiales. ¡Premios, títulos, gloria!"
    ],

    // Términos en inglés comunes
    "check": [
        "Check es jaque en inglés. ⚠️",
        "Check = jaque. ⚠️ ¡El rey está atacado!",
        "Check! ⚠️ Jaque en inglés."
    ],
    "checkmate": [
        "Checkmate es jaque mate en inglés. ⚡",
        "Checkmate = jaque mate. ⚡ ¡Victoria!",
        "Checkmate! ⚡ Mate en inglés."
    ],
    "castling": [
        "Castling es enroque en inglés. 🏰",
        "Castling = enroque. 🏰 ¡Movimiento especial!",
        "Castling! 🏰 Enroque en inglés."
    ],
    "pawn": [
        "Pawn es peón en inglés. ♟️",
        "Pawn = peón. ♟️ ¡El soldado básico!",
        "Pawn! ♟️ Peón en inglés."
    ],
    "knight": [
        "Knight es caballo en inglés. 🐎",
        "Knight = caballo. 🐎 ¡Movimiento en L!",
        "Knight! 🐎 Caballo en inglés."
    ],
    "bishop": [
        "Bishop es alfil en inglés. ⚪",
        "Bishop = alfil. ⚪ ¡Diagonal pura!",
        "Bishop! ⚪ Alfil en inglés."
    ],
    "rook": [
        "Rook es torre en inglés. 🏰",
        "Rook = torre. 🏰 ¡Líneas rectas!",
        "Rook! 🏰 Torre en inglés."
    ],
    "queen": [
        "Queen es dama en inglés. 👸",
        "Queen = dama. 👸 ¡La más poderosa!",
        "Queen! 👸 Dama en inglés."
    ],
    "king": [
        "King es rey en inglés. 👑",
        "King = rey. 👑 ¡Proteger siempre!",
        "King! 👑 Rey en inglés."
    ],
    "opening": [
        "Opening es apertura en inglés. ♟️",
        "Opening = apertura. ♟️ ¡Fase inicial!",
        "Opening! ♟️ Apertura en inglés."
    ],
    "middlegame": [
        "Middlegame es medio juego en inglés. ⚔️",
        "Middlegame = medio juego. ⚔️ ¡Batalla principal!",
        "Middlegame! ⚔️ Medio juego en inglés."
    ],
    "endgame": [
        "Endgame es final en inglés. 🏁",
        "Endgame = final. 🏁 ¡Última fase!",
        "Endgame! 🏁 Final en inglés."
    ],

    // Más estrategias
    "fianchetto": [
        "El fianchetto es desarrollar el alfil a g2/g7 o b2/b7. ⚪ ¡Controla diagonales largas!",
        "¡Fianchetto! ⚪ Alfil a g2/g7 o b2/b7. ¡Desarrollo elegante con control diagonal!",
        "¡Fianchetto! ⚪ Desarrollar alfil al borde. ¡Gran alcance diagonal!"
    ],
    "desarrollo rapido": [
        "Desarrollar rápidamente significa sacar las piezas menores en las primeras jugadas. 🚀 ¡Activa tu ejército!",
        "¡Desarrollo rápido! 🚀 Caballos y alfiles primero. ¡No pierdas tiempo!",
        "¡Desarrolla pronto! 🚀 Piezas al centro y activas. ¡La inactividad es peligrosa!"
    ],
    "control de casillas": [
        "Controlar casillas importantes limita la movilidad del oponente. 🎯 ¡Ocupa el territorio!",
        "¡Control de casillas! 🎯 Casillas clave dan espacio y libertad. ¡Limita al rival!",
        "¡Casillas importantes! 🎯 Ocupa centros, puntos fuertes. ¡Restringe al oponente!"
    ],
    "ataque al rey": [
        "Un ataque al rey debe ser preciso y bien calculado. ⚔️ ¡No precipites!",
        "¡Ataque al rey! ⚔️ Calcula variantes, protege tus piezas. ¡Precisión máxima!",
        "¡Atacar al rey! ⚔️ Planifica cuidadosamente. ¡Un error puede costar caro!"
    ],
    "defensa del rey": [
        "Enrrocar temprano y mantener peones alrededor del rey para protección. 🛡️ ¡Seguridad primero!",
        "¡Defensa del rey! 🛡️ Enroque + peones protectores. ¡Rey seguro = mente tranquila!",
        "¡Proteger al rey! 🛡️ Enroque temprano, peones en flanco rey. ¡Defensa preventiva!"
    ],
    "juego posicional": [
        "El juego posicional se enfoca en ventajas a largo plazo más que tácticas inmediatas. 🎯 ¡Estrategia profunda!",
        "¡Juego posicional! 🎯 Ventajas estructurales, control de casillas. ¡Paciencia recompensada!",
        "¡Posicional! 🎯 Mejores peones, más espacio, coordinación. ¡Ventajas duraderas!"
    ],
    "juego tactico": [
        "El juego táctico involucra combinaciones y amenazas directas. ⚡ ¡Ataques y defensas inmediatas!",
        "¡Juego táctico! ⚡ Amenazas, capturas, mates. ¡Acción inmediata!",
        "¡Táctico! ⚡ Combinaciones, ataques sorpresa. ¡Piensa 2-3 movimientos adelante!"
    ],
    "ventaja material": [
        "Tener más piezas o piezas más valiosas que el oponente. ⚖️ ¡Cuenta las piezas!",
        "¡Ventaja material! ⚖️ Más valor en piezas. ¡Convierte en victoria!",
        "¡Material superior! ⚖️ Peones, piezas extras. ¡Ventaja tangible!"
    ],
    "ventaja posicional": [
        "Ventaja en espacio, estructura de peones, o coordinación de piezas. 🎯 ¡Invisible pero poderosa!",
        "¡Ventaja posicional! 🎯 Mejor estructura, más espacio, piezas activas. ¡Gana sin capturas!",
        "¡Posicional fuerte! 🎯 Espacio, peones, coordinación. ¡Ventajas estratégicas!"
    ],

    // Finales
    "rey y peon vs rey": [
        "El rey y peón pueden ganar si el peón llega a la séptima fila con apoyo del rey. ♟️ ¡Precisión necesaria!",
        "¡Rey + peón vs rey! ♟️ Gana si el peón corona con apoyo real. ¡Rey contrario debe estar lejos!",
        "¡Final de peón! ♟️ El rey propio protege el avance. ¡Peón a séptima fila = victoria!"
    ],
    "rey y dama vs rey": [
        "La dama gana fácilmente contra el rey solo. 👸 ¡Control total del tablero!",
        "¡Rey + dama vs rey! 👸 La dama domina todas las casillas. ¡Mate inevitable!",
        "¡Dama sola gana! 👸 Controla filas y diagonales. ¡Rey contrario no tiene escapatoria!"
    ],
    "rey y torre vs rey": [
        "La torre gana con maniobras precisas. 🏰 ¡Pero requiere técnica perfecta!",
        "¡Rey + torre vs rey! 🏰 Gana con 'mate del pasillo'. ¡Movimientos precisos!",
        "¡Torre sola gana! 🏰 Controla filas y columnas. ¡Rey contrario acorralado!"
    ],
    "finales de peones": [
        "En finales de peones, la actividad del rey es crucial. ♟️ ¡El rey debe estar activo!",
        "¡Finales de peones! ♟️ Reyes activos, peones avanzados. ¡Cada movimiento cuenta!",
        "¡Peones finales! ♟️ El rey más activo gana. ¡Oposición y zugzwang importantes!"
    ],
    "oposicion": [
        "La oposición es cuando los reyes están enfrentados, impidiendo el avance del oponente. 👑 ¡Control de espacio!",
        "¡Oposición! 👑 Reyes enfrentados, rey a rey. ¡El que se mueve pierde espacio!",
        "¡Oposición real! 👑 Reyes en la misma fila/columna/diagonal. ¡Controla el ritmo!"
    ],

    // Más aperturas
    "berlinesa": [
        "La Defensa Berlinesa es una variante sólida de la Española: 1.e4 e5 2.Cf3 Cc6 3.Ab5 Cf6. 🛡️ ¡Muy posicional!",
        "¡Berlinesa! 🛡️ Variante sólida de la Española. ¡Kramnik la popularizó!",
        "¡Defensa Berlinesa! 🛡️ 3...Cf6 en la Española. ¡Defensa hipermoderna!"
    ],
    "defensa berlinesa": [
        "La Defensa Berlinesa es una variante sólida de la Española: 1.e4 e5 2.Cf3 Cc6 3.Ab5 Cf6. 🛡️ ¡Muy posicional!",
        "¡Berlinesa! 🛡️ Variante sólida de la Española. ¡Kramnik la popularizó!",
        "¡Defensa Berlinesa! 🛡️ 3...Cf6 en la Española. ¡Defensa hipermoderna!"
    ],
    "marshall": [
        "El Gambito Marshall es una variante agresiva de la Española: 1.e4 e5 2.Cf3 Cc6 3.Ab5 a6 4.Aa4 Cf6 5.0-0 Ae7 6.Te1 b5 7.Ab3 0-0 8.c3 d5. ⚡ ¡Sacrificio de peón!",
        "¡Gambito Marshall! ⚡ Ataque sorpresa en la Española. ¡Peón por iniciativa!",
        "¡Marshall! ⚡ 8...d5 en la Española. ¡Ataque brillante de Frank Marshall!"
    ],
    "gambito marshall": [
        "El Gambito Marshall es una variante agresiva de la Española: 1.e4 e5 2.Cf3 Cc6 3.Ab5 a6 4.Aa4 Cf6 5.0-0 Ae7 6.Te1 b5 7.Ab3 0-0 8.c3 d5. ⚡ ¡Sacrificio de peón!",
        "¡Gambito Marshall! ⚡ Ataque sorpresa en la Española. ¡Peón por iniciativa!",
        "¡Marshall! ⚡ 8...d5 en la Española. ¡Ataque brillante de Frank Marshall!"
    ],
    "najdorf": [
        "La Variante Najdorf de la Siciliana es 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 a6. 🧠 ¡Compleja y rica en teoría!",
        "¡Najdorf! 🧠 Variante principal de la Siciliana. ¡Miguel Najdorf la desarrolló!",
        "¡Variante Najdorf! 🧠 5...a6 en la Siciliana. ¡Teoría infinita!"
    ],
    "variante najdorf": [
        "La Variante Najdorf de la Siciliana es 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 a6. 🧠 ¡Compleja y rica en teoría!",
        "¡Najdorf! 🧠 Variante principal de la Siciliana. ¡Miguel Najdorf la desarrolló!",
        "¡Variante Najdorf! 🧠 5...a6 en la Siciliana. ¡Teoría infinita!"
    ],
    "dragonesa": [
        "La Variante Dragonesa de la Siciliana es 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 g6. 🐉 ¡Fianchetto de alfil negro!",
        "¡Dragonesa! 🐉 Variante fianchetto de la Siciliana. ¡Ataque y defensa simultáneos!",
        "¡Variante Dragonesa! 🐉 g6 en la Siciliana. ¡Alfil negro en g7 poderoso!"
    ],
    "variante dragonesa": [
        "La Variante Dragonesa de la Siciliana es 1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 g6. 🐉 ¡Fianchetto de alfil negro!",
        "¡Dragonesa! 🐉 Variante fianchetto de la Siciliana. ¡Ataque y defensa simultáneos!",
        "¡Variante Dragonesa! 🐉 g6 en la Siciliana. ¡Alfil negro en g7 poderoso!"
    ],

    // Términos adicionales
    "transposicion": [
        "¡La transposición es como un atajo! Una secuencia de movimientos que lleva a la misma posición por diferente orden. ¡Muy útil para confundir a tus oponentes! 🎭",
        "¡Transposición! 🎭 Llegar a la misma posición por diferente orden de movimientos. ¡Estrategia de confusión!",
        "¡Transposición! 🎭 Atajo a posiciones conocidas. ¡Desorienta al oponente!"
    ],
    "novotny": [
        "¡El ataque Novotny es espectacular! Es un sacrificio de dama en posiciones específicas. ¡Raro pero devastador! 💥",
        "¡Novotny! 💥 Sacrificio de dama en posiciones concretas. ¡Ataque teórico!",
        "¡Ataque Novotny! 💥 Dama por ataque ganador. ¡Combinación brillante!"
    ],
    "interferencia": [
        "¡La interferencia es como poner una pared! Bloquear la acción de una pieza enemiga. ¡Genial para tácticas! 🚧",
        "¡Interferencia! 🚧 Bloquear líneas de ataque enemigas. ¡Táctica de obstrucción!",
        "¡Interferencia! 🚧 Pieza bloqueando a otra. ¡Rompe coordinaciones!"
    ],
    "desviacion": [
        "¡La desviación es distracción máxima! Forzar a una pieza a abandonar una posición importante. ¡Divide y vencerás! 🎯",
        "¡Desviación! 🎯 Forzar a una pieza defensora a moverse. ¡Abre brechas!",
        "¡Desviación! 🎯 Distraer piezas clave. ¡Divide y conquistarás!"
    ],
    "sobrecarga": [
        "¡La sobrecarga es caos controlado! Ocurre cuando una pieza debe defender múltiples amenazas. ¡Aprovecha esa debilidad! ⚖️",
        "¡Sobrecarga! ⚖️ Pieza defendiendo demasiado. ¡Punto débil táctico!",
        "¡Sobrecarga! ⚖️ Una pieza con múltiples responsabilidades. ¡Exploitable!"
    ],
    "eliminacion": [
        "¡La eliminación del defensor es letal! Capturar o forzar a mover una pieza que protege algo importante. ¡Como quitar el soporte de un puente! 🌉",
        "¡Eliminación del defensor! 🌉 Remover protección clave. ¡Puente colapsa!",
        "¡Eliminación! 🌉 Capturar el guardián. ¡Deja vulnerable lo protegido!"
    ],

    // Más preguntas
    "como se llama el caballo en ingles": [
        "¡El caballo se llama 'knight' en inglés! 🐎 Es como un caballero medieval saltando sobre el tablero.",
        "¡Caballo = knight! 🐎 En inglés es 'caballero'. ¡Salta en L!",
        "¡Knight! 🐎 El caballo se llama 'knight' en inglés. ¡Como un caballero!"
    ],
    "que significa e4": [
        "¡e4 es el movimiento más común! ♟️ Significa mover el peón de e2 a e4. ¡Abre diagonales y ocupa el centro!",
        "¡e4! ♟️ Peón e2 a e4. ¡Movimiento central clásico!",
        "¡e4 significa! ♟️ Peón blanco de e2 a e4. ¡Apertura agresiva!"
    ],
    "notacion algebraica": [
        "¡La notación algebraica es el idioma del ajedrez! 📝 Usa letras para columnas (a-h) y números para filas (1-8). ¡Esencial para estudiar!",
        "¡Notación algebraica! 📝 a-h columnas, 1-8 filas. ¡Lenguaje universal!",
        "¡Notación! 📝 Sistema estándar: letras + números. ¡Registra todas las partidas!"
    ],
    "notacion": [
        "¡La notación algebraica es el idioma del ajedrez! 📝 Usa letras para columnas (a-h) y números para filas (1-8). ¡Esencial para estudiar!",
        "¡Notación algebraica! 📝 a-h columnas, 1-8 filas. ¡Lenguaje universal!",
        "¡Notación! 📝 Sistema estándar: letras + números. ¡Registra todas las partidas!"
    ],
    "que es un gran maestro": [
        "¡Un Gran Maestro es la élite! 🏆 Tiene un ELO de 2500+ y ha cumplido normas específicas. ¡Como un doctorado en ajedrez!",
        "¡Gran Maestro! 🏆 ELO 2500+, normas cumplidas. ¡La cima del ajedrez!",
        "¡GM! 🏆 Gran Maestro: 2500+ ELO + títulos oficiales. ¡Élite absoluta!"
    ],
    "gran maestro": [
        "¡Un Gran Maestro es la élite! 🏆 Tiene un ELO de 2500+ y ha cumplido normas específicas. ¡Como un doctorado en ajedrez!",
        "¡Gran Maestro! 🏆 ELO 2500+, normas cumplidas. ¡La cima del ajedrez!",
        "¡GM! 🏆 Gran Maestro: 2500+ ELO + títulos oficiales. ¡Élite absoluta!"
    ],
    "campeon mundial": [
        "¡El campeón mundial actual es Magnus Carlsen! 👑 Desde 2013, es el rey indiscutible. ¡Un genio estratégico!",
        "¡Campeón mundial! 👑 Magnus Carlsen desde 2013. ¡El mejor del mundo!",
        "¡Campeón! 👑 Magnus Carlsen, noruego, campeón desde 2013. ¡Rey del ajedrez!"
    ],
    "mujeres en ajedrez": [
        "¡Las mujeres en ajedrez son increíbles! 👩‍🎨 Jugadoras destacadas incluyen Judit Polgar, Hou Yifan, y Anna Muzychuk. ¡Rompiendo barreras!",
        "¡Mujeres en ajedrez! 👩‍🎨 Polgar, Hou Yifan, Muzychuk. ¡Talentos extraordinarios!",
        "¡Jugadoras destacadas! 👩‍🎨 Judit Polgar, Hou Yifan, Anna Muzychuk. ¡Inspiración!"
    ],
    "ajedrez infantil": [
        "¡El ajedrez infantil es maravilloso! 🧒 Desarrolla el pensamiento lógico, concentración y toma de decisiones en niños. ¡Un superpoder mental!",
        "¡Ajedrez para niños! 🧒 Mejora lógica, concentración, memoria. ¡Beneficios cognitivos!",
        "¡Ajedrez infantil! 🧒 Desarrolla mente joven. ¡Pensamiento estratégico desde pequeño!"
    ],
    "ajedrez en escuelas": [
        "¡El ajedrez en escuelas es revolucionario! 🏫 Mejora el rendimiento académico, enseña estrategia y fomenta el pensamiento crítico. ¡Más escuelas deberían tenerlo!",
        "¡Ajedrez escolar! 🏫 Mejora matemáticas, lógica, concentración. ¡Educación integral!",
        "¡Ajedrez en escuelas! 🏫 Desarrolla pensamiento crítico, estrategia, paciencia. ¡Ideal para educación!"
    ],

    // Términos finales
    "zugzwang": [
        "Zugzwang es cuando cualquier movimiento empeora tu posición. 😰 ¡Situación desesperada!",
        "¡Zugzwang! 😰 Cualquier jugada legal hace tu posición peor. ¡Muy frustrante!",
        "¡Zugzwang! 😰 No puedes mover sin perjudicarte. ¡Posición terrible!"
    ],
    "zwischenzug": [
        "Un zwischenzug es un movimiento intermedio que interrumpe la secuencia lógica. 🎭 ¡Muy astuto!",
        "¡Zwischenzug! 🎭 Movimiento sorpresa entre los esperados. ¡Rompe planes!",
        "¡Zwischenzug! 🎭 Intercalar jugada que cambia todo. ¡Tácticas avanzadas!"
    ],
    "clavada": [
        "Una clavada ocurre cuando una pieza no puede moverse porque protegería a una pieza más valiosa detrás. 📌 ¡Inmovilizada!",
        "¡Clavada! 📌 Pieza inmóvil protegiendo otra más importante. ¡No puede escapar!",
        "¡Clavada! 📌 Pieza 'clavada' protegiendo pieza valiosa. ¡Táctica clásica!"
    ],
    "rayos x": [
        "Un rayo X es cuando una pieza ataca a través de otra pieza enemiga. 🔍 ¡Como ver a través!",
        "¡Rayos X! 🔍 Ataque pasando por piezas enemigas. ¡Amenaza invisible!",
        "¡Rayos X! 🔍 Pieza ataca a través de otras. ¡Difícil de detectar!"
    ],
    "sacrificio": [
        "Un sacrificio es entregar material voluntariamente para obtener ventaja posicional o táctica. 🎁 ¡Inversión estratégica!",
        "¡Sacrificio! 🎁 Dar pieza por compensación mayor. ¡A veces necesario!",
        "¡Sacrificio! 🎁 Entregar material por beneficio superior. ¡Ajedrez es sacrificio!"
    ],
    "gambito": [
        "Un gambito es sacrificar un peón o pieza para obtener ventaja en desarrollo o ataque. 🎁 ¡Peón por iniciativa!",
        "¡Gambito! 🎁 Sacrificar por desarrollo rápido o ataque. ¡Inversión táctica!",
        "¡Gambito! 🎁 Dar material por compensación. ¡Las blancas gambitean mucho!"
    ],
    "contraataque": [
        "El contraataque es responder a un ataque con un ataque propio. ⚔️ ¡Mejor defensa es buen ataque!",
        "¡Contraataque! ⚔️ Responder agresivamente. ¡Sorprende al oponente!",
        "¡Contraataque! ⚔️ Atacar mientras te atacan. ¡Defensa ofensiva!"
    ],
    "presion": [
        "La presión es mantener amenazas constantes sobre el oponente. 💪 ¡No dejes respirar!",
        "¡Presión! 💪 Amenazas continuas limitando opciones. ¡Mantén iniciativa!",
        "¡Presión constante! 💪 Amenazas que obligan a defender. ¡Controla juego!"
    ],
    "ventaja": [
        "Una ventaja puede ser material, posicional o de desarrollo. ✅ ¡Aprovecha cualquier superioridad!",
        "¡Ventaja! ✅ Material (más piezas), posicional (mejor estructura), desarrollo (piezas activas).",
        "¡Ventaja! ✅ Tres tipos: material, posicional, desarrollo. ¡Convierte una en otras!"
    ],
    "compensacion": [
        "La compensación es ventaja posicional que equilibra desventaja material. ⚖️ ¡Actividad por material!",
        "¡Compensación! ⚖️ Posición fuerte equilibra desventaja material. ¡Iniciativa vale piezas!",
        "¡Compensación! ⚖️ Ventaja posicional compensa pérdida material. ¡Actividad = poder!"
    ],
    "estructura de peones": [
        "La estructura de peones determina la estrategia del medio juego. 🏗️ ¡Isolados, doblados, cadena!",
        "¡Estructura de peones! 🏗️ Esqueleto de la posición. ¡Débil o fuerte según configuración!",
        "¡Peones! 🏗️ Su disposición determina plan estratégico. ¡Importante para medio juego!"
    ],
    "peones doblados": [
        "Peones doblados son dos peones en la misma columna, generalmente una debilidad. ⚠️ ¡Difíciles de defender!",
        "¡Doblados! ⚠️ Peones en misma columna. ¡Debilidad porque no se protegen mutuamente!",
        "¡Peones doblados! ⚠️ Una columna con dos peones propios. ¡Objetivo táctico!"
    ],
    "peones aislados": [
        "Un peón aislado no tiene peones del mismo color en columnas adyacentes. 🎯 ¡Débil pero potencialmente fuerte!",
        "¡Aislado! 🎯 Peón sin compañeros en columnas vecinas. ¡Débil en defensa, fuerte en ataque!",
        "¡Peón aislado! 🎯 Ventaja: espacio y ataque. Desventaja: difícil defender. ¡Equilibrio delicado!"
    ],
    "cadena de peones": [
        "Una cadena de peones es una diagonal de peones conectados. ⛰️ ¡Fuerza posicional importante!",
        "¡Cadena! ⛰️ Peones en diagonal conectados. ¡Base de ataque o defensa sólida!",
        "¡Cadena de peones! ⛰️ Diagonal de peones apoyándose. ¡Estructura fuerte pero rígida!"
    ],
    "fianchetto": [
        "El fianchetto es desarrollar el alfil a g2/g7 o b2/b7. ⚪ ¡Controla diagonales largas!",
        "¡Fianchetto! ⚪ Alfil a g2/g7 o b2/b7. ¡Desarrollo elegante con control diagonal!",
        "¡Fianchetto! ⚪ Desarrollar alfil al borde. ¡Gran alcance diagonal!"
    ],
    "desarrollo rapido": [
        "Desarrollar rápidamente significa sacar las piezas menores en las primeras jugadas. 🚀 ¡Activa tu ejército!",
        "¡Desarrollo rápido! 🚀 Caballos y alfiles primero. ¡No pierdas tiempo!",
        "¡Desarrolla pronto! 🚀 Piezas al centro y activas. ¡La inactividad es peligrosa!"
    ],
    "control de casillas": [
        "Controlar casillas importantes limita la movilidad del oponente. 🎯 ¡Ocupa el territorio!",
        "¡Control de casillas! 🎯 Casillas clave dan espacio y libertad. ¡Limita al rival!",
        "¡Casillas importantes! 🎯 Ocupa centros, puntos fuertes. ¡Restringe al oponente!"
    ],
    "ataque al rey": [
        "Un ataque al rey debe ser preciso y bien calculado. ⚔️ ¡No precipites!",
        "¡Ataque al rey! ⚔️ Calcula variantes, protege piezas. ¡Precisión máxima!",
        "¡Atacar al rey! ⚔️ Planifica cuidadosamente. ¡Un error puede costar caro!"
    ],
    "defensa del rey": [
        "Enrrocar temprano y mantener peones alrededor del rey para protección. 🛡️ ¡Seguridad primero!",
        "¡Defensa del rey! 🛡️ Enroque + peones protectores. ¡Rey seguro = mente tranquila!",
        "¡Proteger al rey! 🛡️ Enroque temprano, peones en flanco rey. ¡Defensa preventiva!"
    ],
    "juego posicional": [
        "El juego posicional se enfoca en ventajas a largo plazo más que tácticas inmediatas. 🎯 ¡Estrategia profunda!",
        "¡Juego posicional! 🎯 Ventajas estructurales, control de casillas. ¡Paciencia recompensada!",
        "¡Posicional! 🎯 Mejores peones, más espacio, coordinación. ¡Ventajas duraderas!"
    ],
    "juego tactico": [
        "El juego táctico involucra combinaciones y amenazas directas. ⚡ ¡Ataques y defensas inmediatas!",
        "¡Juego táctico! ⚡ Amenazas, capturas, mates. ¡Acción inmediata!",
        "¡Táctico! ⚡ Combinaciones, ataques sorpresa. ¡Piensa 2-3 movimientos adelante!"
    ],
    "ventaja material": [
        "Tener más piezas o piezas más valiosas que el oponente. ⚖️ ¡Cuenta las piezas!",
        "¡Ventaja material! ⚖️ Más valor en piezas. ¡Convierte en victoria!",
        "¡Material superior! ⚖️ Peones, piezas extras. ¡Ventaja tangible!"
    ],
    "ventaja posicional": [
        "Ventaja en espacio, estructura de peones, o coordinación de piezas. 🎯 ¡Invisible pero poderosa!",
        "¡Ventaja posicional! 🎯 Mejor estructura, más espacio, piezas activas. ¡Gana sin capturas!",
        "¡Posicional fuerte! 🎯 Espacio, peones, coordinación. ¡Ventajas estratégicas!"
    ],
    "rey y peon vs rey": [
        "El rey y peón pueden ganar si el peón llega a la séptima fila con apoyo del rey. ♟️ ¡Precisión necesaria!",
        "¡Rey + peón vs rey! ♟️ Gana si el peón corona con apoyo real. ¡Rey contrario lejos!",
        "¡Final de peón! ♟️ Rey propio protege avance. ¡Peón a séptima = victoria!"
    ],
    "rey y dama vs rey": [
        "La dama gana fácilmente contra el rey solo. 👸 ¡Control total del tablero!",
        "¡Rey + dama vs rey! 👸 Dama domina todas casillas. ¡Mate inevitable!",
        "¡Dama sola gana! 👸 Controla filas y diagonales. ¡Rey contrario sin escapatoria!"
    ],
    "rey y torre vs rey": [
        "La torre gana con maniobras precisas. 🏰 ¡Pero requiere técnica perfecta!",
        "¡Rey + torre vs rey! 🏰 Gana con 'mate del pasillo'. ¡Movimientos precisos!",
        "¡Torre sola gana! 🏰 Controla filas y columnas. ¡Rey contrario acorralado!"
    ],
    "finales de peones": [
        "En finales de peones, la actividad del rey es crucial. ♟️ ¡Rey debe estar activo!",
        "¡Finales de peones! ♟️ Reyes activos, peones avanzados. ¡Cada movimiento cuenta!",
        "¡Peones finales! ♟️ Rey más activo gana. ¡Oposición y zugzwang importantes!"
    ],
    "oposicion": [
        "La oposición es cuando los reyes están enfrentados, impidiendo el avance del oponente. 👑 ¡Control de espacio!",
        "¡Oposición! 👑 Reyes enfrentados, rey a rey. ¡El que se mueve pierde espacio!",
        "¡Oposición real! 👑 Reyes en misma fila/columna/diagonal. ¡Controla el ritmo!"
    ],
    "transposicion": [
        "Una transposición es cuando una secuencia de movimientos lleva a la misma posición por diferente orden. 🎭 ¡Muy útil para confundir!",
        "¡Transposición! 🎭 Llegar a misma posición por diferente orden. ¡Estrategia de confusión!",
        "¡Transposición! 🎭 Atajo a posiciones conocidas. ¡Desorienta al oponente!"
    ],
    "novotny": [
        "El ataque Novotny es un sacrificio de dama en posiciones específicas. 💥 ¡Raro pero devastador!",
        "¡Novotny! 💥 Sacrificio de dama en posiciones concretas. ¡Ataque teórico!",
        "¡Ataque Novotny! 💥 Dama por ataque ganador. ¡Combinación brillante!"
    ],
    "interferencia": [
        "La interferencia es bloquear la acción de una pieza enemiga. 🚧 ¡Genial para tácticas!",
        "¡Interferencia! 🚧 Bloquear líneas de ataque enemigas. ¡Táctica de obstrucción!",
        "¡Interferencia! 🚧 Pieza bloqueando a otra. ¡Rompe coordinaciones!"
    ],
    "desviacion": [
        "La desviación es forzar a una pieza a abandonar una posición importante. 🎯 ¡Divide y vencerás!",
        "¡Desviación! 🎯 Forzar a pieza defensora a moverse. ¡Abre brechas!",
        "¡Desviación! 🎯 Distraer piezas clave. ¡Divide y conquistarás!"
    ],
    "sobrecarga": [
        "La sobrecarga ocurre cuando una pieza debe defender múltiples amenazas. ⚖️ ¡Aprovecha esa debilidad!",
        "¡Sobrecarga! ⚖️ Pieza defendiendo demasiado. ¡Punto débil táctico!",
        "¡Sobrecarga! ⚖️ Una pieza con múltiples responsabilidades. ¡Exploitable!"
    ],
    "eliminacion": [
        "La eliminación del defensor es capturar o forzar a mover una pieza que protege algo importante. 🌉 ¡Como quitar el soporte!",
        "¡Eliminación del defensor! 🌉 Remover protección clave. ¡Puente colapsa!",
        "¡Eliminación! 🌉 Capturar el guardián. ¡Deja vulnerable lo protegido!"
    ]
};

// Respuestas por defecto con personalidad
const defaultResponses = [
    "¡Ups! Esa pregunta me pilla un poco fuera de juego. ¿Puedes preguntarme sobre aperturas, mates o movimientos de piezas? 😊",
    "Hmm, no tengo información específica sobre eso en mi repertorio de ajedrez. ¿Qué tal si hablamos de la Defensa Siciliana o el enroque? ♟️",
    "¡Buena pregunta, pero estoy especializado en ajedrez! Pregúntame sobre jaques, promociones o estrategias básicas. 🤔",
    "Mi expertise está en el tablero de ajedrez. ¿Quieres saber sobre el valor de las piezas o aperturas famosas? 👑"
];

// Memoria conversacional avanzada con contexto por defecto
let conversationMemory = {
    context: {
        lastTopic: 'basics', // Contexto por defecto: conceptos básicos
        messageCount: 0,
        userName: null,
        greeted: false,
        topicsDiscussed: new Set(['basics']), // Ya conoce conceptos básicos
        currentExpectation: 'learning', // El usuario viene a aprender
        conversationFlow: ['introduction'], // Flujo inicial
        skillLevel: 'beginner', // Nivel por defecto: principiante
        preferredTopics: ['openings', 'pieces', 'tactics'] // Temas preferidos iniciales
    },
    history: {
        recentMessages: [
            {
                user: "Hola",
                bot: "¡Hola! 👋 Soy tu compañero apasionado de ajedrez. ¿En qué puedo ayudarte hoy? Puedo explicarte aperturas fascinantes, mates increíbles, movimientos de piezas y mucho más. ♟️",
                topic: 'basics',
                timestamp: Date.now()
            }
        ], // Últimas 10 preguntas/respuestas
        maxHistory: 10,
        topicSequence: ['basics'], // Secuencia de temas discutidos
        userPreferences: new Set(['learning', 'beginner']) // Preferencias del usuario
    },
    state: {
        waitingForResponse: false,
        followUpExpected: false,
        lastQuestionType: 'greeting',
        conversationPhase: 'introduction' // Fase de la conversación
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

// Función para generar guía para principiantes
function generateBeginnerGuidance(userInput) {
    const beginnerGuides = [
        "¡Como principiante, te recomiendo empezar con lo básico! ¿Quieres que te explique cómo se mueven las piezas o las reglas fundamentales? 📚",
        "¡Perfecto para empezar! Los principiantes suelen comenzar aprendiendo los movimientos de las piezas. ¿Te gustaría que te enseñe sobre peones, caballos o el rey? ♟️",
        "¡Gran actitud! Para principiantes, lo ideal es aprender paso a paso. ¿Prefieres que empecemos con las reglas básicas o con aperturas simples? 🤔"
    ];

    return beginnerGuides[Math.floor(Math.random() * beginnerGuides.length)];
}

// Función para generar aprendizaje progresivo
function generateProgressiveLearning(userInput, context) {
    const messageCount = context.messageCount;

    // Progresión de aprendizaje para principiantes
    if (messageCount === 1) {
        return "¡Hola! Como veo que eres nuevo en esto, empecemos por lo fundamental. ¿Sabías que el objetivo del ajedrez es dar jaque mate al rey contrario? ⚡";
    } else if (messageCount === 2) {
        return "¡Excelente! Ahora que sabes el objetivo, ¿te gustaría aprender cómo se mueven las piezas? Los peones van hacia adelante, los caballos en L... 🐎";
    } else if (messageCount <= 5) {
        return "¡Vas muy bien! ¿Quieres que te explique alguna apertura simple como la Italiana, o prefieres profundizar en mates básicos? 🎯";
    }

    return null;
}

// Función para generar respuestas basadas en contexto por defecto
function generateContextBasedResponse(userInput, context) {
    const lastTopic = context.lastTopic;

    // Si el contexto por defecto es básico, asumir preguntas generales
    if (lastTopic === 'basics') {
        const contextResponses = [
            "¡Como estamos hablando de conceptos básicos, te puedo explicar cualquier regla fundamental! ¿Qué te gustaría saber sobre el ajedrez? 📖",
            "¡Perfecto! En los fundamentos del ajedrez encontramos reglas fascinantes. ¿Quieres que te detalle alguna pieza o concepto específico? ♟️",
            "¡Me encanta enseñar lo básico! El ajedrez tiene reglas simples pero profundas. ¿Hay algo en particular que te confunda? 🤔"
        ];
        return contextResponses[Math.floor(Math.random() * contextResponses.length)];
    }

    return null;
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

    // Respuesta genérica de seguimiento con contexto
    const contextAwareResponses = [
        "¡Genial! Me encanta que preguntes más. ¿Qué aspecto te interesa específicamente? 🤓",
        "¡Perfecto! Vamos a profundizar. ¿Hay algo en particular que quieras explorar? 🔍",
        "¡Excelente! Me gusta tu curiosidad. ¿Qué te gustaría saber ahora? 💡",
        "¡Sigue así! Como principiante, es normal tener muchas preguntas. ¿Qué más te gustaría aprender? 📚"
    ];

    return contextAwareResponses[Math.floor(Math.random() * contextAwareResponses.length)];
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
            return conversationMemory.context.greeted ? 'greeting_returning' : 'greeting_first';
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

// Función optimizada para encontrar la mejor respuesta con contexto por defecto
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

    // PRIMERO: Verificar si hay respuestas contextuales basadas en el contexto por defecto
    const contextBasedResponse = generateContextBasedResponse(userInput, conversationMemory.context);
    if (contextBasedResponse) {
        updateConversationHistory(userInput, contextBasedResponse, inferredTopic || conversationMemory.context.lastTopic);
        return contextBasedResponse;
    }

    // SEGUNDO: Intentar generar respuesta ingeniosa basada en palabras clave
    const wittyResponse = generateWittyResponse(userInput, inferredTopic, conversationMemory.context);
    const shouldUseWitty = wittyResponse && (
        Math.random() < 0.7 || // 70% de probabilidad normal
        conversationMemory.context.messageCount > 3 || // Más ingenioso en conversaciones largas
        inferredTopic === 'basics' // Especialmente ingenioso con principiantes
    );

    if (shouldUseWitty) {
        updateConversationHistory(userInput, wittyResponse, inferredTopic);
        conversationMemory.context.lastTopic = inferredTopic;
        if (inferredTopic) {
            conversationMemory.context.topicsDiscussed.add(inferredTopic);
        }
        return wittyResponse;
    }

    // TERCERO: ALGORITMO OPTIMIZADO: Buscar la mejor coincidencia directa
    let bestMatch = findBestMatch(normalizedInput);

    if (bestMatch) {
        const response = Array.isArray(chessKnowledge[bestMatch.key])
            ? chessKnowledge[bestMatch.key][Math.floor(Math.random() * chessKnowledge[bestMatch.key].length)]
            : chessKnowledge[bestMatch.key];
        updateConversationHistory(userInput, response, inferredTopic);
        conversationMemory.context.lastTopic = inferredTopic;
        if (inferredTopic) {
            conversationMemory.context.topicsDiscussed.add(inferredTopic);
        }
        return response;
    }

    // TERCERO: Verificar contexto conversacional si no hay buena coincidencia directa
    const contextualResponse = generateContextualResponse(userInput, inferredTopic);
    if (contextualResponse) {
        updateConversationHistory(userInput, contextualResponse, inferredTopic);
        conversationMemory.context.lastTopic = inferredTopic;
        if (inferredTopic) {
            conversationMemory.context.topicsDiscussed.add(inferredTopic);
        }
        return contextualResponse;
    }

    // CUARTO: Generar respuesta coherente basada en reglas y contexto por defecto
    const coherentResponse = generateCoherentResponse(userInput, inferredTopic, conversationMemory.context);
    if (coherentResponse) {
        updateConversationHistory(userInput, coherentResponse, inferredTopic || conversationMemory.context.lastTopic);
        conversationMemory.context.lastTopic = inferredTopic || conversationMemory.context.lastTopic;
        if (inferredTopic) {
            conversationMemory.context.topicsDiscussed.add(inferredTopic);
        }
        return coherentResponse;
    }

    // QUINTO: Si no encuentra nada específico, usar contexto por defecto para guiar
    if (conversationMemory.context.skillLevel === 'beginner') {
        const beginnerFallback = generateBeginnerGuidance(userInput);
        if (beginnerFallback) {
            updateConversationHistory(userInput, beginnerFallback, 'basics');
            return beginnerFallback;
        }
    }

    // ÚLTIMO RECURSO: respuesta por defecto
    const defaultResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    updateConversationHistory(userInput, defaultResponse, null);
    return defaultResponse;
}

// Función para generar respuestas ingeniosas basadas en palabras clave
function generateWittyResponse(userInput, inferredTopic, context) {
    const normalizedInput = normalizeText(userInput);
    const words = normalizedInput.split(' ');

    // Base de frases ingeniosas por tema
    const wittyPhrases = {
        openings: {
            keywords: ['apertura', 'italiana', 'francesa', 'española', 'siciliana', 'caro', 'kan', 'nimzo', 'india', 'inglesa', 'reti'],
            responses: [
                "¡Ah, las aperturas! Son como el saludo elegante del ajedrez. ¿Quieres que te enseñe a 'estrechar la mano' correctamente? 🤝",
                "Las aperturas son el prólogo de tu partida. ¡Como elegir el primer capítulo de un libro fascinante! 📖",
                "¡Pensar en aperturas me hace sentir como un estratega romano planeando la batalla! ⚔️ ¿Cuál te interesa conquistar?"
            ]
        },
        pieces: {
            keywords: ['peon', 'peones', 'caballo', 'caballos', 'alfil', 'alfiles', 'torre', 'torres', 'dama', 'damas', 'rey', 'reyes'],
            responses: [
                "¡Las piezas! Cada una tiene su personalidad única. ¿Quieres conocer sus 'superpoderes' secretos? 🦸‍♂️",
                "Pensar en las piezas es como armar un equipo de superhéroes. ¡Cada uno con su rol especial! ⚡",
                "¡Las piezas son los actores de nuestra obra ajedrecística! 🎭 ¿Cuál quieres que interprete el papel principal?"
            ]
        },
        tactics: {
            keywords: ['mate', 'jaque', 'enroque', 'promocion', 'ahogado', 'tablas', 'clavada', 'descubierto', 'sacrificio'],
            responses: [
                "¡Las tácticas! Son los trucos mágicos del ajedrez. ¿Listo para aprender algunos hechizos? ✨",
                "Pensar en tácticas me hace sentir como un mago preparando ilusiones. ¡Ahora verás, ahora no verás! 🎩",
                "¡Las tácticas son el arte del ajedrez! Como resolver un rompecabezas donde cada pieza cuenta. 🧩"
            ]
        },
        strategy: {
            keywords: ['centro', 'desarrollo', 'ataque', 'defensa', 'espacio', 'tiempo', 'iniciativa'],
            responses: [
                "¡La estrategia! Es como planear una campaña militar. ¿Quieres ser el general de tu tablero? 🎖️",
                "Pensar estratégicamente es como ser un ajedrecista filósofo. ¡Cada movimiento tiene un propósito profundo! 🧘‍♂️",
                "¡La estrategia es el alma del ajedrez! Como componer una sinfonía donde cada nota importa. 🎼"
            ]
        },
        players: {
            keywords: ['kasparov', 'fischer', 'carlsen', 'morphy', 'capablanca', 'campeon', 'gran', 'maestro'],
            responses: [
                "¡Los grandes maestros! Leyendas vivientes del ajedrez. ¿Quieres conocer sus historias épicas? 📜",
                "Hablar de campeones es como recordar a los dioses del Olimpo ajedrecístico. ¡Cada uno con su estilo único! 👑",
                "¡Los maestros son los rockstars del ajedrez! 🎸 ¿Cuál quieres que te cuente su 'concierto' favorito?"
            ]
        },
        basics: {
            keywords: ['reglas', 'basicas', 'empezar', 'principiante', 'como', 'que', 'es', 'ajedrez'],
            responses: [
                "¡Los fundamentos! Son como aprender a caminar antes de correr. ¿Empezamos con pasos seguros? 👶",
                "Pensar en lo básico es como construir una casa desde los cimientos. ¡Fuerte y sólida! 🏗️",
                "¡Los principios básicos son tu armadura ajedrecística! 🛡️ ¿Listo para equiparte?"
            ]
        }
    };

    // Buscar coincidencias ingeniosas
    for (const [category, data] of Object.entries(wittyPhrases)) {
        const matchingWords = words.filter(word =>
            data.keywords.some(keyword =>
                keyword.includes(word) || word.includes(keyword) ||
                wordSimilarity(word, keyword) > 0.8
            )
        );

        if (matchingWords.length > 0) {
            const response = data.responses[Math.floor(Math.random() * data.responses.length)];

            // Personalizar según contexto
            if (context.skillLevel === 'beginner') {
                return response + " Como principiante, te irá genial aprendiendo esto paso a paso. 📈";
            } else if (context.messageCount > 5) {
                return response + " Veo que ya tienes experiencia. ¿Quieres profundizar en detalles avanzados? 🔍";
            }

            return response;
        }
    }

    // Si no hay coincidencia directa, generar respuesta ingeniosa genérica
    const genericWitty = [
        "¡Qué pregunta tan astuta! Me hace pensar en las complejidades del ajedrez. 🤔",
        "¡Interesante perspectiva! El ajedrez siempre tiene capas ocultas por descubrir. 🔍",
        "¡Buena observación! Cada aspecto del ajedrez esconde secretos fascinantes. 💎",
        "¡Pregunta creativa! Me recuerda por qué el ajedrez es tan adictivo. 🎯"
    ];

    return genericWitty[Math.floor(Math.random() * genericWitty.length)];
}

// Función dedicada para encontrar la mejor coincidencia posible con generación ingeniosa
function findBestMatch(normalizedInput) {
    // 1. Búsqueda exacta primero (más rápida)
    if (chessKnowledge[normalizedInput]) {
        return { key: normalizedInput, score: 10, type: 'exact' };
    }

    // 2. Sistema de scoring avanzado con múltiples estrategias
    let candidates = [];

    const inputWords = normalizedInput.split(' ');
    const inputLength = normalizedInput.length;

    for (const key in chessKnowledge) {
        const normalizedKey = normalizeText(key);
        let score = 0;
        let matchType = 'partial';

        // Estrategia 1: Coincidencia de palabras completas (muy alta prioridad)
        const keyWords = normalizedKey.split(' ');
        let exactWordMatches = 0;
        let partialWordMatches = 0;

        for (const inputWord of inputWords) {
            if (keyWords.includes(inputWord)) {
                exactWordMatches++;
                score += 8; // Muy alto para palabras exactas
            } else {
                // Buscar mejores coincidencias parciales
                for (const keyWord of keyWords) {
                    const similarity = wordSimilarity(inputWord, keyWord);
                    if (similarity >= 0.85) { // Umbral más alto para mejor precisión
                        partialWordMatches++;
                        score += similarity * 6;
                    } else if (similarity >= 0.7) {
                        score += similarity * 4;
                    }
                }
            }
        }

        // Estrategia 2: Substrings y proximidad
        if (normalizedKey.includes(normalizedInput) || normalizedInput.includes(normalizedKey)) {
            score += 5;
            matchType = 'substring';
        }

        // Estrategia 3: Similitud general de la frase
        const phraseSimilarity = wordSimilarity(normalizedInput, normalizedKey);
        if (phraseSimilarity >= 0.8) {
            score += phraseSimilarity * 7;
            matchType = 'high_similarity';
        } else if (phraseSimilarity >= 0.6) {
            score += phraseSimilarity * 4;
        }

        // Estrategia 4: Bonus por longitud similar
        const lengthDiff = Math.abs(inputLength - normalizedKey.length);
        if (lengthDiff <= 5) score += 3;
        else if (lengthDiff <= 10) score += 1;

        // Estrategia 5: Bonus por múltiples palabras
        if (exactWordMatches > 1) score += exactWordMatches * 3;
        if (partialWordMatches > 1) score += partialWordMatches * 2;

        // Estrategia 6: Bonus por tema inferido
        const keyTopic = inferTopic(key);
        const inputTopic = inferTopic(normalizedInput);
        if (keyTopic && inputTopic && keyTopic === inputTopic) {
            score += 2;
        }

        // Estrategia 7: Bonus por palabras clave ingeniosas
        const wittyKeywords = ['como', 'que', 'por que', 'cual', 'donde', 'cuando', 'mejor', 'peor', 'fuerte', 'debil', 'ingenioso', 'astuto', 'inteligente', 'brillante'];
        const hasWittyWord = inputWords.some(word => wittyKeywords.some(witty => word.includes(witty) || wordSimilarity(word, witty) > 0.8));
        if (hasWittyWord) {
            score += 2.5; // Aumentar bonus para respuestas ingeniosas
        }
    
        // Estrategia 8: Bonus por frases interrogativas (estimulan respuestas ingeniosas)
        const questionWords = ['como', 'que', 'cual', 'donde', 'cuando', 'por', 'que', 'quien', 'cuanto'];
        const isQuestion = inputWords.some(word => questionWords.includes(word));
        if (isQuestion) {
            score += 1;
        }

        // Solo considerar candidatos con score decente
        const minScore = inputWords.length >= 2 ? 4 : 3;
        if (score >= minScore) {
            candidates.push({
                key: key,
                score: score,
                type: matchType,
                topic: keyTopic,
                wordMatches: exactWordMatches,
                similarity: phraseSimilarity,
                hasWittyElements: hasWittyWord
            });
        }
    }

    // Seleccionar el mejor candidato
    if (candidates.length > 0) {
        candidates.sort((a, b) => {
            // Priorizar por score primero
            if (Math.abs(a.score - b.score) > 1) return b.score - a.score;

            // Desempate por elementos ingeniosos
            if (a.hasWittyElements !== b.hasWittyElements) {
                return a.hasWittyElements ? -1 : 1;
            }

            // Desempate por tipo de match
            const typePriority = { exact: 4, substring: 3, high_similarity: 2, partial: 1 };
            const typeDiff = typePriority[b.type] - typePriority[a.type];
            if (typeDiff !== 0) return typeDiff;

            // Desempate por palabras exactas
            return b.wordMatches - a.wordMatches;
        });

        return candidates[0];
    }

    return null;
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

        // Imprimir contexto en consola después de cada mensaje
        console.log('=== CONTEXTO DE CONVERSACIÓN ===');
        console.log('Mensaje del usuario:', message);
        console.log('Respuesta del bot:', response);
        console.log('Tipo de respuesta:', response.includes('¡') ? 'ingeniosa' : 'estándar');
        console.log('Tema inferido:', inferTopic(message));
        console.log('Contexto actual:', {
            messageCount: conversationMemory.context.messageCount,
            lastTopic: conversationMemory.context.lastTopic,
            skillLevel: conversationMemory.context.skillLevel,
            greeted: conversationMemory.context.greeted,
            topicsDiscussed: Array.from(conversationMemory.context.topicsDiscussed),
            currentExpectation: conversationMemory.context.currentExpectation,
            conversationPhase: conversationMemory.state.conversationPhase
        });
        console.log('Historial reciente:', conversationMemory.history.recentMessages.slice(-3));
        console.log('================================');
    }, delay);
}

// Función de respaldo para asegurar que los event listeners funcionen
function initializeChat() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');

    if (sendButton && userInput) {
        // Remover listeners existentes para evitar duplicados
        sendButton.removeEventListener('click', sendMessage);
        userInput.removeEventListener('keypress', handleKeyPress);

        // Agregar listeners
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', handleKeyPress);

        console.log('Chat inicializado correctamente');
    } else {
        console.error('Elementos del chat no encontrados');
    }
}

// Función separada para manejar el evento keypress
function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar chat con función de respaldo
    initializeChat();
});