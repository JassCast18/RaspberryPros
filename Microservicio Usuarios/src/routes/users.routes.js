const express = require('express');
const usersController = require('../controllers/users.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { asyncHandler } = require('../utils/async-handler');

const router = express.Router();

router.use(authenticate);
router.get('/', requireRole('admin'), asyncHandler(usersController.list));
router.get('/:id', asyncHandler(usersController.getById));

module.exports = router;
