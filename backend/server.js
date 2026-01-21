const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'complaints.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/api/complaints', upload.single('photo'), (req, res) => {
    try {
        const { name, rollNo, issueType, description, location } = req.body;
        const photo = req.file ? req.file.filename : null;

        const newComplaint = {
            id: Date.now(),
            name,
            rollNo,
            issueType,
            description,
            location,
            photo,
            timestamp: new Date().toISOString()
        };

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.push(newComplaint);

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        console.log('New complaint received:', newComplaint);
        res.status(201).json({ message: 'Complaint submitted successfully', data: newComplaint });
    } catch (error) {
        console.error('Error processing complaint:', error);
        res.status(500).json({ message: 'Error processing complaint' });
    }
});

app.use('/uploads', express.static(UPLOADS_DIR));

app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
