const express = require('express');
const fs = require('fs').promises;
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public-testing')));

const DATA_FILE = path.join(__dirname, 'data.json');

async function readTodos() {
  try {
    const data = await fs.readFile(DATA_FILE);
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

async function writeTodos(todos) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error("Error writing todos:", err);
  }
};

app.get("/debug-files", async (req, res) => {
  const files = await fs.readdir(path.join(__dirname, 'public-testing'));
  res.json(files);
});

app.get('/todos', async (req,res) => {
    const todos = await readTodos();
    res.json(todos);
});

app.get('/todos/:id', async (req,res) => {
    const todos = await readTodos();

    const id = Number(req.params.id);

    if(isNaN(id)) {
        return res.status(400).json({ error: "invalid input"});
    }

    const todo = todos.find(t => t.id === id);

    if (!todo) {
        return res.status(404).json({ error: "not found"});
    }

    res.json(todo);
});

app.post('/todos', async (req,res) => {
    const todos = await readTodos();

    if (!req.body.title || typeof req.body.title !== "string" || !req.body.title.trim()) {
  return res.status(400).json({ error: "title must be a non-empty string" });
};
        
        const newTodo = {
            id: todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1,
            title: req.body.title,
            completed: false
        };

        todos.push(newTodo);

        await writeTodos(todos);

        res.status(201).json(newTodo);
});

app.put('/todos/:id', async (req,res) => {
    const todos = await readTodos();

    const id = Number(req.params.id);

    if(isNaN(id)) {
        return res.status(400).json({ error: "invalid input"});
    }
    const todo = todos.find(t => t.id === id);

    if (!todo) {
    return res.status(404).json({error: "not found"});
    }

    if (req.body.title !== undefined) {
        todo.title = req.body.title;
    }

    if (req.body.completed !== undefined) {
        todo.completed = req.body.completed;
    }

    await writeTodos(todos);

    res.json(todo);
});

app.delete('/todos/:id', async (req,res) => {
    const todos = await readTodos();
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "invalid input"});
    }

    const updatedTodos = todos.filter(t => t.id !== id);

    if (updatedTodos.length === todos.length) {
        return res.status(404).json({ error: "not found"});
    }

    await writeTodos(updatedTodos);

    res.status(200).json({ message: "Todo deleted" });
})


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});