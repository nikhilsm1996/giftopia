import React, { useState, useEffect } from "react";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";


const ManageProducts = () => {

  //STATE MANAGEMENT
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch all products
  const fetchProducts = async () => {
    setError(null);
    try {
      console.log("Fetching products...");
      const response = await fetch("http://localhost:5000/api/products");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Products fetched:", data);
      setProducts(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Error fetching products: " + error.message);
    }
  };

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle product submission (add/edit)
  const handleSubmit = async (formData) => {
    setError(null);
    
    try {
      const url = editingProduct
        ? `http://localhost:5000/api/products/edit/${editingProduct._id}`
        : "http://localhost:5000/api/products/add";

      const method = editingProduct ? "PUT" : "POST";

      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log("FormData:", pair[0], pair[1]);
      }

      // Validate price before sending request
      const price = parseFloat(formData.get("price"));
      if (isNaN(price) || price <= 0) {
        throw new Error("Price must be a positive number");
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`, // Only auth header, do NOT add Content-Type
        },
        body: formData, // Sending FormData directly
        credentials: "include",
      });

      // Get response as text first
      const text = await response.text();
      console.log("Raw server response:", text);

      // Try parsing JSON
      const responseData = JSON.parse(text);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || "Failed to save product");
      }

      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      alert(editingProduct ? "Product updated successfully" : "Product added successfully");
    } catch (error) {
      console.error("Error details:", error);
      setError("Error saving product: " + error.message);
    }
  };

  // Handle product deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/products/delete/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete product");
        }

        await fetchProducts(); // Wait for products to be fetched
        alert("Product deleted successfully");
      } catch (error) {
        setError("Error deleting product: " + error.message);
        console.error("Error:", error);
      }
    }
  };

  // Handle edit button click
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  return (
    <div className="container-fluid px-4">
      <div className="row my-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Manage Products</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                >
                  Add New Product
                </button>
              </div>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {showForm && (
                <ProductForm
                  onSubmit={handleSubmit}
                  initialProduct={editingProduct}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                />
              )}

              <ProductList products={products} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
