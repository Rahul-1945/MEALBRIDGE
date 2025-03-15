import React, { useState,useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createDonation } from '../../services/donation.service';

const foodTypes = [
  'Cooked Food',
  'Raw Ingredients',
  'Packaged Food',
  'Beverages',
  'Fruits & Vegetables',
  'Bakery Items',
  'Other'
];

const NewDonation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
const [pickupLocation,setpickupLocation] = useState([]);
  const [latitude,setLatitude] = useState(null);
  const [longitude,setLongitude] = useState(null);
  const API_KEY = "94675ddfc9344fd8bfc94aff3e6b01bb";
  const API_END_POINT = `https://api.opencagedata.com/geocode/v1/json`;
  let myCity = "";

  useEffect(() => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude);
                setLongitude(longitude);
            },
            (err) => {
                setError('Failed to fetch geolocation. Please allow location access.');
            }
        );
    } else {
        setError('Geolocation is not supported by this browser.');
    }
}, []);

const getUserCurrentLocation = async (latitude, longitude) => {
  let query = `${latitude},${longitude}`;
  let apiURL = `${API_END_POINT}?key=${API_KEY}&q=${query}&pretty=1`;

  try {
      const res = await fetch(apiURL);
      const data = await res.json();

      if (data && data.results && data.results.length > 0) {
          const result = data.results[0];
          setpickupLocation({
              formatted: result.formatted,
              city: result.components.city,
              state: result.components.state,
              country: result.components.country,
              postcode: result.components.postcode,
              town: result.components.town,
              village: result.components.village,
          });
      }
  } catch (error) {
      setError('Failed to fetch pickupLocation data.');
  }
};

useEffect(() => {
  if (latitude && longitude) {
      getUserCurrentLocation(latitude, longitude);
  }
}, [latitude, longitude]);

myCity = `${pickupLocation.village ? pickupLocation.village + ", " : ""}${pickupLocation.formatted}`;

  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    expiryDate: '',
    pickupLocation: '',
    additionalNotes: '',
    mealCount: ''
  });

useEffect(()=>{
    setFormData(prevState => ({
      ...prevState,
    pickupLocation: myCity!='undefined'?myCity : "VIT ,Pune"
  }));
  
  },[myCity])
console.log(myCity.length)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createDonation(formData);
      setSnackbar({
        open: true,
        message: 'Donation created successfully!',
        severity: 'success'
      });
      setTimeout(() => navigate('/donor/dashboard'), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error creating donation',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom color="primary" sx={{ mb: 4 }}>
          Create New Donation
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Food Type"
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                required
                variant="outlined"
              >
                {foodTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                variant="outlined"
                placeholder="e.g., 5 kg, 10 boxes"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Expiry Date & Time"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Meal Count"
                name="mealCount"
                value={formData.mealCount}
                onChange={handleChange}
                variant="outlined"
                placeholder="Number of meals"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pickup Location"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                required
                multiline
                rows={2}
                variant="outlined"
                placeholder="Complete pickupLocation for food pickup"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
                placeholder="Any special instructions or additional information"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/donor/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#4CAF50',
                    '&:hover': { bgcolor: '#388E3C' }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Donation'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewDonation;
