import React from 'react';

const ProductList = ({ products = [], onEdit, onDelete }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center p-4 text-muted">
        No products found. Add your first product!
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: "80px" }}>Image</th>
            <th style={{ width: "100px" }}>Product ID</th>
            <th>Name</th>
            <th>Category</th>
            <th style={{ width: "100px" }}>Price</th>
            <th style={{ width: "100px" }}>Qty</th>
            <th>Description</th>
            <th style={{ width: "150px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id || product.id}>
              <td>
                <img
                  src={
                    product.image?.startsWith("http")
                      ? product.image
                      : `http://localhost:5000${product.image}`
                  }
                  alt={product.name}
                  className="img-thumbnail"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
              </td>
              <td>{product._id || product.id}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>₹{product.price}</td>
              <td>{product.quantity || product.stock || 0}</td>
              <td>
                <div className="text-truncate" style={{ maxWidth: "200px" }}>
                  {product.description}
                </div>
              </td>
              <td>
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => onDelete(product._id || product.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;