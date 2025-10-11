const User = require('../models/userModel');
const getFullUrl = require('../utils/getFullUrl');

module.exports.getUserProfile = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-__v -createdAt -updatedAt');
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
};

module.exports.updateUserProfile = async (req, res) => {
    try{
        /*
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        user.updateOne(req.body);
        await user.save();
        */
        if(req.file){
            //req.body.profilePicture = `${req.protocol}://${req.get('host')}/uploads/users/${req.file.filename}`;
            req.body.profilePicture = getFullUrl.getUserImageUrl(req);
        } 

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true, runValidators: true } // return updated doc
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
            
        res.status(200).json({ message: 'User profile updated successfully' });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
};

module.exports.deleteMyAccount = async (req, res) => {
    try{
        const user = await User.findById(req.user.id);
        if(!user){
            res.status(404).json({message:"User account not found"});
        }
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({message: "User account deleted successfully"})
    }
    catch(err){
        console.log(err);
        res.status(201).json({error: "Failed to delete user profile."})
    }
};