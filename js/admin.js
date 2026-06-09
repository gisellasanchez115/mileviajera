let adminToken = sessionStorage.getItem('mv_admin_token');
let contentData = {};
const previewCache = new Map();

function normalizeImageSrc(src) {
    if (!src) return '';
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
        return src;
    }
    return src.startsWith('/') ? src : `/${src.replace(/^\/+/, '')}`;
}

function cachePreviewPath(path, dataUrl) {
    if (!path || !dataUrl) return;
    const key = path.replace(/\?.*$/, '');
    previewCache.set(key, dataUrl);
    try {
        sessionStorage.setItem(`mv-preview:${key}`, dataUrl);
    } catch {
        // Ignorar si sessionStorage está lleno
    }
}

function getCachedPreview(path) {
    if (!path) return null;
    const key = path.replace(/\?.*$/, '');
    if (previewCache.has(key)) return previewCache.get(key);
    try {
        const cached = sessionStorage.getItem(`mv-preview:${key}`);
        if (cached) previewCache.set(key, cached);
        return cached;
    } catch {
        return null;
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function applyPreviewImage(preview, src) {
    if (!preview) return;
    const box = preview.closest('.admin-preview-box');

    if (!src) {
        preview.removeAttribute('src');
        preview.classList.remove('visible');
        if (box) box.classList.remove('has-image');
        return;
    }

    if (src.startsWith('data:')) {
        preview.onerror = null;
        preview.src = src;
        preview.classList.add('visible');
        if (box) box.classList.add('has-image');
        return;
    }

    const normalized = normalizeImageSrc(src);
    const cacheKey = normalized.replace(/\?.*$/, '');

    preview.onerror = () => {
        const cached = getCachedPreview(cacheKey) || getCachedPreview(src);
        if (cached) {
            preview.onerror = null;
            preview.src = cached;
            preview.classList.add('visible');
            if (box) box.classList.add('has-image');
            return;
        }
        preview.classList.remove('visible');
        preview.removeAttribute('src');
        if (box) box.classList.remove('has-image');
    };

    preview.src = `${normalized}${normalized.includes('?') ? '&' : '?'}t=${Date.now()}`;
    preview.classList.add('visible');
    if (box) {
        box.classList.add('has-image');
        if (!box.contains(preview)) box.prepend(preview);
    }
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

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

function itemHeader(label, containerId) {
    return `
        <div class="admin-item-header">
            <span class="admin-item-label">${label}</span>
            <button type="button" class="btn btn-sm btn-outline-danger btn-delete-item" data-container="${containerId}" title="Eliminar">
                <i class="fa-solid fa-trash"></i> Eliminar
            </button>
        </div>
    `;
}

function setPreview(name, src) {
    document.querySelectorAll(`[data-preview="${name}"]`).forEach((img) => {
        applyPreviewImage(img, src);
    });
}

function updateCardPreview(preview, src) {
    applyPreviewImage(preview, src);
}

function ensurePreviewInBox(box) {
    if (!box) return null;
    let img = box.querySelector('.admin-preview');
    if (!img) {
        img = document.createElement('img');
        img.className = 'admin-preview';
        img.alt = 'Vista previa';
        box.prepend(img);
    }
    return img;
}

function getPreviewForInput(input) {
    const col = input.closest('.col-md-6, .col-md-4');
    if (col) {
        const box = col.querySelector('.admin-preview-box');
        if (box) return ensurePreviewInBox(box);
        const preview = col.querySelector('.admin-preview');
        if (preview) return preview;
    }
    if (input.dataset.target) {
        const el = document.querySelector(`[data-preview="${input.dataset.target}"]`);
        if (el) return el;
    }
    const card = input.closest('.admin-item-card');
    const cardBox = card?.querySelector('.admin-preview-box');
    if (cardBox) return ensurePreviewInBox(cardBox);
    return card?.querySelector('.admin-preview') || null;
}

function showLocalPreview(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
        readFileAsDataURL(file).then((dataUrl) => {
            updateCardPreview(getPreviewForInput(input), dataUrl);
        });
    }
}

function syncAllItemPreviews() {
    document.querySelectorAll('.admin-item-card').forEach((card) => {
        const pathInput = card.querySelector('[name*="_img_"]');
        const box = card.querySelector('.admin-preview-box');
        const preview = box ? ensurePreviewInBox(box) : card.querySelector('.admin-preview');
        if (pathInput && preview) {
            updateCardPreview(preview, pathInput.value.trim());
        }
    });
}

function previewBlock(src, alt = 'Vista previa') {
    const hasImage = Boolean(src);
    const safeAlt = escapeHtml(alt);
    const safeSrc = hasImage ? escapeHtml(normalizeImageSrc(src)) : '';
    return `
        <div class="admin-preview-box ${hasImage ? 'has-image' : ''}">
            ${hasImage ? `<img src="${safeSrc}" class="admin-preview visible" alt="${safeAlt}">` : ''}
            <span class="admin-preview-empty">Sin imagen</span>
        </div>
    `;
}

function syncPreviewsInPane(pane) {
    if (!pane) return;

    pane.querySelectorAll('.admin-item-card').forEach((card) => {
        const pathInput = card.querySelector('[name*="_img_"]');
        const box = card.querySelector('.admin-preview-box');
        const preview = box ? ensurePreviewInBox(box) : card.querySelector('.admin-preview');
        if (pathInput?.value.trim() && preview) {
            applyPreviewImage(preview, pathInput.value.trim());
        }
    });

    const previewFieldMap = {
        'imagen_sobre': 'imagen_sobre',
        'imagen_frase': 'imagen_frase',
        'banner-destinos': 'banner',
        'banner-galeria': 'banner',
        'banner-blog': 'banner'
    };

    pane.querySelectorAll('[data-preview]').forEach((img) => {
        const fieldName = previewFieldMap[img.dataset.preview];
        if (!fieldName) return;
        const input = pane.querySelector(`[name="${fieldName}"]`);
        if (input?.value.trim()) {
            applyPreviewImage(img, input.value.trim());
        }
    });
}

function bindTabPreviewRefresh() {
    if (adminPanel.dataset.tabPreviewBound) return;
    adminPanel.dataset.tabPreviewBound = 'true';

    document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tabEl) => {
        tabEl.addEventListener('shown.bs.tab', (event) => {
            const pane = document.querySelector(event.target.getAttribute('data-bs-target'));
            syncPreviewsInPane(pane);
        });
    });
}

