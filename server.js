const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const CONTENT_PATH = path.join(__dirname, 'data', 'content.json');

app.use(express.json({ limit: '2mb' }));

const uploadDirs = {
  inicio: 'img/inicio',
  destinos: 'img/destinos',
  galeria: 'img/galeria',
  blog: 'img/blog',
  videos: 'assets/videos',
  logo: 'img/logo'
};

Object.values(uploadDirs).forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

function readContent() {
  const raw = fs.readFileSync(CONTENT_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeContent(content) {
  fs.writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2), 'utf8');
}

function isAuthorized(req) {
  const token = req.headers['x-admin-token'];
  return token && token === ADMIN_PASSWORD;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const section = req.body.section || 'inicio';
    const dir = uploadDirs[section] || uploadDirs.inicio;
    cb(null, path.join(__dirname, dir));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase();
    cb(null, `${Date.now()}-${safeName || `upload${ext}`}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = /\.(jpe?g|png|gif|webp|mp4|webm)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido. Usa JPG, PNG, WEBP, GIF o MP4.'));
    }
  }
});

app.get('/api/content', (req, res) => {
  try {
    res.json(readContent());
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer el contenido.' });
  }
});

app.put('/api/content', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  try {
    writeContent(req.body);
    res.json({ ok: true, message: 'Contenido actualizado.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar el contenido.' });
  }
});

app.post('/api/upload', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  upload.single('imagen')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    const section = req.body.section || 'inicio';
    const dir = uploadDirs[section] || uploadDirs.inicio;
    const publicPath = `${dir}/${req.file.filename}`.replace(/\\/g, '/');

    res.json({
      ok: true,
      path: publicPath,
      message: 'Imagen subida correctamente.'
    });
  });
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    return res.json({ ok: true, token: ADMIN_PASSWORD });
  }

  res.status(401).json({ error: 'Contraseña incorrecta.' });
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Mile Viajera corriendo en http://localhost:${PORT}`);
});
