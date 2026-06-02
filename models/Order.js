const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     String,
  price:    Number,
  quantity: { type: Number, required: true, min: 1 },
  size:     String,
  color:    String,
  image:    String,
}, { _id: false });

const addressSchema = new mongoose.Schema({
  fullName: String, street: String, city: String,
  country: String, postalCode: String, phone: String,
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    /* Guest / parcel customer info */
    customerName:   String,
    customerPhone:  String,
    customerEmail:  String,
    guestEmail:     String,
    items:          [orderItemSchema],
    shippingAddress:addressSchema,
    subtotal:       { type: Number, required: true },
    shippingCost:   { type: Number, default: 0 },
    total:          { type: Number, required: true },
    status:         { type: String, enum: ['pending','confirmed','processing','shipped','delivered','cancelled'], default: 'pending' },
    paymentMethod:  { type: String, default: 'stripe' },
    paymentStatus:  { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
    stripeSessionId:String,
    stripePaymentId:String,
    promoCode:      String,
    discount:       Number,
    notes:          String,
    trackingNumber: String,
    deliveredAt:    Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
