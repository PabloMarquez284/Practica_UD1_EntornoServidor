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
    const tallerId = parseInt(req.params.id, 10);
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

//Get para el alta de inscripciones
app.get('/talleres/:id/inscripcion', (req, res) => {
    const tallerId = parseInt(req.params.id, 10);
    const taller = talleres.find(taller => taller.id === tallerId);

    if (!taller) {
        return res.status(404).json({ error: "Taller no encontrado" });
    }

    res.json({ tallerId, mensaje: `Formulario de inscripción para el taller "${taller.titulo}"` });
});

//Post para procesar la inscripción
app.post('/talleres/:id/inscripcion', (req, res) => {
    const tallerId = parseInt(req.params.id, 10);
    const taller = talleres.find(taller => taller.id === tallerId);

    if (!taller) {
        return res.status(404).json({ error: "Taller no encontrado" });
    }

    //Validar campos recibidos (nombre y email)
    const datosEntrada = { ...req.body, tallerId };
    const validacion = validarInscripcion(datosEntrada);

    if (!validacion.esValido) {
        return res.status(400).json({ error: validacion.errores });
    }

    if (obtenerPlazasRestantes(taller, inscripciones) <= 0) {
        return res.status(400).json({ mensaje: `El taller "${taller.titulo}" está completo` });
    }

    if (estaInscrito(tallerId, req.body.email, inscripciones)) {
        return res.status(400).json({ error: "Ya estás inscrito en este taller" });
    }

    //Guardar nueva içnscripción
    const nuevaInscripcion = {
        id: inscripciones.length + 1,
        tallerId: tallerId,
        nombre: req.body.nombre,
        email: req.body.email
    };
    inscripciones.push(nuevaInscripcion);

    //Redireccion PRG en caso de éxito
    return res.redirect(`/talleres/${tallerId}`);
});


//Llamada al servidor
app.listen(PORT, () => {
console.log(`Servidor disponible en http://localhost:${PORT}`);
});