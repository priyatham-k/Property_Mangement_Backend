const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    earnings: { type: Number, default: 0 },
});
  
const AdminEarnings = mongoose.model('AdminEarnings', adminSchema);
module.exports = AdminEarnings;