import { describe, it, expect } from 'vitest';
import { obtenerPlazasRestantes, estaInscrito, validarInscripcion } from './logica.js';

describe('Pruebas de Lógica de Negocio', () => {

  it('obtenerPlazasRestantes debería restar correctamente las inscripciones', () => {
    const taller = { id: 1, plazas: 20 };
    const inscripcionesPrueba = [
      { id: 1, tallerId: 1, email: 'a@a.com' },
      { id: 2, tallerId: 1, email: 'b@b.com' }
    ];
    const plazas = obtenerPlazasRestantes(taller, inscripcionesPrueba);
    expect(plazas).toBe(18);
  });

  it('estaInscrito debería detectar si un correo ya existe en un taller', () => {
    const inscripcionesPrueba = [
      { id: 1, tallerId: 1, email: 'currox@example.com' }
    ];
    expect(estaInscrito(1, 'CURROX@EXAMPLE.COM', inscripcionesPrueba)).toBe(true);
    expect(estaInscrito(1, 'otro@example.com', inscripcionesPrueba)).toBe(false);
  });

  it('validarInscripcion debería detectar campos vacíos o email inválido', () => {
    const datosIncorrectos = { tallerId: 'abc', nombre: '', email: 'correo-invalido' };
    const resultado = validarInscripcion(datosIncorrectos);

    expect(resultado.esValido).toBe(false);
    expect(resultado.errores).toHaveProperty('tallerId');
    expect(resultado.errores).toHaveProperty('nombre');
    expect(resultado.errores).toHaveProperty('email');
  });

});