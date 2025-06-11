"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All task routes require authentication
router.use(auth_1.authenticateToken);
router.get('/tasks', taskController_1.getTasks);
router.post('/tasks', taskController_1.createTask);
router.put('/tasks/:id', taskController_1.updateTask);
router.delete('/tasks/:id', taskController_1.deleteTask);
exports.default = router;
