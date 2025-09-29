import React from 'react';
import { Typography, Container } from '@mui/material';

const Profile: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Page
      </Typography>
      <Typography variant="body1">
        This is the profile page content.
      </Typography>
    </Container>
  );
};

export default Profile;