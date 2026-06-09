let adminToken = sessionStorage.getItem('mv_admin_token');
let contentData = {};

const loginPanel = document.getElementById('login-panel');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const alertBox = document.getElementById('alert-box');

function showAlert(message, type = 'success') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.classList.remove('d-none');
    setTimeout(() => alertBox.classList.add('d-none'), 4000);
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
    };
}

async function loadContent() {
    const res = await fetch('/api/content');
    contentData = await res.json();
    populateForms();
}

function setPreview(name, src) {
    document.querySelectorAll(`[data-preview="${name}"]`).forEach((img) => {
        if (src) {
            img.src = src;
            img.classList.add('visible');
        }
    });
}

function createDestinoCard(item, index, prefix) {
    return `
        <div class="admin-item-card" data-index="${index}">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" name="${prefix}_nombre_${index}" value="${item.nombre || ''}">
                </div>
                <div class="col-md-8">
                    <label class="form-label">Descripción</label>
                    <input type="text" class="form-control" name="${prefix}_desc_${index}" value="${item.descripcion || ''}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Imagen (ruta)</label>
                    <input type="text" class="form-control" name="${prefix}_img_${index}" value="${item.imagen || ''}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Subir imagen</label>
                    <input type="file" class="form-control item-upload" data-prefix="${prefix}" data-index="${index}" data-section="${prefix === 'dest' ? 'destinos' : 'inicio'}" accept="image/*">
                    ${item.imagen ? `<img src="${item.imagen}" class="admin-preview visible mt-2" alt="Vista previa">` : ''}
                </div>
            </div>
        </div>
    `;
}

function createGaleriaCard(item, index) {
    return `
        <div class="admin-item-card" data-index="${index}">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Título</label>
                    <input type="text" class="form-control" name="gal_titulo_${index}" value="${item.titulo || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Alt text</label>
                    <input type="text" class="form-control" name="gal_alt_${index}" value="${item.alt || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Imagen (ruta)</label>
                    <input type="text" class="form-control" name="gal_img_${index}" value="${item.imagen || ''}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Subir imagen</label>
                    <input type="file" class="form-control item-upload" data-prefix="gal" data-index="${index}" data-section="galeria" accept="image/*">
                    ${item.imagen ? `<img src="${item.imagen}" class="admin-preview visible mt-2" alt="Vista previa">` : ''}
                </div>
            </div>
        </div>
    `;
}

function createBlogCard(item, index) {
    return `
        <div class="admin-item-card" data-index="${index}">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Título</label>
                    <input type="text" class="form-control" name="blog_titulo_${index}" value="${item.titulo || ''}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Enlace</label>
                    <input type="url" class="form-control" name="blog_enlace_${index}" value="${item.enlace || ''}">
                </div>
                <div class="col-12">
                    <label class="form-label">Contenido</label>
                    <textarea class="form-control" name="blog_contenido_${index}" rows="2">${item.contenido || ''}</textarea>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Imagen (ruta)</label>
                    <input type="text" class="form-control" name="blog_img_${index}" value="${item.imagen || ''}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Subir imagen</label>
                    <input type="file" class="form-control item-upload" data-prefix="blog" data-index="${index}" data-section="blog" accept="image/*">
                    ${item.imagen ? `<img src="${item.imagen}" class="admin-preview visible mt-2" alt="Vista previa">` : ''}
                </div>
            </div>
        </div>
    `;
}

function populateForms() {
    const inicio = contentData.inicio;
    const formInicio = document.getElementById('form-inicio');

    ['titulo_banner', 'subtitulo', 'video_banner', 'texto_sobre_titulo', 'texto_sobre', 'imagen_sobre', 'frase', 'frase_autor', 'imagen_frase'].forEach((field) => {
        const input = formInicio.querySelector(`[name="${field}"]`);
        if (input) input.value = inicio[field] || '';
    });

    setPreview('imagen_sobre', inicio.imagen_sobre);
    setPreview('imagen_frase', inicio.imagen_frase);

    document.getElementById('inicio-destinos-container').innerHTML =
        inicio.destinos_destacados.map((d, i) => createDestinoCard(d, i, 'inicio_dest')).join('');

    document.getElementById('inicio-galeria-container').innerHTML =
        inicio.galeria_preview.map((g, i) => createGaleriaCard({ ...g, titulo: g.alt }, i)).join('');

    const destinos = contentData.destinos;
    const formDestinos = document.getElementById('form-destinos');
    ['titulo', 'subtitulo', 'banner'].forEach((field) => {
        formDestinos.querySelector(`[name="${field}"]`).value = destinos[field] || '';
    });
    setPreview('banner', destinos.banner);

    document.getElementById('destinos-items-container').innerHTML =
        destinos.items.map((d, i) => createDestinoCard(d, i, 'dest')).join('');

    const galeria = contentData.galeria;
    const formGaleria = document.getElementById('form-galeria');
    ['titulo', 'subtitulo', 'banner'].forEach((field) => {
        formGaleria.querySelector(`[name="${field}"]`).value = galeria[field] || '';
    });

    document.getElementById('galeria-items-container').innerHTML =
        galeria.items.map((g, i) => createGaleriaCard(g, i)).join('');

    const blog = contentData.blog;
    const formBlog = document.getElementById('form-blog');
    ['titulo', 'subtitulo', 'banner'].forEach((field) => {
        formBlog.querySelector(`[name="${field}"]`).value = blog[field] || '';
    });

    document.getElementById('blog-items-container').innerHTML =
        blog.items.map((b, i) => createBlogCard(b, i)).join('');

    bindUploadInputs();
}

