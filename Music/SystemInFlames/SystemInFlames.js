// VARIABLES GLOBALES
let cancionActual = null;
let estaReproduciendo = false;
let volumenActual = 70;
let volumenAnterior = 70;

// ELEMENTOS DEL DOM
const listaCanciones = document.querySelectorAll('.track');
const reproductorAudio = document.getElementById('audioPlayer');
const barraProgreso = document.getElementById('progressBar');
const rellenoProgreso = document.getElementById('progressFill');
const tiempoActual = document.getElementById('currentTime');
const tiempoTotal = document.getElementById('totalTime');
const tituloCancion = document.getElementById('playerTitle');
const artistaCancion = document.getElementById('playerArtist');
const imagenAlbum = document.getElementById('playerImage');
const barraVolumen = document.getElementById('volumeBar');
const rellenoVolumen = document.getElementById('volumeFill');
const botonAnterior = document.getElementById('botonAnterior');
const botonPlayPause = document.getElementById('botonPlayPause');
const botonSiguiente = document.getElementById('botonSiguiente');
const botonVolumen = document.getElementById('botonVolumen');
const iconoPlayPause = document.getElementById('iconoPlayPause');
const iconoVolumen = document.getElementById('iconoVolumen');


// CONFIGURACIÓN INICIAL
reproductorAudio.volume = volumenActual / 100;
rellenoVolumen.style.width = volumenActual + '%';


// FUNCIONES AUXILIARES
function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = Math.floor(segundos % 60);
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
}

function actualizarProgreso() {
    if (reproductorAudio.duration && tiempoActual && rellenoProgreso) {
        const porcentaje = (reproductorAudio.currentTime / reproductorAudio.duration) * 100;
        rellenoProgreso.style.width = porcentaje + '%';
        tiempoActual.textContent = formatearTiempo(reproductorAudio.currentTime);
    }
}

function actualizarIconoPlayPause() {
    if (estaReproduciendo) {
        iconoPlayPause.src = '../../assets/icons/boton-pause.png';
    } else {
        iconoPlayPause.src = '../../assets/icons/boton-play.png';
    }
}

function actualizarIconoVolumen() {
    if (volumenActual === 0) {
        iconoVolumen.src = '../../assets/icons/volumen-silenciado.png';
    } else if (volumenActual < 50) {
        iconoVolumen.src = '../../assets/icons/volumen-bajo.png';
    } else {
        iconoVolumen.src = '../../assets/icons/volumen-alto.png';
    }
}


// FUNCIONES PRINCIPALES
function cargarCancion(elementoCancion) {
    cancionActual = parseInt(elementoCancion.dataset.track);
    const titulo = elementoCancion.dataset.title;
    const artista = elementoCancion.dataset.artist;
    const rutaAudio = elementoCancion.dataset.audio;

    tituloCancion.textContent = titulo;
    artistaCancion.textContent = artista;
    
    reproductorAudio.src = rutaAudio;
    reproductorAudio.load();

    listaCanciones.forEach(cancion => cancion.classList.remove('active'));
    elementoCancion.classList.add('active');
    
    reproductorAudio.addEventListener('loadedmetadata', function actualizarDuracion() {
        if (reproductorAudio.duration && !isNaN(reproductorAudio.duration)) {
            const elementoDuracion = elementoCancion.querySelector('.track-duration');
            if (elementoDuracion) {
                elementoDuracion.textContent = formatearTiempo(reproductorAudio.duration);
            }
        }
        reproductorAudio.removeEventListener('loadedmetadata', actualizarDuracion);
    }, { once: true });
}

function reproducir() {
    if (cancionActual === null) {
        cargarCancion(listaCanciones[0]);
    }
    
    reproductorAudio.play().then(() => {
        estaReproduciendo = true;
        actualizarIconoPlayPause();
        // Asegurar que el nombre de la canción se muestre cuando se reproduce
        if (cancionActual !== null) {
            const elementoCancion = Array.from(listaCanciones).find(c => parseInt(c.dataset.track) === cancionActual);
            if (elementoCancion) {
                tituloCancion.textContent = elementoCancion.dataset.title;
                artistaCancion.textContent = elementoCancion.dataset.artist || 'Patchlove';
            }
        }
    }).catch(error => {
        console.error('Error al reproducir:', error);
        alert('Error al cargar el archivo de audio. Verifica que el archivo existe en la carpeta "Audio/".');
    });
}

function pausar() {
    reproductorAudio.pause();
    estaReproduciendo = false;
    actualizarIconoPlayPause();
}

function reproducirSiguiente() {
    if (cancionActual === null) {
        cargarCancion(listaCanciones[0]);
        reproducir();
        return;
    }
    
    const siguienteIndice = cancionActual + 1;
    if (siguienteIndice < listaCanciones.length) {
        cargarCancion(listaCanciones[siguienteIndice]);
        if (estaReproduciendo) reproducir();
    } else {
        cargarCancion(listaCanciones[0]);
        if (estaReproduciendo) reproducir();
    }
}

function reproducirAnterior() {
    if (cancionActual === null) {
        cargarCancion(listaCanciones[0]);
        reproducir();
        return;
    }
    
    const tiempoReproduccion = reproductorAudio.currentTime;
    if (tiempoReproduccion > 3) {
        reproductorAudio.currentTime = 0;
    } else {
        const anteriorIndice = cancionActual - 1;
        if (anteriorIndice >= 0) {
            cargarCancion(listaCanciones[anteriorIndice]);
            if (estaReproduciendo) reproducir();
    } else {
            reproductorAudio.currentTime = 0;
        }
    }
}

