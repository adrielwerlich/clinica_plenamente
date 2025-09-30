import React from 'react';
import { Box, Container, Typography, Paper, Grid, Link } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Button } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const Home: React.FC = () => {
  return (
    <Box>
      {/* Home Section */}
      <Box id="home"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'url(/images/background1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }
        }}>
        <Container maxWidth="lg">
          <Typography variant="h1" component="h1" gutterBottom align="center" sx={{
            color: 'white',
            fontFamily: '"Dancing Script", "Brush Script MT", cursive'
          }}>
            Bem-vindos à Clínica Plenamente
          </Typography>
          <Typography variant="h3" component="p" align="center" sx={{
            mt: 2, color: 'white',
            fontFamily: '"Dancing Script", "Brush Script MT", cursive'
          }}>
            Cuidando da sua saúde mental com profissionalismo e dedicação
          </Typography>
        </Container>
      </Box>

      {/* Treatment Section */}
      <Box id="treatment" sx={{ minHeight: '100vh', py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center">
            O Valor do Tratamento Psicológico
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid size={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Autoconhecimento
                </Typography>
                <Typography>
                  O tratamento psicológico oferece um espaço seguro para explorar seus pensamentos,
                  sentimentos e comportamentos, promovendo maior autoconhecimento.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Ferramentas de Enfrentamento
                </Typography>
                <Typography>
                  Desenvolva estratégias eficazes para lidar com desafios do dia a dia e
                  situações estressantes de forma mais saudável.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Terapia Cognitiva para Depressão
                </Typography>
                <Typography>
                  A terapia cognitivo-comportamental ajuda a identificar e modificar padrões de
                  pensamento negativos, oferecendo ferramentas eficazes no tratamento da depressão.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Tratamento para TEPT
                </Typography>
                <Typography>
                  Terapias especializadas para Transtorno de Estresse Pós-Traumático,
                  ajudando na superação de traumas e na recuperação da qualidade de vida.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={6} component="div">
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Terapia para Ansiedade
                </Typography>
                <Typography>
                  Técnicas comprovadas para o manejo da ansiedade, incluindo relaxamento,
                  reestruturação cognitiva e exposição gradual para reduzir sintomas ansiosos.
                </Typography>
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Transtornos de Personalidade
                </Typography>
                <Typography>
                  Tratamento especializado para transtornos de personalidade, focando no
                  desenvolvimento de habilidades interpessoais e regulação emocional.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mental Health Section */}
      <Box id="mental-health" sx={{ minHeight: '50vh', py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center">
            A Importância da Saúde Mental
          </Typography>
          <Typography variant="h6" component="p" align="center" sx={{ mt: 4, mb: 4 }}>
            A saúde mental é fundamental para o bem-estar geral e qualidade de vida
          </Typography>
          <Grid container spacing={4}>
            <Grid size={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Relacionamentos
                </Typography>
                <Typography>
                  Uma mente saudável contribui para relacionamentos mais satisfatórios
                </Typography>
              </Paper>
            </Grid>
            <Grid size={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Produtividade
                </Typography>
                <Typography>
                  O equilíbrio mental melhora o foco e a capacidade de trabalho
                </Typography>
              </Paper>
            </Grid>
            <Grid size={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Qualidade de Vida
                </Typography>
                <Typography>
                  Cuidar da mente promove maior satisfação e felicidade
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box id="contact" sx={{ minHeight: '50vh', py: 8, bgcolor: 'primary.dark', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center">
            Entre em Contato
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid size={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" gutterBottom>
                What'sApp
              </Typography>
              <Button
                component={Link}
                href="https://wa.me/5512933005814?text=Olá!%20Gostaria%20de%20agendar%20uma%20consulta."
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsAppIcon />}
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: '#25D366',
                    backgroundColor: '#25D366',
                    color: 'white'
                  }
                }}
              >
                12 93300-5814
              </Button>
            </Grid>
            <Grid size={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" gutterBottom>
                Redes sociais
              </Typography>
                <Button
                component={Link}
                href="https://www.instagram.com/plenamente_online/"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<InstagramIcon />}
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: '#E4405F',
                    backgroundColor: '#E4405F',
                    color: 'white'
                  }
                }}
              >
                Siga no Insta
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;