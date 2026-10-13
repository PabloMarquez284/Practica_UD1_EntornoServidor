//Importaciones
import express from 'express';
import {
    talleres,
    inscripciones,
    obtenerPlazasRestantes,
    estaInscrito,
    validarInscripcion
} from './logica.js';

//Configuración Inicial
const app = express();
const PORT = 3000;

//Middlewares Globales
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


//Get para obtener todos los talleres con filtros opcionales
app.get('/talleres', (req, res) => {
    const catg = req.query.categoria;
    const niv = req.query.nivel;
    const disp = req.query.disponibles;

    //Hacer una copia de la lista original de talleres
    let resultado = [...talleres];

    if (catg){
        resultado = resultado.filter(taller => taller.categoria === catg);
    }
    if (niv){
        resultado = resultado.filter(taller => taller.nivel === niv);
    }
    if (disp === 'true'){
        resultado = resultado.filter(taller => obtenerPlazasRestantes(taller, inscripciones) > 0);
    }

    //Calcular plazas restantes para cada taller en el resultado
    resultado = resultado.map(taller => ({
            ...taller,
            plazasRestantes: obtenerPlazasRestantes(taller, inscripciones)
        }));

    res.json(resultado);
});

//Get para obtener un taller por su ID
app.get('/talleres/:id', (req, res) => {
    const tallerId = parseInt(req.params.id);
    const taller = talleres.find(taller => taller.id === tallerId);

    if (!taller) {
        return res.status(404).json({ error: "Taller no encontrado" });
    }

    let info = '';
    const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);
    
    if (plazasRestantes === 0) {
        info = `El taller "${taller.titulo}" no tiene plazas disponibles`;
    } else if (plazasRestantes === 1) {
        info = `Solo queda 1 plaza disponible para el taller "${taller.titulo}"`;
    } else {
        info = `Quedan ${plazasRestantes} plazas disponibles para el taller "${taller.titulo}"`;
    }
    
    res.json({ ...taller, plazasRestantes, info });
});

//Llamada al servidor
app.listen(PORT, () => {
console.log(`Servidor disponible en http://localhost:${PORT}`);
});