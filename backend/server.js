require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, 'public', 'generated');
fs.mkdirSync(MODELS_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;
const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_BASE = 'https://api.tripo3d.ai/v2/openapi';

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const products = {};

if (!TRIPO_API_KEY) {
  console.warn('\n⚠️  TRIPO_API_KEY is not set. Copy .env.example to .env and add your key.\n');
}

const MIME_TO_TRIPO_TYPE = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

async function uploadToTripo(buffer, filename, mimetype) {
  const fileType = MIME_TO_TRIPO_TYPE[mimetype];
  if (!fileType) throw new Error('Unsupported image type. Use JPG, PNG, or WEBP.');

  const form = new FormData();
  form.append('file', buffer, {
    filename,
    contentType: mimetype,
  });

  const resp = await fetch(`${TRIPO_BASE}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TRIPO_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form.getBuffer(),
  });

  const data = await resp.json();
  if (!resp.ok || data.code !== 0) {
    console.error('Tripo upload failed:', {
      status: resp.status,
      statusText: resp.statusText,
      code: data.code,
      message: data.message,
      data,
    });
    throw new Error(`Tripo upload error: ${data.message || 'unknown error'}`);
  }
  return { file_token: data.data.image_token, type: fileType };
}

/**
 * POST /api/products
 * Accepts 1-4 photos. Single photo uses image_to_model.
 * 2+ photos use multiview_to_model (front, left, back, right).
 */
app.post('/api/products', upload.array('photos', 4), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }
    if (!TRIPO_API_KEY) {
      return res.status(500).json({ error: 'Server missing TRIPO_API_KEY' });
    }

    const { name = 'Untitled product' } = req.body;

    let angles;
    try {
      angles = JSON.parse(req.body.angles || '[]');
    } catch {
      angles = [];
    }

    // Upload each image to Tripo and collect file tokens
    const uploaded = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const angle = angles[i] || 'front';
      const info = await uploadToTripo(
        file.buffer,
        file.originalname || `photo_${i}.jpg`,
        file.mimetype,
      );
      uploaded.push({ angle, ...info });
    }

    let taskBody;

    if (uploaded.length === 1) {
      // Single photo — use image_to_model
      taskBody = {
        type: 'image_to_model',
        file: { type: uploaded[0].type, file_token: uploaded[0].file_token },
        texture: true,
        pbr: false,
      };
    } else {
      // Multi-photo — use multiview_to_model
      // API expects exactly 4 items in order: [front, left, back, right]
      const ORDER = ['front', 'left', 'back', 'right'];
      const tokenMap = {};
      for (const u of uploaded) {
        tokenMap[u.angle] = u;
      }

      const files = ORDER.map((angle) => {
        const u = tokenMap[angle];
        return u ? { type: u.type, file_token: u.file_token } : null;
      });

      // Ensure at least front is present
      if (!files[0]) {
        return res.status(400).json({ error: 'Front angle photo is required' });
      }

      // Remove trailing nulls (Tripo requires the array to have at least 2,
      // but trailing nulls after the last provided angle are okay)
      while (files.length > 1 && files[files.length - 1] === null) {
        files.pop();
      }

      if (files.length < 2) {
        return res.status(400).json({ error: 'Multiview requires at least 2 photos' });
      }

      taskBody = {
        type: 'multiview_to_model',
        files,
        texture: true,
        pbr: false,
      };
    }

    const taskResp = await fetch(`${TRIPO_BASE}/task`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TRIPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskBody),
    });

    const taskData = await taskResp.json();
    if (!taskResp.ok || taskData.code !== 0) {
      console.error('Tripo task creation failed:', taskData);
      return res.status(502).json({ error: 'Tripo API error', details: taskData });
    }

    const taskId = taskData.data.task_id;
    const productId = `p_${Date.now()}`;
    products[productId] = {
      id: productId,
      name,
      taskId,
      status: 'queued',
      mode: uploaded.length === 1 ? 'single' : 'multiview',
      angles: uploaded.map((u) => u.angle),
      modelUrls: null,
      createdAt: new Date().toISOString(),
    };

    res.json({ productId, taskId, status: 'queued' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

/**
 * GET /api/products/:id/status
 * Frontend polls this. We check Tripo, cache the result, and return it.
 */
app.get('/api/products/:id/status', async (req, res) => {
  const product = products[req.params.id];
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const FINAL_STATUSES = ['success', 'failed', 'banned', 'expired', 'cancelled'];
  if (FINAL_STATUSES.includes(product.status)) {
    return res.json(product);
  }

  try {
    const taskResp = await fetch(`${TRIPO_BASE}/task/${product.taskId}`, {
      headers: { Authorization: `Bearer ${TRIPO_API_KEY}` },
    });
    const taskData = await taskResp.json();

    if (!taskResp.ok || taskData.code !== 0) {
      console.error('Tripo status check failed:', taskData);
      return res.status(502).json({ error: 'Tripo API error', details: taskData });
    }

    const data = taskData.data;
    product.status = data.status;
    product.progress = data.progress;

    if (data.status === 'success') {
      const remoteUrl = data.output.pbr_model || data.output.model || data.output.base_model;
      const localFilename = `${product.id}.glb`;
      const localPath = path.join(MODELS_DIR, localFilename);

      const modelResp = await fetch(remoteUrl);
      if (!modelResp.ok) {
        throw new Error(`Failed to download model file: ${modelResp.status} ${modelResp.statusText}`);
      }
      const arrayBuffer = await modelResp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(localPath, buffer);

      product.modelUrls = { glb: `/generated/${localFilename}` };
      product.thumbnailUrl = data.output.rendered_image || null;
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

/**
 * GET /api/products
 * List everything generated so far, for the storefront view.
 */
app.get('/api/products', (req, res) => {
  res.json(Object.values(products));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
});