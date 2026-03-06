/**
 * registro.js — MerqueEnvios
 * Validación completa del formulario de registro:
 * nombres, edad, fecha de nacimiento, correo, teléfono y dirección.
 * Incluye validación cruzada edad ↔ fecha de nacimiento.
 */

(function () {
    'use strict';

    /* ─── Elementos del DOM ─── */
    const form                = document.getElementById('registroForm');
    const nombreInput         = document.getElementById('nombre');
    const edadInput           = document.getElementById('edad');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const emailInput          = document.getElementById('email');
    const telefonoInput       = document.getElementById('telefono');
    const direccionInput      = document.getElementById('direccion');

    const nombreError         = document.getElementById('nombre-error');
    const edadError           = document.getElementById('edad-error');
    const fechaNacimientoError = document.getElementById('fechaNacimiento-error');
    const emailError          = document.getElementById('email-error');
    const telefonoError       = document.getElementById('telefono-error');
    const direccionError      = document.getElementById('direccion-error');

    /* ─── Utilidades ─── */

    /**
     * Sanitiza texto para prevenir XSS al insertarlo en el DOM.
     * @param {string} str
     * @returns {string}
     */
    function sanitizar(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    /**
     * Establece el mensaje de error de un campo específico.
     * @param {HTMLElement} input
     * @param {HTMLElement} spanError
     * @param {string} mensaje
     */
    function setErrorCampo(input, spanError, mensaje) {
        spanError.textContent = mensaje;
        input.classList.add('input-error');
        input.classList.remove('input-valido');
    }

    /**
     * Limpia el error de un campo específico.
     * @param {HTMLElement} input
     * @param {HTMLElement} spanError
     */
    function limpiarErrorCampo(input, spanError) {
        spanError.textContent = '';
        input.classList.remove('input-error');
        input.classList.add('input-valido');
    }

    /**
     * Muestra una alerta global dinámica dentro del formulario.
     * @param {string} mensaje
     * @param {'error'|'exito'} tipo
     */
    function mostrarAlerta(mensaje, tipo) {
        let alerta = document.getElementById('registro-alerta');
        if (!alerta) {
            alerta = document.createElement('div');
            alerta.id = 'registro-alerta';
            alerta.style.cssText =
                'margin: 10px 0; padding: 10px 14px; border-radius: 6px; font-size: 0.9rem;';
            form.insertBefore(alerta, form.firstChild);
        }
        alerta.textContent = mensaje;
        if (tipo === 'exito') {
            alerta.style.background = '#d4edda';
            alerta.style.color = '#155724';
            alerta.style.border = '1px solid #c3e6cb';
        } else {
            alerta.style.background = '#f8d7da';
            alerta.style.color = '#721c24';
            alerta.style.border = '1px solid #f5c6cb';
        }
        alerta.style.display = 'block';
    }

    /** Oculta la alerta global. */
    function ocultarAlerta() {
        const alerta = document.getElementById('registro-alerta');
        if (alerta) alerta.style.display = 'none';
    }

    /* ─── Validaciones individuales ─── */

    /**
     * Valida el campo de nombres completos.
     * Mínimo 3 caracteres, solo letras y espacios.
     * @returns {boolean}
     */
    function validarNombre() {
        const val = nombreInput.value.trim();
        if (!val) {
            setErrorCampo(nombreInput, nombreError, 'El nombre es obligatorio.');
            return false;
        }
        if (val.length < 3) {
            setErrorCampo(nombreInput, nombreError, 'El nombre debe tener al menos 3 caracteres.');
            return false;
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(val)) {
            setErrorCampo(nombreInput, nombreError, 'El nombre solo puede contener letras y espacios.');
            return false;
        }
        limpiarErrorCampo(nombreInput, nombreError);
        return true;
    }

    /**
     * Valida el campo de edad.
     * Debe ser un número entre 18 y 120.
     * @returns {boolean}
     */
    function validarEdad() {
        const val = edadInput.value.trim();
        if (!val) {
            setErrorCampo(edadInput, edadError, 'La edad es obligatoria.');
            return false;
        }
        const edad = parseInt(val, 10);
        if (isNaN(edad) || edad < 18 || edad > 120) {
            setErrorCampo(edadInput, edadError, 'La edad debe estar entre 18 y 120 años.');
            return false;
        }
        limpiarErrorCampo(edadInput, edadError);
        return true;
    }

    /**
     * Calcula la edad en años a partir de una fecha de nacimiento.
     * @param {Date} fechaNac
     * @returns {number}
     */
    function calcularEdad(fechaNac) {
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
        return edad;
    }

    /**
     * Valida el campo de fecha de nacimiento.
     * No puede ser futura. Si la edad está ingresada, valida la coincidencia (±1 año).
     * @returns {boolean}
     */
    function validarFechaNacimiento() {
        const val = fechaNacimientoInput.value;
        if (!val) {
            setErrorCampo(fechaNacimientoInput, fechaNacimientoError, 'La fecha de nacimiento es obligatoria.');
            return false;
        }

        const fecha = new Date(val + 'T00:00:00'); // forzar hora local
        const hoy   = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fecha > hoy) {
            setErrorCampo(fechaNacimientoInput, fechaNacimientoError, 'La fecha de nacimiento no puede ser futura.');
            return false;
        }

        // Validación cruzada con el campo edad (±1 año de tolerancia)
        const edadVal = edadInput.value.trim();
        if (edadVal) {
            const edadIngresada   = parseInt(edadVal, 10);
            const edadCalculada   = calcularEdad(fecha);
            if (!isNaN(edadIngresada) && Math.abs(edadCalculada - edadIngresada) > 1) {
                setErrorCampo(
                    fechaNacimientoInput,
                    fechaNacimientoError,
                    'La fecha de nacimiento no coincide con la edad ingresada.'
                );
                return false;
            }
        }

        limpiarErrorCampo(fechaNacimientoInput, fechaNacimientoError);
        return true;
    }

    /**
     * Valida el formato del correo electrónico.
     * @returns {boolean}
     */
    function validarEmail() {
        const val   = emailInput.value.trim();
        const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (!val) {
            setErrorCampo(emailInput, emailError, 'El correo electrónico es obligatorio.');
            return false;
        }
        if (!regex.test(val)) {
            setErrorCampo(emailInput, emailError, 'Ingresa un correo electrónico válido.');
            return false;
        }
        limpiarErrorCampo(emailInput, emailError);
        return true;
    }

    /**
     * Valida el número de teléfono.
     * Solo dígitos, entre 7 y 15 caracteres.
     * @returns {boolean}
     */
    function validarTelefono() {
        const val = telefonoInput.value.trim();
        if (!val) {
            setErrorCampo(telefonoInput, telefonoError, 'El teléfono es obligatorio.');
            return false;
        }
        if (!/^\d{7,15}$/.test(val)) {
            setErrorCampo(telefonoInput, telefonoError, 'El teléfono debe contener entre 7 y 15 dígitos.');
            return false;
        }
        limpiarErrorCampo(telefonoInput, telefonoError);
        return true;
    }

    /**
     * Valida el campo de dirección.
     * Mínimo 5 caracteres.
     * @returns {boolean}
     */
    function validarDireccion() {
        const val = direccionInput.value.trim();
        if (!val) {
            setErrorCampo(direccionInput, direccionError, 'La dirección es obligatoria.');
            return false;
        }
        if (val.length < 5) {
            setErrorCampo(direccionInput, direccionError, 'La dirección debe tener al menos 5 caracteres.');
            return false;
        }
        limpiarErrorCampo(direccionInput, direccionError);
        return true;
    }

    /**
     * Валida todos los campos del formulario.
     * @returns {boolean} true si todos los campos son válidos.
     */
    function validarFormulario() {
        // Ejecutar todas para mostrar todos los errores simultáneamente
        const r1 = validarNombre();
        const r2 = validarEdad();
        const r3 = validarFechaNacimiento();
        const r4 = validarEmail();
        const r5 = validarTelefono();
        const r6 = validarDireccion();
        return r1 && r2 && r3 && r4 && r5 && r6;
    }

    /* ─── Validación en tiempo real (eventos input) ─── */

    nombreInput.addEventListener('input', function () {
        if (this.value.trim()) {
            validarNombre();
        } else {
            nombreError.textContent = '';
            nombreInput.classList.remove('input-error', 'input-valido');
        }
    });

    edadInput.addEventListener('input', function () {
        if (this.value.trim()) {
            validarEdad();
            // Re-validar fecha si ya está ingresada para actualizar el cruce
            if (fechaNacimientoInput.value) validarFechaNacimiento();
        } else {
            edadError.textContent = '';
            edadInput.classList.remove('input-error', 'input-valido');
        }
    });

    fechaNacimientoInput.addEventListener('input', function () {
        if (this.value) {
            validarFechaNacimiento();
        } else {
            fechaNacimientoError.textContent = '';
            fechaNacimientoInput.classList.remove('input-error', 'input-valido');
        }
    });

    emailInput.addEventListener('input', function () {
        if (this.value.trim()) {
            validarEmail();
        } else {
            emailError.textContent = '';
            emailInput.classList.remove('input-error', 'input-valido');
        }
    });

    telefonoInput.addEventListener('input', function () {
        if (this.value.trim()) {
            validarTelefono();
        } else {
            telefonoError.textContent = '';
            telefonoInput.classList.remove('input-error', 'input-valido');
        }
    });

    direccionInput.addEventListener('input', function () {
        if (this.value.trim()) {
            validarDireccion();
        } else {
            direccionError.textContent = '';
            direccionInput.classList.remove('input-error', 'input-valido');
        }
    });

    /* ─── Submit del formulario ─── */
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        ocultarAlerta();

        /* 1. Validar todos los campos */
        if (!validarFormulario()) return;

        /* 2. Deshabilitar botón durante el envío */
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Registrando...';

        /* 3. Recopilar y sanitizar datos */
        const datos = {
            nombre:          sanitizar(nombreInput.value.trim()),
            edad:            parseInt(edadInput.value.trim(), 10),
            fechaNacimiento: fechaNacimientoInput.value,
            email:           emailInput.value.trim().toLowerCase(),
            telefono:        telefonoInput.value.trim(),
            direccion:       sanitizar(direccionInput.value.trim())
        };

        /* 4. Enviar al backend */
        registrar(datos, btnSubmit);
    });

    /**
     * Envía los datos de registro al backend.
     * TODO: Reemplazar '/api/registro' con la URL real del backend cuando esté disponible.
     * @param {Object} datos - Datos del formulario
     * @param {HTMLElement} btnSubmit - Botón de envío para rehabilitarlo en caso de error
     */
    function registrar(datos, btnSubmit) {
        fetch('/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
        .then(function (response) {
            if (!response.ok) {
                return response.json().catch(function () {
                    return {};
                }).then(function (data) {
                    throw new Error(data.mensaje || 'Error al registrar. Intenta de nuevo.');
                });
            }
            return response.json();
        })
        .then(function () {
            mostrarAlerta('¡Registro exitoso! Redirigiendo al inicio de sesión...', 'exito');
            btnSubmit.textContent = 'Registro completado';

            setTimeout(function () {
                window.location.href = 'login.html';
            }, 2000);
        })
        .catch(function (err) {
            btnSubmit.disabled  = false;
            btnSubmit.textContent = 'Registrarse';

            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                mostrarAlerta('No se pudo conectar con el servidor. Intenta de nuevo más tarde.', 'error');
            } else {
                mostrarAlerta(sanitizar(err.message), 'error');
            }
        });
    }

})();