function bindUploadInputs() {
    document.querySelectorAll('.upload-input').forEach((input) => {
        input.onchange = () => handleUpload(input, input.dataset.target);
    });

    document.querySelectorAll('.item-upload').forEach((input) => {
        input.onchange = () => {
            const prefix = input.dataset.prefix;
            const index = input.dataset.index;
            let targetName;

            if (prefix === 'gal') targetName = `gal_img_${index}`;
            else if (prefix === 'blog') targetName = `blog_img_${index}`;
            else if (prefix === 'dest') targetName = `dest_img_${index}`;
            else if (prefix === 'inicio_dest') targetName = `inicio_dest_img_${index}`;

            handleUpload(input, targetName);
        };
    });
}

async function handleUpload(input, targetFieldName) {
    if (!input.files.length) return;

    const formData = new FormData();
    formData.append('imagen', input.files[0]);
    formData.append('section', input.dataset.section);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'x-admin-token': adminToken },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const target = document.querySelector(`[name="${targetFieldName}"]`);
        if (target) {
            target.value = data.path;
            const preview = target.closest('.admin-item-card, .row')?.querySelector('.admin-preview');
            if (preview) {
                preview.src = data.path;
                preview.classList.add('visible');
            }
            setPreview(targetFieldName, data.path);
        }

        showAlert('Archivo subido correctamente.');
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function saveContent(updated) {
    const res = await fetch('/api/content', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updated)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    contentData = updated;
    showAlert('Cambios guardados correctamente.');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        adminToken = data.token;
        sessionStorage.setItem('mv_admin_token', adminToken);
        loginPanel.classList.add('d-none');
        adminPanel.classList.remove('d-none');
        await loadContent();
    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('d-none');
    }
});

document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('mv_admin_token');
    adminToken = null;
    adminPanel.classList.add('d-none');
    loginPanel.classList.remove('d-none');
});

document.getElementById('form-inicio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const destinos = contentData.inicio.destinos_destacados.map((_, i) => ({
        nombre: form.querySelector(`[name="inicio_dest_nombre_${i}"]`).value,
        descripcion: form.querySelector(`[name="inicio_dest_desc_${i}"]`).value,
        imagen: form.querySelector(`[name="inicio_dest_img_${i}"]`).value
    }));

    const galeria = contentData.inicio.galeria_preview.map((_, i) => ({
        imagen: form.querySelector(`[name="gal_img_${i}"]`).value,
        alt: form.querySelector(`[name="gal_titulo_${i}"]`).value
    }));

    contentData.inicio = {
        ...contentData.inicio,
        titulo_banner: form.titulo_banner.value,
        subtitulo: form.subtitulo.value,
        video_banner: form.video_banner.value,
        texto_sobre_titulo: form.texto_sobre_titulo.value,
        texto_sobre: form.texto_sobre.value,
        imagen_sobre: form.imagen_sobre.value,
        frase: form.frase.value,
        frase_autor: form.frase_autor.value,
        imagen_frase: form.imagen_frase.value,
        destinos_destacados: destinos,
        galeria_preview: galeria
    };

    try {
        await saveContent(contentData);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

document.getElementById('form-destinos').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const items = contentData.destinos.items.map((_, i) => ({
        nombre: form.querySelector(`[name="dest_nombre_${i}"]`).value,
        ubicacion: contentData.destinos.items[i].ubicacion || '',
        descripcion: form.querySelector(`[name="dest_desc_${i}"]`).value,
        imagen: form.querySelector(`[name="dest_img_${i}"]`).value
    }));

    contentData.destinos = {
        titulo: form.titulo.value,
        subtitulo: form.subtitulo.value,
        banner: form.banner.value,
        items
    };

    try {
        await saveContent(contentData);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

document.getElementById('form-galeria').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const cards = document.querySelectorAll('#galeria-items-container .admin-item-card');

    const items = Array.from(cards).map((card, i) => ({
        titulo: form.querySelector(`[name="gal_titulo_${i}"]`).value,
        alt: form.querySelector(`[name="gal_alt_${i}"]`).value,
        imagen: form.querySelector(`[name="gal_img_${i}"]`).value
    }));

    contentData.galeria = {
        titulo: form.titulo.value,
        subtitulo: form.subtitulo.value,
        banner: form.banner.value,
        items
    };

    try {
        await saveContent(contentData);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

document.getElementById('form-blog').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const items = contentData.blog.items.map((_, i) => ({
        titulo: form.querySelector(`[name="blog_titulo_${i}"]`).value,
        contenido: form.querySelector(`[name="blog_contenido_${i}"]`).value,
        imagen: form.querySelector(`[name="blog_img_${i}"]`).value,
        enlace: form.querySelector(`[name="blog_enlace_${i}"]`).value
    }));

    contentData.blog = {
        titulo: form.titulo.value,
        subtitulo: form.subtitulo.value,
        banner: form.banner.value,
        items
    };

    try {
        await saveContent(contentData);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

document.getElementById('btn-add-galeria').addEventListener('click', () => {
    const container = document.getElementById('galeria-items-container');
    const index = container.children.length;
    container.insertAdjacentHTML('beforeend', createGaleriaCard({ titulo: '', alt: '', imagen: '' }, index));
    bindUploadInputs();
});

if (adminToken) {
    loginPanel.classList.add('d-none');
    adminPanel.classList.remove('d-none');
    loadContent();
}
