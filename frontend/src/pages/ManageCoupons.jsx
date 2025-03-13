import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponData, setCouponData] = useState({
    code: "",
    discountType: "fixed",
    discountValue: 0,
    minCartValue: 0,
    expiresAt: ""
  });
  
  const navigate = useNavigate();

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    fetch("/api/coupons", { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setCoupons(data.data || []))
      .catch((err) => console.error("Error fetching coupons:", err));
  }, []);

  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) setCoupons(coupons.filter((c) => c._id !== id));
      else alert(data.message);
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "discountValue" || name === "minCartValue") {
      if (value < 0) return;
    }
    if (name === "discountType" && value === "percentage") {
      setCouponData({ ...couponData, [name]: value, discountValue: "" });
      return;
    }
    if (name === "discountValue" && couponData.discountType === "percentage" && value > 100) {
      return;
    }
    if (name === "expiresAt" && new Date(value) < new Date()) {
      return;
    }
    setCouponData({ ...couponData, [name]: value });
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const formattedCouponData = {
      ...couponData,
      discountValue: Number(couponData.discountValue),
      minCartValue: Number(couponData.minCartValue)
    };
  
    try {
      const res = await fetch("/api/coupons/create", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formattedCouponData),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setCouponData({ code: "", discountType: "fixed", discountValue: 0, minCartValue: 0, expiresAt: "" });
        setCoupons([...coupons, data.data]);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();
    const formattedCouponData = {
      ...couponData,
      discountValue: Number(couponData.discountValue),
      minCartValue: Number(couponData.minCartValue)
    };
  
    try {
      const res = await fetch(`/api/coupons/${editingCoupon._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formattedCouponData),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setEditingCoupon(null);
        setCouponData({ code: "", discountType: "fixed", discountValue: 0, minCartValue: 0, expiresAt: "" });
        setCoupons(coupons.map(c => c._id === data.data._id ? data.data : c));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error editing coupon:", err);
    }
  };

  return (
    <div className="container mt-4 d-flex justify-content-end">
      <h2>Manage Coupons</h2>
      <button className="btn btn-primary mb-3" onClick={() => { setShowModal(true); setEditingCoupon(null); setCouponData({ code: "", discountType: "fixed", discountValue: 0, minCartValue: 0, expiresAt: "" }); }}>Add Coupon</button>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount Type</th>
            <th>Value</th>
            <th>Min Cart Value</th>
            <th>Expires At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon._id}>
              <td>{coupon.code}</td>
              <td>{coupon.discountType}</td>
              <td>{coupon.discountType === "percentage" ? `${coupon.discountValue}%` : coupon.discountValue}</td>
              <td>{coupon.minCartValue}</td>
              <td>{new Date(coupon.expiresAt).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => { setShowModal(true); setEditingCoupon(coupon); setCouponData(coupon); }}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteCoupon(coupon._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingCoupon ? "Edit Coupon" : "Add Coupon"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={editingCoupon ? handleEditCoupon : handleCreateCoupon}>
                  <label>Coupon Code</label>
                  <input type="text" name="code" value={couponData.code} onChange={handleInputChange} className="form-control mb-2" required />
                  <label>Discount Type</label>
                  <select name="discountType" value={couponData.discountType} onChange={handleInputChange} className="form-control mb-2" required>
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                  <label>Discount Value</label>
                  <input type="number" name="discountValue" value={couponData.discountValue} onChange={handleInputChange} className="form-control mb-2" required />
                  <label>Minimum Cart Value</label>
                  <input type="number" name="minCartValue" value={couponData.minCartValue} onChange={handleInputChange} className="form-control mb-2" required />
                  <label>Expires At</label>
                  <input type="date" name="expiresAt" value={couponData.expiresAt} onChange={handleInputChange} className="form-control mb-2" required />
                  <button type="submit" className="btn btn-primary">Save</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;