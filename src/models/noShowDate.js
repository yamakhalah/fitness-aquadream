const { NO_SHOW_DATE } = require('./dbName')

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NoShowDateSchema = new Schema({
  begin: { type: String, required: true },
  end: { type: String, required: true },
  year: { type: String, required: true, enum: ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'] }
})

NoShowDateSchema.statics.create = function(data) {
  const noShowDate = new NoShowDate({ begin: data.begin, end: data.end, year: data.year })
  return noShowDate.save()
}

NoShowDateSchema.statics.deleteNoShowDate = function(id) {
  return NoShowDate.findOneAndDelete({'_id': id})
}

const NoShowDate = mongoose.model(NO_SHOW_DATE, NoShowDateSchema)

export default NoShowDate