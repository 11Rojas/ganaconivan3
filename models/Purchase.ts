import mongoose from "mongoose"

const PurchaseSchema = new mongoose.Schema(
  {

    raffleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Raffle",
      required: true,
    },
    numbers: [
      {
        type: Number,
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["zelle", "venezolano-credito", "mercado-pago"],
      required: true,
    },
    paymentData: {
      name: String,
      email: String,
      phone: String,
      idType: String,
      idNumber: String,
      reference: {
        type: String,
        required: false,
      },
      receipt: String,
      notes: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

export const Purchase = mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema)
