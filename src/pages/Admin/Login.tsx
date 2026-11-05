import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LOGIN_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão. Confira a internet e tente de novo.',
  'auth/user-disabled': 'Esta conta está desativada.',
};

const Login: React.FC = () => {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const isAdmin = await signIn(email.trim(), password);
      if (!isAdmin) {
        await signOut();
        setError('Esta conta não tem acesso de administrador.');
        return;
      }
      navigate('/admin'); // redirect to dashboard
    } catch (err: any) {
      setError(LOGIN_ERRORS[err?.code] || 'Erro ao autenticar. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, borderRadius: 2, boxShadow: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" gutterBottom>Admin Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;