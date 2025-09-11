import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

console.log('Iniciando servidor de prueba...');

app.get('/', (req, res) => {
  res.json({ message: 'Servidor de prueba funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor de prueba corriendo en http://localhost:${PORT}`);
});