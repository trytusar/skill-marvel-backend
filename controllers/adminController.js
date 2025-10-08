const Admin = require('../models/adminModel');

module.exports.getAdminProfile = async (req, res) => {
    try{
        const admin = await Admin.findById(req.user.id).select('name email -_id');
        if(!admin){
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.status(200).json({ admin });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get admin profile' });
    }
};
