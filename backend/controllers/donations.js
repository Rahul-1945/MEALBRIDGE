const Donation = require('../models/Donation');

// Haversine formula to calculate distance
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (Donors only)
exports.createDonation = async (req, res) => {
  try {
    req.body.donor = req.user.id;
    const donation = await Donation.create(req.body);

    res.status(201).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get all donations for donors
// @route   GET /api/donations/donor
// @access  Private (Donors only)
exports.getDonorDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id }).sort('-createdAt');

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get available donations for receivers (Filtered by distance)
// @route   POST /api/donations/available
// @access  Private (Receivers only)
exports.getAvailableDonations = async (req, res) => {
  const { latitude, longitude, maxDistance = 10 } = req.body; // Default max distance 10 km

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Location required' });
  }

  try {
  
    const donations = await Donation.find({
      status: 'pending',
      expiryDate: { $gt: new Date() },
      latitude: { $exists: true },
      longitude: { $exists: true },
    }).populate('donor', 'name organizationType');

    // Filter donations within the given distance
    const nearbyDonations = donations.filter(donation => {
      const distance = haversine(latitude, longitude, donation.latitude, donation.longitude);
      return distance <= maxDistance;
    });

    res.status(200).json(nearbyDonations);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Get accepted donations for receivers
// @route   GET /api/donations/accepted
// @access  Private (Receivers only)
exports.getAcceptedDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      receiver: req.user.id,
      status: 'accepted',
    })
      .populate('donor', 'name organizationType')
      .sort('-createdAt');

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// @desc    Accept a donation
// @route   POST /api/donations/:id/accept
// @access  Private (Receivers only)
exports.acceptDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check if donation is still pending
    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This donation is no longer available',
      });
    }

    // Check if donation has expired
    if (donation.expiryDate < new Date()) {
      donation.status = 'expired';
      await donation.save();

      return res.status(400).json({
        success: false,
        message: 'This donation has expired',
      });
    }

    donation.receiver = req.user.id;
    donation.status = 'accepted';
    await donation.save();

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
