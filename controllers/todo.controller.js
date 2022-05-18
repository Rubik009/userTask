const { default: mongoose } = require('mongoose');
const TodoList = require('../models/todo.model');

class ToDoListController {
    async getTasks() {
        const tasks = await TodoList.find();
        return tasks;
    }
    async getTaskById(id) {
        const task = await TodoList.find({ user_id: id });
        return task;
    }
    async addTask(id, title, isCompleted) {
        const task = new TodoList({
            user_id: id,
            title: title,
            isCompleted: isCompleted,
        })
        const savedTasks = task.save();
        return savedTasks;
    }
    async deleteTask(id, todo_id) {
        const task = await TodoList.deleteOne({ user_id: id, _id: todo_id });
        return task;
    }
    async editTask(id,todo_id, title, isCompleted) {
        const task = await TodoList.updateOne({ _id : todo_id, user_id: id  }, { $set: { title: title, isCompleted: isCompleted } });
        return task;
    }
}

module.exports = new ToDoListController();