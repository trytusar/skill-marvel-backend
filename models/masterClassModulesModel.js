const mongoose = require('mongoose');

const mcModuleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    weeks: String,
    description: String,
    topics: [String],
    skills: [String],
});

const masterClassModulesSchema = new mongoose.Schema({
    masterClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterClass', required: true },
    modules: [mcModuleSchema]
}, { timestamps: true });

const MasterClassModules = mongoose.model('MasterClassModules', masterClassModulesSchema);

module.exports = MasterClassModules;