function createDestinoCard(item, index, prefix, containerId) {
    const label = prefix === 'dest' ? `Destino ${index + 1}` : `Destacado ${index + 1}`;
    const ubicacionField = prefix === 'dest' ? `
        <div class="col-md-4">
            <label class="form-label">Ubicación</label>
            <input type="text" class="form-control" name="${prefix}_ubicacion_${index}" value="${item.ubicacion || ''}">
        </div>
    ` : '';

    return `
        <div class="admin-item-card" data-index="${index}">
            ${itemHeader(label, containerId)}
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" name="${prefix}_nombre_${index}" value="${item.nombre || ''}">
                </div>
                ${ubicacionField}
                <div class="col-md-${prefix === 'dest' ? '4' : '8'}">
                    <label class="form-label">Descripción</label>
                    <input type="text" class="form-control" name="${prefix}_desc_${index}" value="${item.descripcion || ''}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Ruta (automática)</label>
                    <input type="text" class="form-control path-field" name="${prefix}_img_${index}" value="${item.imagen || ''}" readonly placeholder="Se completa al subir la imagen">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Subir imagen</label>
                    <input type="file" class="form-control item-upload" data-prefix="${prefix}" data-index="${index}" data-section="${prefix === 'dest' ? 'destinos' : 'inicio'}" accept="image/*">
                    ${previewBlock(item.imagen, item.nombre || 'Vista previa')}
                </div>
            </div>
        </div>
    `;
}

function createInicioGaleriaCard(item, index, containerId) {
    return `
        <div class="admin-item-card" data-index="${index}">
            ${itemHeader(`Vista previa ${index + 1}`, containerId)}
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Texto alternativo</label>
                    <input type="text" class="form-control" name="inicio_gal_alt_${index}" value="${item.alt || ''}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Ruta (automática)</label>
                    <input type="text" class="form-control path-field" name="inicio_gal_img_${index}" value="${item.imagen || ''}" readonly placeholder="Se completa al subir">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Subir imagen</label>
                    <input type="file" class="form-control item-upload" data-prefix="inicio_gal" data-index="${index}" data-section="inicio" accept="image/*">
                    ${previewBlock(item.imagen, item.alt || 'Vista previa')}
                </div>
            </div>
        </div>
    `;
}

function createGaleriaCard(item, index, containerId) {
    return `
        <div class="admin-item-card" data-index="${index}">
            ${itemHeader(`Foto ${index + 1}`, containerId)}
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
                    <label class="form-label">Ruta (automática)</label>
                    <input type="text" class="form-control path-field" name="gal_img_${index}" value="${item.imagen || ''}" readonly placeholder="Se completa al subir">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Subir imagen</label>
                    <input type="file" class="form-control item-upload" data-prefix="gal" data-index="${index}" data-section="galeria" accept="image/*">
                    ${previewBlock(item.imagen, item.titulo || item.alt || 'Vista previa')}
                </div>
            </div>
        </div>
    `;
}

function createBlogCard(item, index, containerId) {
    return `
        <div class="admin-item-card" data-index="${index}">
            ${itemHeader(`Entrada ${index + 1}`, containerId)}
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
                    <label class="form-label">Ruta (automática)</label>
                    <input type="text" class="form-control path-field" name="blog_img_${index}" value="${item.imagen || ''}" readonly placeholder="Se completa al subir">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Subir imagen</label>
                    <input type="file" class="form-control item-upload" data-prefix="blog" data-index="${index}" data-section="blog" accept="image/*">
                    ${previewBlock(item.imagen, item.titulo || 'Vista previa')}
                </div>
            </div>
        </div>
    `;
}

function reindexContainer(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('.admin-item-card').forEach((card, i) => {
        card.dataset.index = i;
        const label = card.querySelector('.admin-item-label');
        if (label) label.textContent = config.label(i);

        config.fields.forEach((field) => {
            const input = card.querySelector(`[name^="${field.prefix}_"]`);
            if (input) input.name = `${field.prefix}_${field.suffix}_${i}`;
        });

        const fileInput = card.querySelector('.item-upload');
        if (fileInput) fileInput.dataset.index = i;
    });

    bindUploadInputs();
    document.querySelectorAll('.path-field').forEach((el) => { el.readOnly = true; });
}

const CRUD_INDEX = {
    'inicio-destinos-container': {
        label: (i) => `Destacado ${i + 1}`,
        fields: [
            { prefix: 'inicio_dest', suffix: 'nombre' },
            { prefix: 'inicio_dest', suffix: 'desc' },
            { prefix: 'inicio_dest', suffix: 'img' }
        ]
    },
    'inicio-galeria-container': {
        label: (i) => `Vista previa ${i + 1}`,
        fields: [
            { prefix: 'inicio_gal', suffix: 'alt' },
            { prefix: 'inicio_gal', suffix: 'img' }
        ]
    },
    'destinos-items-container': {
        label: (i) => `Destino ${i + 1}`,
        fields: [
            { prefix: 'dest', suffix: 'nombre' },
            { prefix: 'dest', suffix: 'ubicacion' },
            { prefix: 'dest', suffix: 'desc' },
            { prefix: 'dest', suffix: 'img' }
        ]
    },
    'galeria-items-container': {
        label: (i) => `Foto ${i + 1}`,
        fields: [
            { prefix: 'gal', suffix: 'titulo' },
            { prefix: 'gal', suffix: 'alt' },
            { prefix: 'gal', suffix: 'img' }
        ]
    },
    'blog-items-container': {
        label: (i) => `Entrada ${i + 1}`,
        fields: [
            { prefix: 'blog', suffix: 'titulo' },
            { prefix: 'blog', suffix: 'enlace' },
            { prefix: 'blog', suffix: 'contenido' },
            { prefix: 'blog', suffix: 'img' }
        ]
    }
};

