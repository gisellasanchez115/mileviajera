(function () {
    const page = document.body.dataset.page;
    if (!page) return;

    fetch('/api/content')
        .then((res) => res.json())
        .then((data) => {
            if (page === 'inicio') renderInicio(data.inicio);
            if (page === 'destinos') renderDestinos(data.destinos);
            if (page === 'galeria') renderGaleria(data.galeria);
            if (page === 'blog') renderBlog(data.blog);
            if (data.redes_sociales) renderRedes(data.redes_sociales);
        })
        .catch(() => {
            console.warn('Contenido dinámico no disponible, se muestran valores por defecto.');
        })
        .finally(() => {
            document.dispatchEvent(new CustomEvent('mileviajera:content-ready'));
        });

    function renderInicio(inicio) {
        setText('.hero-content h1', inicio.titulo_banner);
        setText('.hero-content p', inicio.subtitulo);

        const video = document.querySelector('.video-banner source');
        if (video && inicio.video_banner) {
            video.src = inicio.video_banner;
            video.parentElement.load();
        }

        setText('.sobre-texto h2', inicio.texto_sobre_titulo);
        setText('.sobre-texto p', inicio.texto_sobre);
        setImg('.sobre-img', inicio.imagen_sobre);

        const destinosRow = document.querySelector('.destinos .row.g-4');
        if (destinosRow && inicio.destinos_destacados) {
            destinosRow.innerHTML = inicio.destinos_destacados.map((d) => `
                <div class="col-md-4">
                    <div class="card-destino">
                        <img src="${d.imagen}" alt="${d.nombre}">
                        <div class="contenido-card">
                            <h3>${d.nombre}</h3>
                            <p>${d.descripcion}</p>
                            <a href="destinos.html">Explorar</a>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        const galeriaRow = document.querySelector('.galeria .row.g-4');
        if (galeriaRow && inicio.galeria_preview) {
            galeriaRow.innerHTML = inicio.galeria_preview.map((g) => `
                <div class="col-md-4">
                    <div class="imagen-galeria">
                        <img src="${g.imagen}" alt="${g.alt || 'Galería'}">
                    </div>
                </div>
            `).join('');
        }

        setText('.contenido-frase h2', `"${inicio.frase}"`);
        setText('.contenido-frase p', inicio.frase_autor);

        const fraseSection = document.querySelector('.frase');
        if (fraseSection && inicio.imagen_frase) {
            fraseSection.style.backgroundImage = `url('${inicio.imagen_frase}')`;
        }
    }

    function renderDestinos(destinos) {
        setText('.contenido-destinos h1', destinos.titulo);
        setText('.contenido-destinos p', destinos.subtitulo);

        const hero = document.querySelector('.hero-destinos');
        if (hero && destinos.banner) {
            hero.style.backgroundImage = `url('${destinos.banner}')`;
        }

        const row = document.querySelector('.pagina-destinos .row.g-4');
        if (row && destinos.items) {
            row.innerHTML = destinos.items.map((d) => `
                <div class="col-md-4">
                    <div class="card-destino">
                        <img src="${d.imagen}" alt="${d.nombre}">
                        <div class="info-destino">
                            <h3>${d.nombre}</h3>
                            <p>${d.descripcion}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function renderGaleria(galeria) {
        setText('.contenido-galeria h1', galeria.titulo);
        setText('.contenido-galeria p', galeria.subtitulo);

        const hero = document.querySelector('.hero-galeria');
        if (hero && galeria.banner) {
            hero.style.backgroundImage = `url('${galeria.banner}')`;
        }

        const row = document.querySelector('.pagina-galeria .row.g-4');
        if (row && galeria.items) {
            row.innerHTML = galeria.items.map((g) => `
                <div class="col-md-4">
                    <div class="foto-galeria">
                        <img src="${g.imagen}" alt="${g.alt || g.titulo}">
                    </div>
                </div>
            `).join('');
        }
    }

    function renderBlog(blog) {
        setText('.contenido-blog h1', blog.titulo);
        setText('.contenido-blog p', blog.subtitulo);

        const hero = document.querySelector('.hero-blog');
        if (hero && blog.banner) {
            hero.style.backgroundImage = `url('${blog.banner}')`;
        }

        const row = document.querySelector('.pagina-blog .row.g-4');
        if (row && blog.items) {
            row.innerHTML = blog.items.map((b) => `
                <div class="col-lg-4">
                    <div class="card-blog">
                        <img src="${b.imagen}" alt="${b.titulo}">
                        <div class="contenido-card-blog">
                            <h3>${b.titulo}</h3>
                            <p>${b.contenido}</p>
                            <a href="${b.enlace}" target="_blank" rel="noopener">Leer más</a>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function renderRedes(redes) {
        const container = document.querySelector('.redes-flotantes');
        if (!container) return;

        container.innerHTML = redes.map((r) => {
            const iconClass = r.icono === 'instagram'
                ? 'fa-brands fa-instagram'
                : r.icono === 'facebook'
                    ? 'fa-brands fa-facebook-f'
                    : 'fa-solid fa-link';
            return `<a href="${r.url}" target="_blank" rel="noopener"><i class="${iconClass}"></i></a>`;
        }).join('');
    }

    function setText(selector, text) {
        const el = document.querySelector(selector);
        if (el && text) el.textContent = text;
    }

    function setImg(selector, src) {
        const el = document.querySelector(selector);
        if (el && src) el.src = src;
    }
})();
