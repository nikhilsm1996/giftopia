import { useState, useEffect } from "react";
import { BsTag, BsXCircleFill, BsCheckCircleFill } from "react-icons/bs";

const CouponInput = ({ onApplyCoupon, cartTotal }) => {
    const [couponCode, setCouponCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [couponStatus, setCouponStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [appliedCode, setAppliedCode] = useState("");
    const [minimumOrderValue, setMinimumOrderValue] = useState(0);

    const applyCoupon = async () => {
        // Clear previous states
        setErrorMessage("");
        setCouponStatus(null);
      
        // Validate input
        if (!couponCode) {
          setErrorMessage("Please enter a coupon code");
          setCouponStatus("error");
          return;
        }
      
        if (cartTotal <= 0) {
          setErrorMessage("Cannot apply coupon to an empty cart");
          setCouponStatus("error");
          return;
        }
      
        setIsLoading(true);
      
        try {
          // Validate the coupon
          const validateResponse = await fetch("http://localhost:5000/api/coupons/validate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              couponCode: couponCode,
              totalAmount: cartTotal,
            }),
          });
      
          const validateData = await validateResponse.json();
      
          // Check if coupon is completely invalid
          if (!validateData.couponIsValid) {
            throw new Error(validateData.message || "Invalid coupon code");
          }
      
          // Handle cart too low scenario
          if (validateData.cartTooLow) {
            setMinimumOrderValue(validateData.minOrderValue || 0);
            throw new Error(`Minimum order value is ₹${validateData.minOrderValue.toFixed(2)}`);
          }
      
          // If validation passes, apply the coupon
          const applyResponse = await fetch("http://localhost:5000/api/coupons/apply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              couponCode: couponCode,
              totalAmount: cartTotal,
            }),
          });
      
          const applyData = await applyResponse.json();
      
          // Check the success flag
          if (!applyData.success) {
            throw new Error(applyData.message || "Failed to apply coupon");
          }
      
          // Ensure discount doesn't exceed cart total
          const safeDiscount = Math.min(applyData.discount, cartTotal);
      
          // Call parent component's apply method
          // Pass the couponCode as first parameter to match the parent component's expectation
          const applied = onApplyCoupon(couponCode);
          
          if (applied !== false) {
            setAppliedDiscount(safeDiscount);
            setAppliedCode(couponCode);
            setCouponStatus("success");
          } else {
            throw new Error("Coupon cannot be applied to current cart");
          }
      
        } catch (error) {
          setErrorMessage(error.message || "Could not apply coupon");
          setCouponStatus("error");
          
          // Reset coupon in parent component - pass empty string for couponCode
          onApplyCoupon("");
        } finally {
          setIsLoading(false);
        }
    };

    const resetCoupon = () => {
        setCouponCode("");
        setCouponStatus(null);
        setErrorMessage("");
        setAppliedDiscount(0);
        setAppliedCode("");
        setMinimumOrderValue(0);
        // Pass empty string for couponCode
        onApplyCoupon("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !isLoading && couponStatus !== "success") {
            applyCoupon();
        }
    };

    useEffect(() => {
        if (couponStatus === "success" && appliedCode) {
            const revalidateCoupon = async () => {
                try {
                    // Validate coupon again with new cart total
                    const validateResponse = await fetch("http://localhost:5000/api/coupons/validate", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify({
                            couponCode: appliedCode,
                            totalAmount: cartTotal,
                        }),
                    });
    
                    const validateData = await validateResponse.json();
    
                    // Check if validation fails
                    if (!validateResponse.ok) {
                        throw new Error(validateData.message || "Coupon no longer valid");
                    }
    
                    // Check minimum order value
                    const minOrderValue = validateData.minOrderValue || 0;
                    if (minOrderValue > cartTotal) {
                        throw new Error(`This coupon requires a minimum order of ₹${minOrderValue.toFixed(2)}`);
                    }
    
                    // Apply coupon
                    const applyResponse = await fetch("http://localhost:5000/api/coupons/apply", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify({
                            couponCode: appliedCode,
                            totalAmount: cartTotal,
                        }),
                    });
    
                    const applyData = await applyResponse.json();
    
                    if (!applyResponse.ok) {
                        throw new Error(applyData.message || "Failed to apply coupon");
                    }
    
                    // Ensure discount doesn't exceed cart total
                    const safeDiscount = Math.min(applyData.discount, cartTotal);
    
                    // Call parent component's apply method - pass appliedCode as first parameter
                    const applied = onApplyCoupon(appliedCode);
                    
                    if (applied === false) {
                        throw new Error("Coupon cannot be applied to current cart");
                    }
    
                    // Update discount if still valid
                    setAppliedDiscount(safeDiscount);
                    setMinimumOrderValue(minOrderValue);
    
                } catch (error) {
                    // Reset coupon if validation fails
                    resetCoupon();
                    setErrorMessage(error.message || "Coupon is no longer valid");
                    setCouponStatus("error");
                }
            };
    
            revalidateCoupon();
        }
    }, [cartTotal, appliedCode]);

    return (
        <div className="mt-4">
            <h3 className="mb-3">Have a coupon?</h3>
            <div className="mb-3">
                <div className="input-group">
                    <span className="input-group-text">
                        <BsTag />
                    </span>
                    <input
                        type="text"
                        className={`form-control ${
                            couponStatus === "success"
                                ? "is-valid"
                                : couponStatus === "error"
                                ? "is-invalid"
                                : ""
                        }`}
                        placeholder="Enter promo code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.trim())}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading || couponStatus === "success"}
                    />
                    <button
                        className={`btn ${
                            couponStatus === "success" ? "btn-danger" : "btn-primary"
                        }`}
                        type="button"
                        onClick={couponStatus === "success" ? resetCoupon : applyCoupon}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span>
                                <span
                                    className="spinner-border spinner-border-sm me-1"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Applying...
                            </span>
                        ) : couponStatus === "success" ? (
                            "Remove"
                        ) : (
                            "Apply"
                        )}
                    </button>
                </div>

                {couponStatus === "error" && (
                    <div className="invalid-feedback d-block">
                        <BsXCircleFill className="me-1" /> {errorMessage}
                    </div>
                )}

                {couponStatus === "success" && (
                    <div className="valid-feedback d-block">
                        <BsCheckCircleFill className="me-1" />
                        Coupon applied! You saved ₹{appliedDiscount.toFixed(2)}
                        {minimumOrderValue > 0 && (
                            <span className="ms-1">(Minimum order: ₹{minimumOrderValue.toFixed(2)})</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponInput;