const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Define the path to the JSON file where data will be stored
const todoFilePath = path.join(__dirname, 'todos.json');

// Utility function to read data from the JSON file
const readTodos = () => {
  if (!fs.existsSync(todoFilePath)) {
    fs.writeFileSync(todoFilePath, JSON.stringify([])); // If the file doesn't exist, create an empty array
  }
  const rawData = fs.readFileSync(todoFilePath);
  return JSON.parse(rawData);
};

// Utility function to save data to the JSON file
const saveTodos = (todos) => {
  fs.writeFileSync(todoFilePath, JSON.stringify(todos, null, 2));
};

// Get all todos
app.get('/todos', (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

// Add a new todo
app.post('/todos', (req, res) => {
  const todos = readTodos();
  const newTodo = req.body;
  newTodo.id = todos.length ? todos[todos.length - 1].id + 1 : 1; // Auto-increment ID
  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

// Update an existing todo
app.put('/todos/:id', (req, res) => {
  const todos = readTodos();
  const todoId = parseInt(req.params.id);
  const updatedTodo = req.body;

  const index = todos.findIndex(todo => todo.id === todoId);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updatedTodo };
    saveTodos(todos);
    res.json(todos[index]);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const todos = readTodos();
  const todoId = parseInt(req.params.id);

  const filteredTodos = todos.filter(todo => todo.id !== todoId);
  if (filteredTodos.length !== todos.length) {
    saveTodos(filteredTodos);
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
