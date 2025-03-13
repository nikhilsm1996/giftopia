

const validateCoupon = (req, res, next) => {
    const { code, discountAmount, validUntil, minimumPurchase } = req.body;
  
    const errors = [];
  
    if (!code || code.trim().length < 3) {
      errors.push('Coupon code must be at least 3 characters long');
    }
  
    if (!discountAmount || discountAmount <= 0) {
      errors.push('Discount amount must be greater than 0');
    }
  
    if (req.body.discountType === 'PERCENTAGE' && discountAmount > 100) {
      errors.push('Percentage discount cannot be greater than 100%');
    }
  
    if (!validUntil || new Date(validUntil) <= new Date()) {
      errors.push('Valid until date must be in the future');
    }
  
    if (minimumPurchase && minimumPurchase < 0) {
      errors.push('Minimum purchase amount cannot be negative');
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
  

    next();
  };
  
export default validateCoupon