import mongoose from "mongoose"

const PaymentConfigSchema = new mongoose.Schema(
  {
    cedula: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    bank: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

// Solo permitir un documento de configuración
PaymentConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne()
  if (!config) {
    config = await this.create({
      cedula: "30744670",
      phone: "04249172493",
      bank: "0104 Venezolano de Crédito",
    })
  }
  return config
}

export const PaymentConfig = mongoose.models.PaymentConfig || mongoose.model("PaymentConfig", PaymentConfigSchema)

