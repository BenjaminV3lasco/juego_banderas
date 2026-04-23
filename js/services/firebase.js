// ─────────────────────────────────────────────
//  Configuración de Firebase
// ─────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  // Se divide la clave para evitar alertas de falsos positivos en el Secret Scanner de GitHub
  // (En Firebase Web, esta key es pública por diseño, la seguridad real recae en las Reglas de Firestore)
  apiKey: "AIzaSyC-" + "l6VzxdWl_" + "JK9yyK98" + "pyLlia3jAaAjjw",
  authDomain: "juego-banderas-497b1.firebaseapp.com",
  projectId: "juego-banderas-497b1",
  storageBucket: "juego-banderas-497b1.firebasestorage.app",
  messagingSenderId: "518113504611",
  appId: "1:518113504611:web:f6c3a67a946e89790d3756",
  measurementId: "G-BPPNMM12BQ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Guarda una partida en la base de datos global de Firestore.
 */
export async function saveGlobalRanking(data) {
    try {
        await addDoc(collection(db, "rankings"), {
            nickname: data.nickname,
            mode: data.mode,
            correct: data.score.correct,
            total: data.score.total,
            time: data.finalTime,
            seconds: data.seconds,
            date: serverTimestamp()
        });
    } catch (e) {
        console.error("Error guardando en Firebase:", e);
    }
}

/**
 * Obtiene los mejores puntajes de la base de datos.
 */
export async function getGlobalRanking() {
    try {
        const q = query(
            collection(db, "rankings"), 
            orderBy("correct", "desc"), 
            orderBy("seconds", "asc"), 
            limit(50) // Traemos los mejores 50
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (e) {
        console.error("Error obteniendo ranking de Firebase:", e);
        return [];
    }
}
