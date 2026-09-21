const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = new mongoose.Schema(
  {
    regNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    imagePath: {
      type: String,
    },
    gender: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    contactNo: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    aadharNo: {
      type: String,
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    fatherOccupation: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    motherOccupation: {
      type: String,
      trim: true,
    },
    parentsNo: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    maritalStatus: {
      type: String,
      trim: true,
    },
    studentOccupation: {
      type: String,
      trim: true,
    },
    dateOfAdmission: {
      type: Date,
    },
    referenceBy: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    

    // ✅ Course Reference
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    // ✅ Fee Structure
    fees: {
      receiptNo: { type: String, default: "" },
      totalFees: { type: Number, default: 0 },
      discountPercent: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      finalAmount: { type: Number, default: 0 },
      amountPaid: { type: Number, default: 0 },
      dues: { type: Number, default: 0 },
      lastPaidDate: { type: Date, default: null },
      installments: [
        {
          amount: { type: Number, required: true },
          date: { type: Date, required: true },
          receiptNo: { type: String, required: true },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Compare password method
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Student", studentSchema);
