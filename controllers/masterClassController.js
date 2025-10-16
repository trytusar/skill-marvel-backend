const MasterClass = require('../models/masterClassModel');
const Purchase = require('../models/purchaseModel');
const User = require('../models/userModel');
require('dotenv').config();
const axios = require('axios');
const getFullUrl = require('../utils/getFullUrl');

module.exports.addMasterClass = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to add masterclasses' });
        }
        const masterClass = new MasterClass(req.body);
        if (req.file) {
            //masterClass.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            masterClass.image = getFullUrl.getMasterClassImageUrl(req);
        }
        const savedMasterClass = await masterClass.save();
        res.status(201).json({ savedMasterClass });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to add masterclass' });
    }
};

module.exports.updateMasterClass = async (req, res) => {
    try {
        const masterClass = await MasterClass.findById(req.params.id);
        if (!masterClass) {
            return res.status(404).json({ error: 'Masterclass not found' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to update this masterclass' });
        }
        if (req.file) {
            //req.body.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            req.body.image = getFullUrl.getMasterClassImageUrl(req);
        }
        const update = await MasterClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Masterclass updated successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to update masterclass' });
    }
};

module.exports.getMasterClasses = async (req, res) => {
    try {
        //const masterClasses = await MasterClass.find({ isSoftDelete: false }).select('-__v -isSoftDelete -createdAt -updatedAt');
        //const masterClasses = await MasterClass.find({ isSoftDelete: false }).select('-__v -isSoftDelete -createdAt -updatedAt').populate('instructor');

        /*const masterClasses = await MasterClass.find({ isSoftDelete: false })
      .select("_id category title startDateTime endDateTime aboutMasterClass whatYouWillLearn image")
      .populate("instructor", "fullName"); // if you want instructor details */

      const masterClasses = await MasterClass.find({ isSoftDelete: false })
  .select("_id category title startDateTime endDateTime aboutMasterClass whatYouWillLearn image")
  .populate("instructor", "fullName -_id");

    /*  // Flatten instructor → instructorName
        const formatted = masterClasses.map(mc => ({
        ...mc,
        instructorName: mc.instructor ? mc.instructor.fullName : null
        }));

        // remove nested instructor object
        formatted.forEach(mc => delete mc.instructor);
    */

    res.status(200).json({ masterClasses });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get masterclasses' });
    }
};

module.exports.getMasterClassById = async (req, res) => {
    try {
        //const masterClass = await MasterClass.findOne({ _id: req.params.id, isSoftDelete: false });
        const masterClass = await MasterClass.findOne({ _id: req.params.id, isSoftDelete: false })
            .populate('instructor'); // This will fetch full instructor details
      
        if (!masterClass) {
            return res.status(404).json({ error: 'Masterclass not found' });
        }
        res.status(200).json({ masterClass });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get masterclass' });
    }
};

module.exports.deleteMasterClass = async (req, res) => {
    try {
        const masterClass = await MasterClass.findById(req.params.id);
        if (!masterClass) {
            return res.status(404).json({ error: 'Masterclass not found' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to delete this masterclass' });
        }
        masterClass.isSoftDelete = true;
        await masterClass.save();
        res.status(200).json({ message: 'Masterclass soft deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to soft delete masterclass' });
    }
};

exports.checkout = async (req, res) => {
    try {
        const masterClassId = req.params.masterClassId;
        const masterClass = await MasterClass.findById(masterClassId);
        if (!masterClass) {
            return res.status(404).json({ error: 'Masterclass not found' });
        }
        const masterClassDetails = {
            id: masterClass._id,
            title: masterClass.title,
            description: masterClass.description,
            price: masterClass.price,
            discount: masterClass.discount,
        };
        res.status(200).json({ masterClassDetails });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to get checkout' });
    }
};

exports.purchaseMasterClass = async (req, res) => {
    try {
        const userId = req.user.id;
        const masterClassId = req.params.masterClassId;
        const { email, name, phone } = req.body;

        const masterClass = await MasterClass.findById(masterClassId);
        if (!masterClass) {
            return res.status(404).json({ message: 'Masterclass not found' });
        }

        // Calculate price after discount if applicable
        let price = masterClass.price;
        if (masterClass.discount && masterClass.discount > 0) {
            price = price - (price * masterClass.discount / 100);
        }
        const amount = price;

        // Create a Zoho Payments session
        const zohoResponse = await axios.post(
            `https://payments.zoho.in/api/v1/paymentsessions?account_id=${process.env.ZOHO_ACCOUNT_ID}`,
            {
                amount: amount.toFixed(2),
                currency: 'INR',
                description: `Purchase of masterclass: ${masterClass.title}`,
                invoice_number: `INV-${Date.now()}`,
                meta_data: [
                    { key: 'masterClassId', value: masterClassId },
                    { key: 'userId', value: userId }
                ]
            },
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${process.env.ZOHO_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Create a new purchase document with status 'pending'
        const newPurchase = new Purchase({
            user: userId,
            purchasetype: 'masterclass',
            masterclass: masterClassId,
            amount: amount,
            paymentsSessionId: zohoResponse.data.payments_session.payments_session_id,
            paymentId: null,
            status: 'pending'
        });

        await newPurchase.save();

        res.status(201).json({
            message: 'Masterclass purchase initiated',
            purchaseId: newPurchase._id,
            paymentsSessionId: zohoResponse.data.payments_session.payments_session_id,
            amount: amount.toFixed(2),
            currency: 'INR'
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to initiate masterclass purchase' });
    }
};