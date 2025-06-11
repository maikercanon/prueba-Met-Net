"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const Task_1 = require("../models/Task");
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { status } = req.query;
        let filter = { userId: req.user._id };
        if (status === 'completed')
            filter.completed = true;
        else if (status === 'pending')
            filter.completed = false;
        const tasks = yield Task_1.Task.find(filter).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: tasks
        });
    }
    catch (err) {
        console.error('Error getting tasks:', err);
        res.status(500).json({
            success: false,
            message: 'Error getting tasks'
        });
    }
});
exports.getTasks = getTasks;
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { title, description, priority, completed } = req.body;
        if (!title || title.trim() === '') {
            res.status(400).json({
                success: false,
                message: 'Title is required'
            });
            return;
        }
        const task = new Task_1.Task({
            title: title.trim(),
            description: (description === null || description === void 0 ? void 0 : description.trim()) || '',
            priority: priority || 'medium',
            completed: completed || false,
            userId: req.user._id
        });
        const savedTask = yield task.save();
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: savedTask
        });
    }
    catch (err) {
        console.error('Error creating task:', err);
        res.status(400).json({
            success: false,
            message: 'Error creating task'
        });
    }
});
exports.createTask = createTask;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        const { title, description, priority, completed } = req.body;
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Task ID is required'
            });
            return;
        }
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
            return;
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title.trim();
        if (description !== undefined)
            updateData.description = description.trim();
        if (priority !== undefined)
            updateData.priority = priority;
        if (completed !== undefined)
            updateData.completed = completed;
        // Find task and verify ownership
        const existingTask = yield Task_1.Task.findOne({ _id: id, userId: req.user._id });
        if (!existingTask) {
            res.status(404).json({
                success: false,
                message: 'Task not found or access denied'
            });
            return;
        }
        const updatedTask = yield Task_1.Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });
    }
    catch (err) {
        console.error('Error updating task:', err);
        res.status(400).json({
            success: false,
            message: 'Error updating task'
        });
    }
});
exports.updateTask = updateTask;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Task ID is required'
            });
            return;
        }
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
            return;
        }
        // Find and delete task, verify ownership
        const deletedTask = yield Task_1.Task.findOneAndDelete({ _id: id, userId: req.user._id });
        if (!deletedTask) {
            res.status(404).json({
                success: false,
                message: 'Task not found or access denied'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    }
    catch (err) {
        console.error('Error deleting task:', err);
        res.status(400).json({
            success: false,
            message: 'Error deleting task'
        });
    }
});
exports.deleteTask = deleteTask;
