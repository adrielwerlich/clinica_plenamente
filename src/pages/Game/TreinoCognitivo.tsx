import React from 'react';
import { Box } from '@mui/material';

// Jogo de treino cognitivo (build WebGL do Unity) servido de public/games/treino-cognitivo/.
// Mesma origem => compartilha o estado do Firebase Auth com o app.
const GAME_URL = `${process.env.PUBLIC_URL}/games/treino-cognitivo/index.html`;

const TreinoCognitivo: React.FC = () => (
    <Box sx={{ width: '100%', height: 'calc(100dvh - 64px)', bgcolor: '#000' }}>
        <iframe
            title="Treino Cognitivo"
            src={GAME_URL}
            allow="fullscreen; autoplay"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        />
    </Box>
);

export default TreinoCognitivo;
