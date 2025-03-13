import React, { useState, useEffect } from "react";

const ProductForm = ({ onSubmit, initialProduct, onCancel }) => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    if (initialProduct) {
      const { image, ...productWithoutImage } = initialProduct;
      setProduct(productWithoutImage);
    }
  }, [initialProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? Math.max(0, value) : value, // Prevent negative price
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    
    // Add all text fields
    Object.keys(product).forEach((key) => {
      if (key !== "image") {
        formData.append(key, product[key]);
      }
    });

    // Add image only if selected
    if (product.image instanceof File) {
      formData.append("image", product.image);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      <div className="col-md-4">
        <label htmlFor="productName" className="form-label">
          Product Name<span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="productName"
          name="name"
          className="form-control"
          value={product.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="col-md-2">
        <label htmlFor="productPrice" className="form-label">
          Price (₹)<span className="text-danger">*</span>
        </label>
        <input
          type="number"
          id="productPrice"
          name="price"
          className="form-control"
          value={product.price}
          onChange={handleChange}
          min="0"
          required
        />
      </div>

      <div className="col-md-2">
        <label htmlFor="productQuantity" className="form-label">
          Stock Quantity<span className="text-danger">*</span>
        </label>
        <input
          type="number"
          id="productQuantity"
          name="quantity"
          className="form-control"
          value={product.quantity}
          onChange={handleChange}
          required
        />
      </div>

      <div className="col-md-4">
        <label htmlFor="productCategory" className="form-label">
          Category<span className="text-danger">*</span>
        </label>
        <select
          id="productCategory"
          name="category"
          className="form-control"
          value={product.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          <option value="chocolates">Chocolates</option>
          <option value="flowers">Flowers</option>
          <option value="hampers">Hampers</option>
          <option value="novelty">Novelty</option>
        </select>
      </div>

      <div className="col-12">
        <label htmlFor="productDescription" className="form-label">
          Description
        </label>
        <textarea
          id="productDescription"
          name="description"
          className="form-control"
          value={product.description}
          onChange={handleChange}
          rows="2"
        />
      </div>

      <div className="col-12">
        <label htmlFor="productImage" className="form-label">
          Upload Image
        </label>
        <input
          type="file"
          id="productImage"
          name="image"
          className="form-control"
          onChange={handleImageChange}
          accept="image/*"
        />
      </div>

      <div className="col-12 mt-4">
        <button type="submit" className="btn btn-success">
          {initialProduct ? "Update Product" : "Add Product"}
        </button>
        <button type="button" className="btn btn-secondary ms-2" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
