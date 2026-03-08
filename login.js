// No imports needed - firebase is a global from CDN

/**
 * login.js — MerqueEnvios
 * Seguridad: validación de campos, hashing SHA-256 (sin salt cliente),
 * protección contra fuerza bruta (bloqueo temporal), sanitización de inputs,
 * y protección básica contra XSS.
 */

(function () {
    'use strict';

    /* ─── Configuración de seguridad ─── */
    const MAX_INTENTOS       = 5;     // intentos fallidos antes de bloquear
    const BLOQUEO_MS         = 60000; // bloqueo de 60 segundos
    // SALT removed: salting must be done server-side, not in client-side code.
    const SESSION_KEY        = 'me_usuario';
    const INTENTOS_KEY       = 'me_intentos';
    const BLOQUEO_KEY        = 'me_bloqueo_hasta';

    /* ─── Elementos del DOM ─── */
    const form          = document.getElementById('loginForm');
    const emailInput    = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const toggleBtn     = document.getElementById('togglePassword');
    const eyeIcon       = document.getElementById('eyeIcon');
    const btnLogin      = document.getElementById('btnLogin');
    const alertaError   = document.getElementById('alerta-error');
    const alertaExito   = document.getElementById('alerta-exito');
    const emailError    = document.getElementById('email-error');
    const passError     = document.getElementById('password-error');
    const recuerdame    = document.getElementById('recuerdame');

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
     * Muestra una alerta de error global.
     * @param {string} mensaje
     */
    function mostrarError(mensaje) {
        alertaError.innerHTML = sanitizar(mensaje);
        alertaError.style.display = 'block';
        alertaExito.style.display = 'none';
    }

    /**
     * Muestra una alerta de éxito global.
     * @param {string} mensaje
     */
    function mostrarExito(mensaje) {
        alertaExito.innerHTML = sanitizar(mensaje);
        alertaExito.style.display = 'block';
        alertaError.style.display = 'none';
    }

    /** Oculta ambas alertas globales. */
    function limpiarAlertas() {
        alertaError.style.display = 'none';
        alertaExito.style.display = 'none';
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

    /* ─── Hash SHA-256 (sin salt cliente) ─── */

    /**
     * Genera el hash SHA-256 de la contraseña.
     * NOTE: No client-side salt is applied here. Proper salting must be done
     * server-side (e.g., bcrypt/argon2 with a per-user salt stored in the DB).
     * @param {string} password - contraseña en texto plano
     * @returns {string} - hash hexadecimal
     */
    function hashPassword(password) {
        if (typeof CryptoJS === 'undefined') {
            console.error('CryptoJS no está cargado.');
            return null;
        }
        return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    }

    // NOTE: Client-side rate limiting is UX-only. Real brute-force protection
    // must be enforced server-side (e.g., account lockout, CAPTCHA, IP throttling).

    /* ─── Control de intentos fallidos (protección fuerza bruta) ─── */

    function getIntentos() {
        return parseInt(sessionStorage.getItem(INTENTOS_KEY) || '0', 10);
    }

    function incrementarIntentos() {
        const intentos = getIntentos() + 1;
        sessionStorage.setItem(INTENTOS_KEY, intentos);
        if (intentos >= MAX_INTENTOS) {
            const bloqueoHasta = Date.now() + BLOQUEO_MS;
            sessionStorage.setItem(BLOQUEO_KEY, bloqueoHasta);
        }
        return intentos;
    }

    function resetIntentos() {
        sessionStorage.removeItem(INTENTOS_KEY);
        sessionStorage.removeItem(BLOQUEO_KEY);
    }

    /**
     * Verifica si la cuenta está bloqueada por exceso de intentos.
     * @returns {{ bloqueado: boolean, segundosRestantes: number }}
     */
    function checkBloqueo() {
        const bloqueoHasta = parseInt(sessionStorage.getItem(BLOQUEO_KEY) || '0', 10);
        if (bloqueoHasta && Date.now() < bloqueoHasta) {
            const ms = bloqueoHasta - Date.now();
            return { bloqueado: true, segundosRestantes: Math.ceil(ms / 1000) };
        }
        // Si el tiempo de bloqueo ya pasó, limpiar
        if (bloqueoHasta && Date.now() >= bloqueoHasta) {
            resetIntentos();
        }
        return { bloqueado: false, segundosRestantes: 0 };
    }

    /* ─── Validaciones de campos ─── */

    /**
     * Valida el formato del correo electrónico.
     * @param {string} email
     * @returns {boolean}
     */
    function validarEmail(email) {
        // RFC 5322 simplificado
        const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email.trim());
    }

    /**
     * Valida los requisitos mínimos de la contraseña para el login.
     * En el login solo se verifica que el campo no esté vacío.
     * La complejidad (mayúsculas, números, etc.) se valida únicamente en el registro.
     * @param {string} password
     * @returns {{ valido: boolean, mensaje: string }}
     */
    function validarPassword(password) {
        if (!password) {
            return { valido: false, mensaje: 'La contraseña es obligatoria.' };
        }
        return { valido: true, mensaje: '' };
    }

    /** Valida el formulario completo. Retorna true si es válido. */
    function validarFormulario() {
        let valido = true;

        const emailVal    = emailInput.value.trim();
        const passwordVal = passwordInput.value;

        // Validar email
        if (!emailVal) {
            setErrorCampo(emailInput, emailError, 'El correo electrónico es obligatorio.');
            valido = false;
        } else if (!validarEmail(emailVal)) {
            setErrorCampo(emailInput, emailError, 'Ingresa un correo electrónico válido.');
            valido = false;
        } else {
            limpiarErrorCampo(emailInput, emailError);
        }

        // Validar contraseña
        const resultPass = validarPassword(passwordVal);
        if (!resultPass.valido) {
            setErrorCampo(passwordInput, passError, resultPass.mensaje);
            valido = false;
        } else {
            limpiarErrorCampo(passwordInput, passError);
        }

        return valido;
    }

    /* ─── Toggle mostrar/ocultar contraseña ─── */
    toggleBtn.addEventListener('click', function () {
        const tipo = passwordInput.getAttribute('type');
        if (tipo === 'password') {
            passwordInput.setAttribute('type', 'text');
            eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
            toggleBtn.setAttribute('aria-label', 'Ocultar contraseña');
        } else {
            passwordInput.setAttribute('type', 'password');
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
            toggleBtn.setAttribute('aria-label', 'Mostrar contraseña');
        }
    });

    /* ─── Validación en tiempo real ─── */
    emailInput.addEventListener('input', function () {
        const val = this.value.trim();
        if (val && !validarEmail(val)) {
            setErrorCampo(emailInput, emailError, 'Correo electrónico no válido.');
        } else if (val) {
            limpiarErrorCampo(emailInput, emailError);
        } else {
            emailError.textContent = '';
            emailInput.classList.remove('input-error', 'input-valido');
        }
    });

    passwordInput.addEventListener('input', function () {
        const val = this.value;
        if (val) {
            limpiarErrorCampo(passwordInput, passError);
        } else {
            passError.textContent = '';
            passwordInput.classList.remove('input-error', 'input-valido');
        }
    });

    /* ─── Cargar email si "Recuérdame" estaba activo ─── */
    (function cargarRecuerdame() {
        const emailGuardado = localStorage.getItem('me_email_recordado');
        if (emailGuardado) {
            emailInput.value = emailGuardado;
            recuerdame.checked = true;
        }
    })();

    /* ─── Verificar si vino de login con Google ─── */
    (function verificarGoogleLogin() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('google_login') === 'success') {
            // Limpiar la URL
            window.history.replaceState({}, document.title, 'login.html');
            // Mostrar mensaje de éxito
            const usuario = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
            mostrarExito('¡Bienvenido! Has iniciado sesión con Google como ' + (usuario.email || ''));
        }
    })();

    /* ─── Submit del formulario ─── */
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        limpiarAlertas();

        /* 1. Verificar bloqueo por fuerza bruta */
        const { bloqueado, segundosRestantes } = checkBloqueo();
        if (bloqueado) {
            mostrarError(
                `Demasiados intentos fallidos. Intenta de nuevo en ${segundosRestantes} segundo(s).`
            );
            return;
        }

        /* 2. Validar campos */
        if (!validarFormulario()) return;

        /* 3. Deshabilitar botón y mostrar spinner */
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<span class="spinner"></span> Verificando...';

        /* 4. Obtener y sanitizar valores */
        const email    = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        /* 5. Hash SHA-256 de la contraseña (sin salt cliente) */
        const passwordHash = hashPassword(password);
        if (!passwordHash) {
            mostrarError('Error de seguridad: no se pudo encriptar la contraseña.');
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
            return;
        }

        /* 6. Limpiar contraseña del input inmediatamente por seguridad */
        passwordInput.value = '';

        /* 7. Enviar credenciales al backend */
        autenticar(email, passwordHash);
    });

    /**
     * Autentica al usuario enviando las credenciales al backend.
     * TODO: Replace the endpoint URL ('/api/login') with the real backend URL once available.
     *
     * @param {string} email
     * @param {string} passwordHash
     */
    function autenticar(email, passwordHash) {
        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, passwordHash })
        })
        .then(function (response) {
            if (!response.ok) {
                return response.json().catch(function () {
                    return {};
                }).then(function (data) {
                    throw new Error(data.mensaje || 'Correo o contraseña incorrectos.');
                });
            }
            return response.json();
        })
        .then(function (data) {
            resetIntentos();

            // Guardar email si "Recuérdame" está activo
            if (recuerdame.checked) {
                localStorage.setItem('me_email_recordado', email);
            } else {
                localStorage.removeItem('me_email_recordado');
            }

            // Guardar sesión (solo identificador, NUNCA el hash)
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email, timestamp: Date.now() }));

            mostrarExito('¡Sesión iniciada correctamente! Redirigiendo...');
            btnLogin.textContent = 'Accediendo...';

            setTimeout(function () {
                // Redirigir al dashboard (ajusta la ruta según tu proyecto)
                window.location.href = 'index.html';
            }, 1500);
        })
        .catch(function (err) {
            const intentos = incrementarIntentos();
            const restantes = MAX_INTENTOS - intentos;

            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';

            if (restantes <= 0) {
                mostrarError(
                    `Cuenta bloqueada por ${BLOQUEO_MS / 1000} segundos por exceso de intentos fallidos.`
                );
            } else if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                mostrarError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
            } else {
                mostrarError(
                    `${sanitizar(err.message)} Te quedan ${restantes} intento(s) antes del bloqueo.`
                );
            }
        });
    }

    /* ─── Prevenir inspección de la contraseña desde consola (protección básica) ─── */
    // Limpiar referencias sensibles cuando se sale de la página
    window.addEventListener('beforeunload', function () {
        passwordInput.value = '';
    });

    /* ─── Iniciar sesión con Google ─── */
    const btnGoogle    = document.getElementById('btnGoogle');
    const overlayGoogle = document.getElementById('overlay-google');

    function mostrarOverlayGoogle() {
        if (overlayGoogle) overlayGoogle.style.display = 'flex';
    }

    function ocultarOverlayGoogle() {
        if (overlayGoogle) overlayGoogle.style.display = 'none';
    }

    if (btnGoogle) {
        btnGoogle.addEventListener('click', function () {
            alert('Botón clickeado, iniciando redirect...');
            limpiarAlertas();
            btnGoogle.disabled = true;

            const provider = new firebase.auth.GoogleAuthProvider();
            console.log('Iniciando Google Sign-In con redirect...');
            
            firebase.auth().signInWithRedirect(provider);
        });
    }

    /* ─── Verificar resultado de redirect ─── */
    firebase.auth().getRedirectResult()
        .then(function (result) {
            console.log('Google redirect resultado:', result);
            if (result.user) {
                const user = result.user;
                sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                    email: user.email,
                    nombre: user.displayName,
                    timestamp: Date.now()
                }));
                window.location.href = 'login.html?google_login=success';
            }
        })
        .catch(function (error) {
            console.error('Google redirect error:', error);
            alert('Error: ' + (error.message || error.code || 'desconocido'));
            if (error.code === 'auth/unauthorized-domain') {
                mostrarError('Dominio no autorizado. Contacta al administrador.');
            } else if (error.code === 'auth/operation-not-allowed') {
                mostrarError('Google Sign-In no está habilitado en Firebase Console.');
            } else if (error.code) {
                mostrarError('Error: ' + (error.message || 'No se pudo iniciar sesión con Google.'));
            }
            // Si no hay usuario y hay error, no hacer nada (el usuario probablemente canceló)
        });

})();
