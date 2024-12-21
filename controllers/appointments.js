const Appointment = require('../models/Appointment')
const Hospital = require('../models/Hospital')

//@desc    Get all appointments
//@route   GET /api/v1/appointments
//@access  Public
exports.getAppointments = async (req, res, next) => {
  let query
  // General user can see only their appointments
  if (req.user.role != 'admin') {
    query = Appointment.find({user: req.user.id}).populate({
      path: 'hospital',
      select: 'name province tel'
    })
  } else {
    if (req.params.hospitalId) {
      console.log(req.params.hospitalId)
      query = Appointment.find({ hospital: req.params.hospitalId }).populate({
        path: 'hospital',
        select: 'name province tel'
      })
    } else {
      query = Appointment.find().populate({
        path: 'hospital',
        select: 'name province tel'
      })
    }
  }

  try {
    const appointments = await query

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    })
  }
  catch(err) {
    console.log(err)
    return res.status(500).json({success: false, message: "Cannot find appointment"})
  }
}

//@desc    Get single appointments
//@route   GET /api/v1/appointments
//@access  Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: 'hospital', 
      select: 'name description tel'
    })

    if (!appointment) {
      res.status(404).json({success: false, message: `No appointment with the ID of ${req.params.id}`})
    }

    res.status(200).json({success: true, data: appointment})
  } catch(err) {
    console.log(err)
    return res.status(500).json({success: false, message: "Cannot find Appointment"})
  }
}

//@desc    Add appointments
//@route   POST /api/v1/hospitals/:hospitalId/appointment
//@access  Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.hospital = req.params.hospitalId

    const hospital = await Hospital.findById(req.params.hospitalId)

    if (!hospital) {
      return res.status(404).json({
        success: false, 
        message: `No appointment with the ID of ${req.params.id}`})
    }
    console.log(req.body)

    // add user Id to req.body
    req.body.user = req.user.id
    // Check for existed appointment
    const existedAppointments = await Appointment.find({user: req.user.id})
    // If the user is not admin, they can only create 3 appointment at most
    if (existedAppointments.length >= 3 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} can only have at most 3 appointment`
      })
    }

    const appointment = await Appointment.create(req.body)

    res.status(200).json({
      success: true,
      data: appointment
    })
  } catch(err) {
    console.log(err)
    res.status(500).json({success: false, message: "Cannot create Appointment"})
  }
}

//@desc    Update appointments
//@route   PUT /api/v1/appointment/:id
//@access  Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id) 

    if (!appointment) {
      res.status(404).json({success: false, message: `No appointment with the ID of ${req.params.id}`})
    }

    // Make sure user is the appointment owner
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to updatea this bootcamp`
      })
    }
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new : true,
      runValidators: true
    })

    res.staus(200).json({
      success: true,
      data: appointment
    })
  } catch(err) {
    console.log(err)
    return res.status(500).json({success: false, message: "Cannot update Appointment"})
  }
}

//@desc    Delete appointments
//@route   DELETE /api/v1/appointment/:id
//@access  Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id) 

    if (!appointment) {
      return res.status(404).json({success: false, message: `No appointment with the id of ${req.params.id}`})
    }

    // Make sure user is the appointment owner
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this bootcamp`
      })
    }

    await appointment.deleteOne()

    res.status(200).json({success: true, data: {}})
  } catch(err) {
    console.log(err)
    res.status(500).json({success: false, message: "Cannot delete appointment"})
  }
}