function collectDestinoItems(containerId, prefix, withUbicacion) {
    const container = document.getElementById(containerId);
    return Array.from(container.querySelectorAll('.admin-item-card')).map((card) => {
        const item = {
            nombre: card.querySelector(`[name^="${prefix}_nombre_"]`)?.value.trim() || '',
            descripcion: card.querySelector(`[name^="${prefix}_desc_"]`)?.value.trim() || '',
            imagen: card.querySelector(`[name^="${prefix}_img_"]`)?.value.trim() || ''
        };
        if (withUbicacion) {
            item.ubicacion = card.querySelector(`[name^="${prefix}_ubicacion_"]`)?.value.trim() || '';
        }
        return item;
    });
}

function collectGaleriaItems(containerId) {
    const container = document.getElementById(containerId);
    return Array.from(container.querySelectorAll('.admin-item-card')).map((card) => ({
        titulo: card.querySelector('[name^="gal_titulo_"]')?.value.trim() || '',
        alt: card.querySelector('[name^="gal_alt_"]')?.value.trim() || '',
        imagen: card.querySelector('[name^="gal_img_"]')?.value.trim() || ''
    }));
}

function collectInicioGaleriaItems() {
    const container = document.getElementById('inicio-galeria-container');
    return Array.from(container.querySelectorAll('.admin-item-card')).map((card) => ({
        imagen: card.querySelector('[name^="inicio_gal_img_"]')?.value.trim() || '',
        alt: card.querySelector('[name^="inicio_gal_alt_"]')?.value.trim() || ''
    }));
}

function collectBlogItems() {
    const container = document.getElementById('blog-items-container');
    return Array.from(container.querySelectorAll('.admin-item-card')).map((card) => ({
        titulo: card.querySelector('[name^="blog_titulo_"]')?.value.trim() || '',
        contenido: card.querySelector('[name^="blog_contenido_"]')?.value.trim() || '',
        imagen: card.querySelector('[name^="blog_img_"]')?.value.trim() || '',
        enlace: card.querySelector('[name^="blog_enlace_"]')?.value.trim() || ''
    }));
}

