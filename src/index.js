import express from 'express';
import cors from 'cors';
import app from './app.js';
import { CONFIG } from './config/env.js';

const PORT = CONFIG.PORT || 3000; // Render définit PORT automatiquement

// Ajout du middleware CORS pour autoriser ton domaine Telegram WebApp
app.use(cors({
  origin: '*', // ou mets ici ton domaine précis si tu veux restreindre
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