function ajustarProgresoDesdeMouse(evento) {
    if (reproductorAudio.duration) {
        const rectangulo = barraProgreso.getBoundingClientRect();
        const posicionX = evento.clientX - rectangulo.left;
        const porcentaje = Math.max(0, Math.min(1, posicionX / rectangulo.width));
        reproductorAudio.currentTime = porcentaje * reproductorAudio.duration;
    }
}

function ajustarVolumenDesdeMouse(evento) {
    const rectangulo = barraVolumen.getBoundingClientRect();
    const posicionX = evento.clientX - rectangulo.left;
    volumenActual = Math.floor((posicionX / rectangulo.width) * 100);
    volumenActual = Math.max(0, Math.min(100, volumenActual));
    reproductorAudio.volume = volumenActual / 100;
    rellenoVolumen.style.width = volumenActual + '%';
    actualizarIconoVolumen();
}

function cargarDuracionesCanciones() {
    listaCanciones.forEach(cancion => {
        const rutaAudio = cancion.dataset.audio;
        const audioTemporal = new Audio();
        audioTemporal.src = rutaAudio;
        
        audioTemporal.addEventListener('loadedmetadata', () => {
            if (audioTemporal.duration && !isNaN(audioTemporal.duration)) {
                const elementoDuracion = cancion.querySelector('.track-duration');
                if (elementoDuracion) {
                    elementoDuracion.textContent = formatearTiempo(audioTemporal.duration);
                }
            }
        });
        
        audioTemporal.load();
    });
}


// EVENTOS DEL REPRODUCTOR DE AUDIO
reproductorAudio.addEventListener('timeupdate', actualizarProgreso);
reproductorAudio.addEventListener('ended', reproducirSiguiente);
reproductorAudio.addEventListener('loadedmetadata', () => {
    if (tiempoTotal && reproductorAudio.duration && !isNaN(reproductorAudio.duration)) {
        tiempoTotal.textContent = formatearTiempo(reproductorAudio.duration);
    }
});
reproductorAudio.addEventListener('canplay', () => {
    if (tiempoTotal && reproductorAudio.duration && !isNaN(reproductorAudio.duration)) {
        tiempoTotal.textContent = formatearTiempo(reproductorAudio.duration);
    }
});
reproductorAudio.addEventListener('error', () => {
    alert('Error al cargar el archivo de audio. Verifica que el archivo existe y está en la ruta correcta.');
});


// EVENTOS DE LOS BOTONES
botonPlayPause.addEventListener('click', () => {
    if (estaReproduciendo) {
        pausar();
    } else {
        reproducir();
    }
});

botonAnterior.addEventListener('click', reproducirAnterior);
botonSiguiente.addEventListener('click', reproducirSiguiente);

listaCanciones.forEach(cancion => {
    cancion.addEventListener('click', () => {
        cargarCancion(cancion);
        reproducir();
    });
});


// CONTROL DE BARRA DE PROGRESO
let arrastrandoProgreso = false;

barraProgreso.addEventListener('mousedown', (evento) => {
    arrastrandoProgreso = true;
    ajustarProgresoDesdeMouse(evento);
});

document.addEventListener('mousemove', (evento) => {
    if (arrastrandoProgreso) {
        ajustarProgresoDesdeMouse(evento);
    }
});

document.addEventListener('mouseup', () => {
    arrastrandoProgreso = false;
});

barraProgreso.addEventListener('click', (evento) => {
    if (!arrastrandoProgreso) {
        ajustarProgresoDesdeMouse(evento);
    }
});


// CONTROL DE VOLUMEN
let arrastrandoVolumen = false;

barraVolumen.addEventListener('mousedown', (evento) => {
    arrastrandoVolumen = true;
    ajustarVolumenDesdeMouse(evento);
});

document.addEventListener('mousemove', (evento) => {
    if (arrastrandoVolumen) {
        ajustarVolumenDesdeMouse(evento);
    }
});

document.addEventListener('mouseup', () => {
    arrastrandoVolumen = false;
});

barraVolumen.addEventListener('click', (evento) => {
    if (!arrastrandoVolumen) {
        ajustarVolumenDesdeMouse(evento);
    }
});

botonVolumen.addEventListener('click', () => {
    if (volumenActual > 0) {
        volumenAnterior = volumenActual;
        volumenActual = 0;
        reproductorAudio.volume = 0;
        rellenoVolumen.style.width = '0%';
    } else {
        volumenActual = volumenAnterior;
        reproductorAudio.volume = volumenActual / 100;
        rellenoVolumen.style.width = volumenActual + '%';
    }
    actualizarIconoVolumen();
});


// INICIALIZACIÓN
actualizarIconoVolumen();
cargarDuracionesCanciones();


// CONTROLES DE TECLADO
document.addEventListener('keydown', (evento) => {
    switch(evento.code) {
        case 'Space':
            evento.preventDefault();
            if (estaReproduciendo) pausar();
            else reproducir();
            break;
        case 'ArrowRight':
            evento.preventDefault();
            if (evento.shiftKey) {
                reproducirSiguiente();
            } else if (reproductorAudio.duration) {
                reproductorAudio.currentTime = Math.min(reproductorAudio.currentTime + 10, reproductorAudio.duration);
            }
            break;
        case 'ArrowLeft':
            evento.preventDefault();
            if (evento.shiftKey) {
                reproducirAnterior();
            } else if (reproductorAudio.duration) {
                reproductorAudio.currentTime = Math.max(reproductorAudio.currentTime - 10, 0);
            }
            break;
    }
});