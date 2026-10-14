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

//Redirección a /talleres
app.get('/', (req, res) => {
    res.redirect('/talleres');
});

//GET para obtener todos los talleres con filtros opcionales
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

    res.render('talleres', { talleres: resultado });
});

//GET para obtener un taller por su ID
app.get('/talleres/:id', (req, res) => {
    const tallerId = parseInt(req.params.id, 10);
    const taller = talleres.find(taller => taller.id === tallerId);

    if (!taller) {
        return res.status(404).json({ error: "Taller no encontrado" });
    }

    let estado = '';
    const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);
    
    if (plazasRestantes === 0) {
        estado = `Completo`;
    } else if (plazasRestantes === 1) {
        estado = `Última plaza disponible`;
    } else {
        estado = `${plazasRestantes} plazas disponibles`;
    }
    
    res.render('detalles', { taller, estado, plazasRestantes });
});

//GET para el alta de inscripciones
app.get('/talleres/:id/inscripcion', (req, res) => {
    const tallerId = parseInt(req.params.id, 10);
    const taller = talleres.find(taller => taller.id === tallerId);

    if (!taller) {
        return res.status(404).json({ error: "Taller no encontrado" });
    }

    //Renderizar la vista enviando objetos vacíos iniciales para errores y datos
    res.render('inscripcion', { taller, errores: {}, datos: {} });
});

//POST para procesar la inscripción
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
        return res.status(400).render('inscripcion', { 
            taller, 
            errores: validacion.errores, 
            datos: datosEntrada });
    }

    if (obtenerPlazasRestantes(taller, inscripciones) <= 0) {
        return res.status(400).render('inscripcion', { 
            taller, 
            errores: { general:"No hay plazas disponibles en este taller" }, 
            datos: datosEntrada });
    }

    if (estaInscrito(tallerId, req.body.email, inscripciones)) {
        return res.status(400).render('inscripcion', { 
            taller, 
            errores: { general: "El correo electrónico ya está inscrito en este taller" }, 
            datos: datosEntrada });
    }

    //Guardar nueva inscripción
    const nuevaInscripcion = {
        id: inscripciones.length + 1,
        tallerId: tallerId,
        nombre: req.body.nombre.trim(),
        email: req.body.email.trim()
    };
    inscripciones.push(nuevaInscripcion);

    //Redireccion PRG en caso de éxito
    return res.redirect(`/talleres/${tallerId}`);
});


//Llamada al servidor
app.listen(PORT, () => {
console.log(`Servidor disponible en http://localhost:${PORT}`);
});