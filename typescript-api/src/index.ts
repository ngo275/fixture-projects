import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'TypeScript Express API' });
});

app.get('/api/users', (req: Request, res: Response) => {
  res.json(users);
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/users', (req: Request, res: Response) => {
  const newUser: User = {
    id: users.length + 1,
    ...req.body
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});