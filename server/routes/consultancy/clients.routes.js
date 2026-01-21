const express = require('express');
const router = express.Router();

// 1. Import the Controller Instance
// Since you did 'module.exports = new ClientController()', this is an object
const clientController = require('../../controllers/consultancy/clientController');

// 2. Import Middleware using DESTRUCTURING
// This is likely where your previous error was: importing the whole object instead of the function
const { protect } = require('../../middleware/auth.middleware');

// ================= ROUTES =================

// Create Client (POST /api/consultancy/clients)
router.post('/', protect, clientController.createClient);

// Get All (GET /api/consultancy/clients)
router.get('/', protect, clientController.getAllClients);

// Get Detail (GET /api/consultancy/clients/:clientId)
router.get('/:clientId', protect, clientController.getClientDetail);

// Update (PUT /api/consultancy/clients/:clientId)
router.put('/:clientId', protect, clientController.updateClient);

// Calculate Points (POST /api/consultancy/clients/:clientId/calculate-points)
router.post('/:clientId/calculate-points', protect, clientController.calculateVisaPoints);

// Delete (DELETE /api/consultancy/clients/:clientId)
router.delete('/:clientId', protect, clientController.deleteClient);

module.exports = router;