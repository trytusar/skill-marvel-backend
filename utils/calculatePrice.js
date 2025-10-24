const Course = require('../models/courseModel');
const MasterClass = require('../models/masterClassModel');

 function calculateCoursePrice(course, gst) {
  let priceAfterDiscount, discountedPercentage, finalPrice;

  //price, discount, isPercentage = true

  let price = course.price;
  let discount = course.discount;
  let discountAmount = course.discountAmount;
  let discountType = "pecentage";
  if (course.discount && course.discount > 0) {
      //price = price - (price * course.discount / 100);
      priceAfterDiscount = price - (price * discount / 100);
      discountedPercentage = discount;
  }
  else if (course.discountAmount && course.discountAmount > 0) {
      //price = price - course.discountAmount;
      // Discount is flat amount
      priceAfterDiscount = price - discount;
      discountedPercentage = (discount / price) * 100;
      discountType = "flat";
  }  

   
  let gstAmount = undefined;
  // Add GST (18%)
  if(gst && gst>0) {
    gstAmount = Math.round(priceAfterDiscount * 0.18);
    finalPrice = priceAfterDiscount + gstAmount;
  }
  else{
    finalPrice = priceAfterDiscount;
  }
  

  return {
    price,
    discountedPercentage: discount,
    discountAmount,
    discountType,
    //discountedPercentage: parseFloat(discountedPercentage.toFixed(2)),
    priceAfterDiscount: parseFloat(priceAfterDiscount.toFixed(2)),
    gstAmount,
    finalPrice: parseFloat(finalPrice.toFixed(2))
  };
}

 function calculateMasterClassPrice(masterClass, gst) {
  let priceAfterDiscount, discountedPercentage, finalPrice;

  //price, discount, isPercentage = true

  let price = masterClass.price;
  let discount = masterClass.discount;
  let discountAmount = masterClass.discountAmount;
  let discountType = "pecentage";
  if (masterClass.discount && masterClass.discount > 0) {
      //price = price - (price * masterClass.discount / 100);
      priceAfterDiscount = price - (price * discount / 100);
      discountedPercentage = discount;
  }
  else if (masterClass.discountAmount && masterClass.discountAmount > 0) {
      //price = price - masterClass.discountAmount;
      // Discount is flat amount
      priceAfterDiscount = price - discount;
      discountedPercentage = (discount / price) * 100;
      discountType = "flat";
  }  

  let gstAmount = undefined;
  // Add GST (18%)
  if(gst && gst>0) {
    gstAmount = Math.round(priceAfterDiscount * 0.18);
    finalPrice = priceAfterDiscount + gstAmount;
  }
  else{
    finalPrice = priceAfterDiscount;
  }

  return {
    price,
    discountedPercentage: discount,
    discountAmount,
    discountType,
    //discountedPercentage: parseFloat(discountedPercentage.toFixed(2)),
    priceAfterDiscount: parseFloat(priceAfterDiscount.toFixed(2)),
    gstAmount,
    finalPrice: parseFloat(finalPrice.toFixed(2))
  };
}

module.exports = {calculateCoursePrice, calculateMasterClassPrice};