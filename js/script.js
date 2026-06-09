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

const formulario = document.querySelector('form');

if(formulario){

    formulario.addEventListener('submit', function(event){

        event.preventDefault();


        // CAMPOS

        const nombre = formulario.querySelector('input[type="text"]');

        const email = formulario.querySelector('input[type="email"]');

        const asunto = formulario.querySelectorAll('input[type="text"]')[1];

        const mensaje = formulario.querySelector('textarea');


        // VALORES

        const nombreValor = nombre.value.trim();

        const emailValor = email.value.trim();

        const asuntoValor = asunto.value.trim();

        const mensajeValor = mensaje.value.trim();


        // VALIDACIÓN

        if(
            nombreValor === '' ||
            emailValor === '' ||
            asuntoValor === '' ||
            mensajeValor === ''
        ){

            alert('Por favor completa todos los campos.');

            return;
        }


        // VALIDACIÓN EMAIL

        const expresionEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!expresionEmail.test(emailValor)){

            alert('Ingresa un correo válido.');

            return;
        }


        // MENSAJE ÉXITO

        alert('Mensaje enviado correctamente ✈️');


        // LIMPIAR FORMULARIO

        formulario.reset();

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