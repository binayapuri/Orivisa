// File: server/routes/application.routes.js

const express = require('express');
const router = express.Router();
const {
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
  getApplications,
  changeStatus,
  addNote,
  getTimeline,
  uploadDocument,
  getDocuments,
  deleteDocument,
  submitToCollege,
  withdrawApplication
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const tenantIsolation = require('../middleware/tenantIsolation.middleware');
const upload = require('../config/multer.config');

router.use(protect);
router.use(tenantIsolation);

router.route('/')
  .get(getApplications)
  .post(authorize('agent', 'student'), createApplication);

router.route('/:id')
  .get(getApplication)
  .put(authorize('agent'), updateApplication)
  .delete(authorize('agent', 'admin'), deleteApplication);

router.put('/:id/status', authorize('agent', 'admin'), changeStatus);
router.post('/:id/notes', authorize('agent'), addNote);
router.get('/:id/timeline', getTimeline);

router.post('/:id/documents', upload.array('files', 10), uploadDocument);
router.get('/:id/documents', getDocuments);
router.delete('/:id/documents/:documentId', deleteDocument);

router.post('/:id/submit', authorize('agent'), submitToCollege);
router.post('/:id/withdraw', withdrawApplication);

module.exports = router;
