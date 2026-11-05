import React from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

// Rotas /admin: exige a claim `admin` na sessão do admin. Jogadores nunca entram.
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAdmin, loading, authError } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress aria-label="Verificando acesso" />
      </Box>
    );
  }
  if (authError) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, px: 2 }}>
        <Alert severity="warning">{authError}</Alert>
      </Box>
    );
  }
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
};

export default ProtectedRoute;
