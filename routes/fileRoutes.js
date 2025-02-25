const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Helper function to get absolute file path (prevents path traversal attacks)
const getFilePath = (fileName) => path.join(__dirname, '..', 'storage', path.basename(fileName));

// Helper function to check if a file is an Excel file
const isExcelFile = (fileName) => path.extname(fileName).toLowerCase() === '.xlsx';

router.get('/read', async (req, res) => {
  const fileName = req.query.fileName;

  if (!isExcelFile(fileName)) {
    return res.status(400).json({ error: 'Only Excel files (.xlsx) are allowed' });
  }

  try {
    const data = await fs.readFile(getFilePath(fileName), 'utf8');
    res.json({ content: data });
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

router.post('/append', async (req, res) => {
  const { fileName, content } = req.body;

  if (!isExcelFile(fileName)) {
    return res.status(400).json({ error: 'Only Excel files (.xlsx) are allowed' });
  }

  try {
    await fs.appendFile(getFilePath(fileName), content, 'utf8');
    res.json({ message: 'Content appended successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/rename', async (req, res) => {
  const { oldName, newName } = req.body;

  if (!oldName || !newName) {
    return res.status(400).json({ error: 'Both old and new file names are required' });
  }

  if (!isExcelFile(oldName) || !isExcelFile(newName)) {
    return res.status(400).json({ error: 'Only Excel files (.xlsx) are allowed' });
  }

  const oldFilePath = getFilePath(oldName);
  const newFilePath = getFilePath(newName);

  try {
    // Check if the old file exists
    await fs.access(oldFilePath);

    // Rename the file
    await fs.rename(oldFilePath, newFilePath);
    res.json({ message: 'File renamed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create-dir', async (req, res) => {
  const { dirName } = req.body;

  if (!dirName) {
    return res.status(400).json({ error: 'Directory name is required' });
  }

  const dirPath = getFilePath(dirName);

  try {
    await fs.mkdir(dirPath, { recursive: true });
    res.json({ message: 'Directory created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete-dir', async (req, res) => {
  const { dirName } = req.query;

  if (!dirName) {
    return res.status(400).json({ error: 'Directory name is required' });
  }

  const dirPath = getFilePath(dirName);

  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    res.json({ message: 'Directory deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/write', async (req, res) => {
  const { fileName, content } = req.body;

  if (!isExcelFile(fileName)) {
    return res.status(400).json({ error: 'Only Excel files (.xlsx) are allowed' });
  }

  try {
    await fs.writeFile(getFilePath(fileName), content, 'utf8');
    res.json({ message: 'File written successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete', async (req, res) => {
  const fileName = req.query.fileName;

  if (!isExcelFile(fileName)) {
    return res.status(400).json({ error: 'Only Excel files (.xlsx) are allowed' });
  }

  try {
    await fs.unlink(getFilePath(fileName));
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
