const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/todos', (req,res) => {
    const data =fs.readFileSync('data.json');
    const todos = JSON.parse(data);

    res.json(todos);
})

app.get('/todos/:id', (req,res) => {
    const data = fs.readFileSync('data.json');
    const todos = JSON.parse(data);

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

app.post('/todos', (req,res) => {
    const data = fs.readFileSync('data.json');
        const todos = JSON.parse(data);
        
        const newTodo = {
            id: todos.length + 1,
            title: req.body.title,
            completed: false
        };

        todos.push(newTodo);

        fs.writeFileSync('data.json', JSON.stringify(todos));

        res.json (newTodo);
});

app.put('/todos/:id', (req,res) => {
    const data = fs.readFileSync('data.json');
    const todos = JSON.parse(data);

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

    fs.writeFileSync('data.json', JSON.stringify(todos, null, 2));

    res.json(todo);
});

app.delete('/todos/:id', (req,res) => {
    const data = fs.readFileSync('data.json');
    const todos = JSON.parse(data);

    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "invalid input"});
    }

    const updatedTodos = todos.filter(t => t.id !== id);

    if (updatedTodos.length === todos.length) {
        return res.status(404).json({ error: "not found"});
    }

    fs.writeFileSync('data.json', JSON.stringify(updatedTodos, null, 2));

    res.json({ message: "done broski, deleted"});
})


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});