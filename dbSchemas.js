const mongoose = require("./mongoose.service").mongoose;
const Schema = mongoose.Schema;

const valuesSchema = new Schema({ 
    balance: { 
      type: Number, 
      required: true 
    }, 
    percent: {
      type: Number,
      required: true 
    },
    created_at: {
      type: Date,
      required: true
    }
});

exports.values = mongoose.model("values", valuesSchema);