function bindCrudActions() {
    if (adminPanel.dataset.crudBound) return;
    adminPanel.dataset.crudBound = 'true';

    adminPanel.addEventListener('click', (e) => {
        const btnAdd = e.target.closest('.btn-add-item');
        if (btnAdd) {
            const containerId = btnAdd.dataset.container;
            const container = document.getElementById(containerId);
            const index = container.children.length;

            if (containerId === 'inicio-destinos-container') {
                container.insertAdjacentHTML('beforeend', createDestinoCard({ nombre: '', descripcion: '', imagen: '' }, index, 'inicio_dest', containerId));
            } else if (containerId === 'inicio-galeria-container') {
                container.insertAdjacentHTML('beforeend', createInicioGaleriaCard({ alt: '', imagen: '' }, index, containerId));
            } else if (containerId === 'destinos-items-container') {
                container.insertAdjacentHTML('beforeend', createDestinoCard({ nombre: '', ubicacion: '', descripcion: '', imagen: '' }, index, 'dest', containerId));
            } else if (containerId === 'galeria-items-container') {
                container.insertAdjacentHTML('beforeend', createGaleriaCard({ titulo: '', alt: '', imagen: '' }, index, containerId));
            } else if (containerId === 'blog-items-container') {
                container.insertAdjacentHTML('beforeend', createBlogCard({ titulo: '', contenido: '', imagen: '', enlace: '' }, index, containerId));
            }

            reindexContainer(containerId, CRUD_INDEX[containerId]);
            syncAllItemPreviews();
            return;
        }

        const btnDelete = e.target.closest('.btn-delete-item');
        if (!btnDelete) return;

        const containerId = btnDelete.dataset.container;
        const card = btnDelete.closest('.admin-item-card');
        if (!card || !containerId) return;

        if (!confirm('¿Eliminar este elemento?')) return;

        card.remove();
        reindexContainer(containerId, CRUD_INDEX[containerId]);
        syncAllItemPreviews();
        showAlert('Elemento eliminado. Pulsa Guardar para aplicar los cambios.', 'warning');
    });
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
        (inicio.destinos_destacados || []).map((d, i) => createDestinoCard(d, i, 'inicio_dest', 'inicio-destinos-container')).join('');

    document.getElementById('inicio-galeria-container').innerHTML =
        (inicio.galeria_preview || []).map((g, i) => createInicioGaleriaCard(g, i, 'inicio-galeria-container')).join('');

    const destinos = contentData.destinos;
    const formDestinos = document.getElementById('form-destinos');
    ['titulo', 'subtitulo', 'banner'].forEach((field) => {
        formDestinos.querySelector(`[name="${field}"]`).value = destinos[field] || '';
    });
    setPreview('banner-destinos', destinos.banner);

    document.getElementById('destinos-items-container').innerHTML =
        (destinos.items || []).map((d, i) => createDestinoCard(d, i, 'dest', 'destinos-items-container')).join('');

    const galeria = contentData.galeria;
    const formGaleria = document.getElementById('form-galeria');
    ['titulo', 'subtitulo', 'banner'].forEach((field) => {
        formGaleria.querySelector(`[name="${field}"]`).value = galeria[field] || '';
    });
    setPreview('banner-galeria', galeria.banner);

    document.getElementById('galeria-items-container').innerHTML =
        (galeria.items || []).map((g, i) => createGaleriaCard(g, i, 'galeria-items-container')).join('');

    const blog = contentData.blog;
    const formBlog = document.getElementById('form-blog');
    ['titulo', 'subtitulo', 'banner'].forEach((field) => {
        formBlog.querySelector(`[name="${field}"]`).value = blog[field] || '';
    });
    setPreview('banner-blog', blog.banner);

    document.getElementById('blog-items-container').innerHTML =
        (blog.items || []).map((b, i) => createBlogCard(b, i, 'blog-items-container')).join('');

    bindUploadInputs();
    document.querySelectorAll('.path-field').forEach((el) => { el.readOnly = true; });
    syncAllItemPreviews();
    bindCrudActions();
    bindTabPreviewRefresh();

    document.querySelectorAll('.tab-pane.active').forEach((pane) => syncPreviewsInPane(pane));
}

function bindUploadInputs() {
    document.querySelectorAll('.upload-input').forEach((input) => {
        input.onchange = async () => {
            showLocalPreview(input);
            await handleUpload(input, getTargetNameForInput(input), { form: input.closest('form') });
        };
    });

    document.querySelectorAll('.item-upload').forEach((input) => {
        input.onchange = async () => {
            showLocalPreview(input);
            const targetName = getTargetNameForInput(input);
            if (targetName) {
                await handleUpload(input, targetName, { form: input.closest('form') });
            }
        };
    });
}

function getTargetNameForInput(input) {
    if (input.dataset.pathField) return input.dataset.pathField;

    const prefix = input.dataset.prefix;
    const index = input.dataset.index;

    if (prefix === 'gal') return `gal_img_${index}`;
    if (prefix === 'inicio_gal') return `inicio_gal_img_${index}`;
    if (prefix === 'blog') return `blog_img_${index}`;
    if (prefix === 'dest') return `dest_img_${index}`;
    if (prefix === 'inicio_dest') return `inicio_dest_img_${index}`;

    return input.dataset.target || null;
}

function findPathInput(form, targetFieldName) {
    if (form) {
        const inForm = form.querySelector(`[name="${targetFieldName}"]`);
        if (inForm) return inForm;
    }
    return document.querySelector(`[name="${targetFieldName}"]`);
}

function findPathInputInContext(form, input, pathFieldName) {
    const card = input.closest('.admin-item-card');
    if (card) {
        const inCard = card.querySelector('[name*="_img_"]');
        if (inCard) return inCard;
    }
    if (form) {
        const inForm = form.querySelector(`[name="${pathFieldName}"]`);
        if (inForm) return inForm;
    }
    return document.querySelector(`[name="${pathFieldName}"]`);
}

