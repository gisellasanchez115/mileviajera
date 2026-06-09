// ========================================
// MILE VIAJERA - JAVASCRIPT PRINCIPAL
// ========================================


// ========================================
// NAVBAR CAMBIO AL HACER SCROLL
// ========================================

window.addEventListener('scroll', function(){

    const navbar = document.querySelector('.navbar');

    if(window.scrollY > 50){

        navbar.classList.add('navbar-scroll');
    }

    else{

        navbar.classList.remove('navbar-scroll');
    }

});


// ========================================
// MENÚ RESPONSIVE AUTOMÁTICO
// ========================================

const navLinks = document.querySelectorAll('.nav-link');

const navbarCollapse = document.querySelector('.navbar-collapse');

navLinks.forEach(function(link){

    link.addEventListener('click', function(){

        if(navbarCollapse.classList.contains('show')){

            new bootstrap.Collapse(navbarCollapse).toggle();
        }

    });

});


// ========================================
// EFECTO APARICIÓN AL HACER SCROLL
// ========================================

const elementos = document.querySelectorAll(
    '.card-destino, .card-blog, .foto-galeria, .formulario-contacto'
);

function mostrarElementos(){

    const alturaPantalla = window.innerHeight;

    elementos.forEach(function(elemento){

        const posicion = elemento.getBoundingClientRect().top;

        if(posicion < alturaPantalla - 100){

            elemento.classList.add('mostrar');
        }

    });

}

window.addEventListener('scroll', mostrarElementos);

mostrarElementos();


// ========================================
// BOTÓN VOLVER ARRIBA
// ========================================

const botonArriba = document.createElement('button');

botonArriba.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';

botonArriba.classList.add('boton-arriba');

document.body.appendChild(botonArriba);

window.addEventListener('scroll', function(){

    if(window.scrollY > 300){

        botonArriba.classList.add('mostrar-boton');
    }

    else{

        botonArriba.classList.remove('mostrar-boton');
    }

});

botonArriba.addEventListener('click', function(){

    window.scrollTo({

        top: 0,

        behavior: 'smooth'
    });

});


// ========================================
// FORMULARIO CONTACTO
// ========================================

const formularioContacto = document.getElementById('form-contacto');

if (formularioContacto) {

    formularioContacto.addEventListener('submit', async function (event) {

        event.preventDefault();

        const btnEnviar = document.getElementById('btn-enviar-contacto');
        const nombreValor = formularioContacto.nombre.value.trim();
        const emailValor = formularioContacto.correo.value.trim();
        const asuntoValor = formularioContacto.asunto.value.trim();
        const mensajeValor = formularioContacto.mensaje.value.trim();

        if (!nombreValor || !emailValor || !asuntoValor || !mensajeValor) {
            alert('Por favor completa todos los campos.');
            return;
        }

        const expresionEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!expresionEmail.test(emailValor)) {
            alert('Ingresa un correo válido.');
            return;
        }

        if (btnEnviar) {
            btnEnviar.disabled = true;
            btnEnviar.textContent = 'Enviando...';
        }

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombreValor,
                    correo: emailValor,
                    asunto: asuntoValor,
                    mensaje: mensajeValor
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'No se pudo enviar el mensaje.');
            }

            alert('Mensaje enviado correctamente ✈️');
            formularioContacto.reset();
        } catch (error) {
            alert(error.message || 'Error al enviar. Intenta más tarde.');
        } finally {
            if (btnEnviar) {
                btnEnviar.disabled = false;
                btnEnviar.textContent = 'Enviar mensaje';
            }
        }

    });

}

// ========================================
// TYPEWRITER SOLO EN INICIO
// ========================================

function iniciarTypewriterHero() {
    const tituloHero = document.querySelector('.hero-content h1');
    if (!tituloHero) return;

    const texto = tituloHero.textContent;
    tituloHero.textContent = '';
    let i = 0;

    function escribirTexto() {
        if (i < texto.length) {
            tituloHero.textContent += texto.charAt(i);
            i++;
            setTimeout(escribirTexto, 80);
        }
    }

    escribirTexto();
}

function iniciarTypewriterBanners() {
    const titulosBanner = document.querySelectorAll(
        '.contenido-destinos h1, .contenido-blog h1, .contenido-galeria h1, .contenido-contacto h1'
    );

    titulosBanner.forEach((titulo) => {
        const texto = titulo.textContent;
        let i = 0;
        let escribiendo = true;

        function efecto() {
            if (escribiendo) {
                titulo.textContent = texto.substring(0, i);
                i++;
                if (i > texto.length) {
                    escribiendo = false;
                    setTimeout(efecto, 800);
                    return;
                }
            } else {
                titulo.textContent = texto.substring(0, i);
                i--;
                if (i < 0) {
                    escribiendo = true;
                    i = 0;
                }
            }
            setTimeout(efecto, 75);
        }

        efecto();
    });
}

function iniciarEfectosTexto() {
    iniciarTypewriterHero();
    iniciarTypewriterBanners();
}

if (document.body.dataset.page) {
    document.addEventListener('mileviajera:content-ready', iniciarEfectosTexto);
} else {
    iniciarEfectosTexto();
}


// ========================================
// EFECTO HOVER IMÁGENES GALERÍA
// ========================================

const imagenesGaleria = document.querySelectorAll('.foto-galeria img');

imagenesGaleria.forEach(function(imagen){

    imagen.addEventListener('mouseenter', function(){

        imagen.style.transform = 'scale(1.1) rotate(1deg)';
    });


    imagen.addEventListener('mouseleave', function(){

        imagen.style.transform = 'scale(1) rotate(0deg)';
    });

});


// ========================================
// MENSAJE CONSOLA
// ========================================

console.log('Mile Viajera cargado correctamente ✈️🇨🇴');