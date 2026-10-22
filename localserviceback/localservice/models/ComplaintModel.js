const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "providers",
      default: null,
    },

    category: {
      type: String,
      enum: [
        "Service Quality",
        "Provider Behaviour",
        "Incomplete Service",
        "Payment Issue",
        "Booking Issue",
        "Other",
      ],
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Under Review", "Resolved", "Closed"],
      default: "Pending",
    },

    adminNotes: {
      type: String,
      default: "",
    },

    resolution: {
      type: String,
      default: "",
    },

    assignedToProvider: {
  type: Boolean,
  default: false,
},

sentToProviderAt: {
  type: Date,
  default: null,
},

providerResponse: {
  type: String,
  default: "",
},

providerRespondedAt: {
  type: Date,
  default: null,
},
    
  },
  { timestamps: true }
);




complaintSchema.pre("validate", function () {
  if (!this.complaintId) {
    this.complaintId =
      `CMP-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }
});


module.exports = mongoose.model("Complaint", complaintSchema);