async function handleUpload(input, targetFieldName, options = {}) {
    const { silent = false, form = null } = options;

    if (!input.files.length) {
        return { ok: false, error: 'No hay archivo seleccionado.' };
    }

    const pathFieldName = getTargetNameForInput(input) || targetFieldName;
    const file = input.files[0];
    let localDataUrl = null;

    if (file.type.startsWith('image/')) {
        try {
            localDataUrl = await readFileAsDataURL(file);
        } catch {
            localDataUrl = null;
        }
    }

    const formData = new FormData();
    formData.append('section', input.dataset.section || 'inicio');
    formData.append('imagen', file);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'x-admin-token': adminToken },
            body: formData
        });

        let data = {};
        try {
            data = await res.json();
        } catch {
            data = { error: 'Respuesta inválida del servidor.' };
        }

        if (!res.ok) throw new Error(data.error || `Error ${res.status} al subir.`);

        if (localDataUrl) {
            cachePreviewPath(data.path, localDataUrl);
        }

        const target = findPathInputInContext(form || input.closest('form'), input, pathFieldName);
        if (target) {
            target.value = data.path;
            updateCardPreview(getPreviewForInput(input), data.path);
            if (input.dataset.target) {
                setPreview(input.dataset.target, data.path);
            }
        }

        if (!silent) showAlert('Archivo subido correctamente.');
        return { ok: true, path: data.path };
    } catch (error) {
        if (!silent) showAlert(error.message, 'danger');
        return { ok: false, error: error.message };
    }
}

async function uploadPendingFiles(form) {
    const fileInputs = form.querySelectorAll('input[type="file"]');

    for (const input of fileInputs) {
        if (!input.files.length) continue;

        const targetName = getTargetNameForInput(input);
        if (!targetName) continue;

        const card = input.closest('.admin-item-card');
        const pathInput = card
            ? card.querySelector('[name*="_img_"]')
            : findPathInputInContext(form, input, targetName);

        if (pathInput?.value.trim()) continue;

        const result = await handleUpload(input, targetName, { silent: true, form });
        if (!result.ok) {
            throw new Error(result.error || 'No se pudo subir la imagen.');
        }
    }
}

async function saveContent(updated, options = {}) {
    const res = await fetch('/api/content', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updated)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    contentData = updated;
    if (!options.silent) showAlert('Cambios guardados correctamente.');
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

    try {
        await uploadPendingFiles(form);
    } catch (error) {
        showAlert(error.message, 'danger');
        return;
    }

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
        destinos_destacados: collectDestinoItems('inicio-destinos-container', 'inicio_dest', false),
        galeria_preview: collectInicioGaleriaItems()
    };

    try {
        await saveContent(contentData);
        populateForms();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

document.getElementById('form-destinos').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
        await uploadPendingFiles(form);
    } catch (error) {
        showAlert(error.message, 'danger');
        return;
    }

    contentData.destinos = {
        titulo: form.titulo.value,
        subtitulo: form.subtitulo.value,
        banner: form.banner.value,
        items: collectDestinoItems('destinos-items-container', 'dest', true)
    };

    try {
        await saveContent(contentData);
        populateForms();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

document.getElementById('form-galeria').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
        await uploadPendingFiles(form);
    } catch (error) {
        showAlert(error.message, 'danger');
        return;
    }

    contentData.galeria = {
        titulo: form.titulo.value,
        subtitulo: form.subtitulo.value,
        banner: form.banner.value,
        items: collectGaleriaItems('galeria-items-container')
    };

    try {
        await saveContent(contentData);
        populateForms();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

document.getElementById('form-blog').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
        await uploadPendingFiles(form);
    } catch (error) {
        showAlert(error.message, 'danger');
        return;
    }

    contentData.blog = {
        titulo: form.titulo.value,
        subtitulo: form.subtitulo.value,
        banner: form.banner.value,
        items: collectBlogItems()
    };

    try {
        await saveContent(contentData);
        populateForms();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

if (adminToken) {
    loginPanel.classList.add('d-none');
    adminPanel.classList.remove('d-none');
    loadContent();
}
