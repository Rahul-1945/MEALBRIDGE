import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
} from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Statistics = () => {
  const [stats, setStats] = useState({
    donations: 1000,
    users: 200,
    donors: 50,
    receivers: 150,
    organizations: 30,
  });

  const barData = {
    labels: ['Donations', 'Users', 'Donors', 'Receivers', 'Organizations'],
    datasets: [
      {
        label: 'Statistics',
        data: [stats.donations, stats.users, stats.donors, stats.receivers, stats.organizations],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#673AB7'],
      },
    ],
  };

  const pieData = {
    labels: ['Donors', 'Receivers'],
    datasets: [
      {
        label: 'User Distribution',
        data: [stats.donors, stats.receivers],
        backgroundColor: ['#FF9800', '#3F51B5'],
      },
    ],
  };

  return (
    <Box sx={{ py: 10, bgcolor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ mb: 6, color: '#2196F3', fontWeight: 'bold' }}
        >
          Donation & User Statistics
        </Typography>

        <Grid container spacing={4}>
          {Object.entries(stats).map(([key, value]) => (
            <Grid item xs={6} md={3} key={key}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4} sx={{ mt: 6 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  Donations & Users Overview
                </Typography>
                <Bar data={barData} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  User Distribution
                </Typography>
                <Pie data={pieData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Statistics;
