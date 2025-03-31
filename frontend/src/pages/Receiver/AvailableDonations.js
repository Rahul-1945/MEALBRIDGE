import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
} from '@mui/material';
import { getAvailableDonations, acceptDonation } from '../../services/donation.service';
import { geocodeLocation } from '../../services/geocoding.service'; // Import geocoding service
import { useNavigate } from 'react-router-dom';

const AvailableDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [useManualLocation, setUseManualLocation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    if (useManualLocation && manualLocation) {
      try {
        setLoading(true);
        const { latitude, longitude } = await geocodeLocation(manualLocation); // Convert manual location to coordinates
        const data = await getAvailableDonations({ latitude, longitude, maxDistance: 10 });
        setDonations(data);
      } catch (err) {
        setError('Failed to fetch donations for the entered location');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          setLoading(true);
          const data = await getAvailableDonations({ latitude, longitude, maxDistance: 10 });
          setDonations(data);
        } catch (err) {
          setError('Failed to fetch available donations');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocationError('Unable to retrieve location. Please allow location access or enter your location manually.');
        setUseManualLocation(true); // Enable manual location input
        setLoading(false);
      }
    );
  };

  const handleAcceptClick = (donation) => {
    setSelectedDonation(donation);
    setDialogOpen(true);
  };

  const handleAcceptConfirm = async () => {
    setAcceptLoading(true);
    try {
      await acceptDonation(selectedDonation._id);
      setDialogOpen(false);
      await fetchDonations();
    } catch (err) {
      setError('Failed to accept donation');
    } finally {
      setAcceptLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (useManualLocation) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">Enter your location manually to find nearby donations.</Alert>
        <TextField
          label="Enter City or Postal Code"
          variant="outlined"
          fullWidth
          value={manualLocation}
          onChange={(e) => setManualLocation(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={fetchDonations}
          disabled={!manualLocation.trim()}
          sx={{ mt: 2 }}
        >
          Search Donations
        </Button>
      </Container>
    );
  }

  if (error || locationError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || locationError}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Donations
      </Typography>

      {/* Back Button */}
      <Button variant="contained" color="primary" onClick={() => navigate('/donor/dashboard')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      <Grid container spacing={3}>
        {donations.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">No available donations at the moment.</Alert>
          </Grid>
        ) : (
          donations.map((donation) => (
            <Grid item xs={12} key={donation._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {donation.foodType}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Quantity: {donation.quantity}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Pickup Location: {donation.pickupLocation}
                      </Typography>
                      {donation.additionalNotes && (
                        <Typography color="textSecondary">Notes: {donation.additionalNotes}</Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip label="Available" color="success" />
                      <Button variant="contained" color="primary" onClick={() => handleAcceptClick(donation)}>
                        Accept Donation
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Donor: {donation.donor?.name || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Expires: {new Date(donation.expiryDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Accept Donation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to accept this donation? You will be responsible for picking up the food from the
            specified location.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={acceptLoading}>
            Cancel
          </Button>
          <Button onClick={handleAcceptConfirm} color="primary" variant="contained" disabled={acceptLoading}>
            {acceptLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AvailableDonations;