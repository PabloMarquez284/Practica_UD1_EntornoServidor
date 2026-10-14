//Datos para talleres
const talleres = [
  {
    id: 1,
    titulo: "Introducción a Docker",
    categoria: "sistemas",
    plazas: 20,
    nivel: "inicial"
  },
  {
    id: 2,
    titulo: "Introducción a HTML5 y CSS3",
    categoria: "interfaz",
    plazas: 30,
    nivel: "medio"
  },
  {
    id: 3,
    titulo: "Introducción a MySQL",
    categoria: "bbdd",
    plazas: 10,
    nivel: "alto"
  }
];

//Datos para inscripciones
const inscripciones = [
  {
    id: 1,
    tallerId: 1,
    nombre: "Curro Ximénez",
    email: "currox@example.com"
  },
    {
    id: 2,
    tallerId: 2,
    nombre: "Willman Acosta",
    email: "willman.acosta@eusa.es"
  },
  {
    id: 3,
    tallerId: 3,
    nombre: "Manuel Granados",
    email: "manuel.granados@eusa.es"
  }
];

//Función para obtener las plazas restantes en un taller
function obtenerPlazasRestantes(taller, inscripciones) {
  const inscritos = inscripciones.filter(inscripcion => inscripcion.tallerId === taller.id);
  return taller.plazas - inscritos.length;
}

//Función para verificar si un usuario ya está inscrito en un taller
function estaInscrito(tallerId, email, inscripciones) {
    return inscripciones.some(inscripcion => inscripcion.tallerId === tallerId && inscripcion.email.toLowerCase() === email.toLowerCase());
}

//Función para validar los datos de inscripción
function validarInscripcion(datos) {
    const { tallerId, nombre, email } = datos;
    let errores = {};
    let esValido = true;
    let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!tallerId || isNaN(tallerId)) {
        errores.tallerId = "El taller es obligatorio";
    }
    if (!nombre || nombre.trim() === "") {
        errores.nombre = "El nombre es obligatorio";
    }
    if (!email || email.trim() === "") {
        errores.email = "El email es obligatorio";
    } else if (!regexEmail.test(email)) {
        errores.email = "El email no es válido";
    }
    esValido = Object.keys(errores).length === 0;
    return { esValido, errores };
}

//Exportar los datos y funciones para que puedan ser utilizados en otros módulos
export {
  talleres,
  inscripciones,
  obtenerPlazasRestantes,
  estaInscrito,
  validarInscripcion
};