const Donation = require('../models/Donation');

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (Donors only)
exports.createDonation = async (req, res) => {
  try {
    req.body.donor = req.user.id;
    const donation = await Donation.create(req.body);
    
    res.status(201).json({
      success: true,
      data: donation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all donations for donors
// @route   GET /api/donations/donor
// @access  Private (Donors only)
exports.getDonorDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .sort('-createdAt');
    
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get available donations for receivers
// @route   GET /api/donations/available
// @access  Private (Receivers only)
exports.getAvailableDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ 
      status: 'pending',
      expiryDate: { $gt: new Date() }
    })
    .populate('donor', 'name organizationType')
    .sort('-createdAt');
    
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
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
      status: 'accepted'
    })
    .populate('donor', 'name organizationType')
    .sort('-createdAt');
    
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
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
        message: 'Donation not found'
      });
    }

    // Make sure donation is still pending
    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This donation is no longer available'
      });
    }

    // Check if donation has expired
    if (donation.expiryDate < new Date()) {
      donation.status = 'expired';
      await donation.save();
      
      return res.status(400).json({
        success: false,
        message: 'This donation has expired'
      });
    }

    donation.receiver = req.user.id;
    donation.status = 'accepted';
    await donation.save();

    res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
