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
  inicio: 'uploads/inicio',
  destinos: 'uploads/destinos',
  galeria: 'uploads/galeria',
  blog: 'uploads/blog',
  videos: 'uploads/videos',
  logo: 'uploads/logo'
};

const mimeToExt = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/bmp': '.bmp',
  'video/mp4': '.mp4',
  'video/webm': '.webm'
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

function isAllowedFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = /\.(jpe?g|png|gif|webp|heic|heif|jfif|bmp|mp4|webm)$/i;
  const allowedMime = /^(image\/(jpeg|png|gif|webp|heic|heif|bmp|x-ms-bmp)|video\/(mp4|webm))/i;
  return allowedExt.test(ext) || allowedMime.test(file.mimetype || '');
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (isAllowedFile(file)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido. Usa JPG, PNG, WEBP, HEIC, GIF o MP4.'));
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
      return res.status(400).json({ error: 'No se recibió ningún archivo. Selecciona una imagen antes de guardar.' });
    }

    try {
      const section = req.body.section || 'inicio';
      const relativeDir = uploadDirs[section] || uploadDirs.inicio;
      const absoluteDir = path.join(__dirname, relativeDir);

      fs.mkdirSync(absoluteDir, { recursive: true });

      let ext = path.extname(req.file.originalname).toLowerCase();
      if (!ext && req.file.mimetype) {
        ext = mimeToExt[req.file.mimetype] || '';
      }
      if (!ext) {
        ext = req.file.mimetype?.startsWith('video/') ? '.mp4' : '.jpg';
      }

      const filename = `${Date.now()}-upload${ext}`;
      fs.writeFileSync(path.join(absoluteDir, filename), req.file.buffer);

      const publicPath = `${relativeDir}/${filename}`.replace(/\\/g, '/');

      res.json({
        ok: true,
        path: publicPath,
        message: 'Imagen subida correctamente.'
      });
    } catch (writeError) {
      console.error('Error al guardar archivo:', writeError);
      res.status(500).json({ error: 'No se pudo guardar el archivo en el servidor.' });
    }
  });
});

app.delete('/api/image', (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  const imagePath = req.body?.path;
  if (!imagePath) {
    return res.status(400).json({ error: 'Ruta de imagen requerida.' });
  }

  const normalized = imagePath.replace(/\\/g, '/');
  if (!normalized.startsWith('uploads/')) {
    return res.json({ ok: true, message: 'Referencia eliminada del contenido.' });
  }

  try {
    const fullPath = path.join(__dirname, normalized);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    res.json({ ok: true, message: 'Imagen eliminada.' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'No se pudo eliminar el archivo.' });
  }
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
