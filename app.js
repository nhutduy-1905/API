const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Sample in-memory data store
let items = [];

// GET route to retrieve items
app.get('/api/items', (req, res) => {
  res.json(items);
});


// Sample in-memory data store
let danhSachMonHoc = ['Lập trình python nâng cao', 'Lập trình hướng đối tượng', 'Hệ quản trị cơ sở dữ liệu', 'Toán rời rạc', 'Lập trình Java'];

// GET route to retrieve items
app.get('/api/danhSachMonHoc', (req, res) => {
  console.log(JSON.stringify(req.headers));
  if (req.headers['key'] != 'OIT')
  {
    return res.status(403).json({
      status: false,
      error: "Invalid header key, please login again.",
    });
  }
  res.json(danhSachMonHoc);
});
// app.get('/api/products', (req, res) => {
//   // Xử lý dữ liệu
//   // Backend: query database
//   // Select * From / Where 
//   // Join 2 bảng => chung
//   // Cấu trúc json
//   // ....


//   res.json([
//     { name: "Ao 1", price: 120, discount: 11 },
//     { name: "Ao 2", price: 100, discount: 25 }
//   ]);
// });

// POST route to add an item
app.post('/api/items', (req, res) => {
  const newItem = req.body;
  if (!newItem || !newItem.name) {
    return res.status(400).json({ error: 'Item name is required' });
  }
  items.push(newItem);
  res.status(200).json(newItem);
});




// Tạo api cho phép thêm sản phẩm vào kho hàng
// Website hiển thị lại tất cả các sản phẩm đang có

let products = [
  {id:"1", name: "Ao 1", price: 120,star:"5" },
  {id:"2", name: "Ao 2", price: 100,star:"5" },
  {id:"3", name: "Ao 4", price: 150,star:"4" },
  {id:"4", name: "Ao 5", price: 110,star:"2" }
];

app.get('/api/getProductsByApiKey', (req, res) => {
  console.log(JSON.stringify(req.headers));
  if (req.headers['api_key'] != 'PRODUCTV1')
  {
    return res.status(403).json({
      status: false,
      error: "Invalid header id, please login again.",
    });
  }
  res.json(products);
});



// tạo 1 api GET: /api/top5star => trả về danh sách sản phẩm được start 5 sao
app.get('/api/top5star', (req, res) => {
  const top5StarProducts = products.filter(product => product.star === "5");
  res.json(top5StarProducts);
});
//
// API: Lấy danh sách sản phẩm và sắp xếp theo giá
app.get('/api/getProductsByQuery', (req, res) => {
  const { price } = req.query; // Lấy query parameter `price`
  
  if (price === 'asc') {
      // Sắp xếp tăng dần
      const sortedProducts = [...products].sort((a, b) => a.price - b.price);
      return res.json(sortedProducts);
  } else if (price === 'desc') {
      // Sắp xếp giảm dần
      const sortedProducts = [...products].sort((a, b) => b.price - a.price);
      return res.json(sortedProducts);
  } else {
      // Trả về lỗi nếu tham số `price` không hợp lệ
      return res.status(400).json({ message: "Invalid query parameter. Use 'asc' or 'desc' for price." });
  }
});

app.get('/api/products', (req, res) => {
  return res.json(products);
})
// trong product thêm 1 field string id => tạo 1 api POST: /api/update/id body cập nhật thông tin sản phẩm

// API cập nhật thông tin sản phẩm
app.post("/api/update/id", (req, res) => {
  const { id, name,price,star } = req.body;
  // Tìm sản phẩm theo ID
  const productIndex = products.findIndex((product) => product.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found." });
  }
  // Cập nhật thông tin sản phẩm
  if (name) products[productIndex].name = name;
  if (price) products[productIndex].price = price;
  if (star) products[productIndex].description = star;

  res.status(200).json({ message: "Product updated successfully.", product: products[productIndex] });
});
app.post("/api/createProduct", (req, res) => {
    const { id } = req.params;
    const { name, star, price } = req.body;
      // Kiểm tra dữ liệu đầu vào
      if (
        typeof name !== 'string' || name.trim() === '' ||
        typeof star !== 'number' || star < 1 || star > 5 ||
        typeof price !== 'number' || price <= 0
    ) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    const productIndex = products.findIndex(p => p.id == id);
    if (productIndex === -1) {
        return res.status(400).json({ message: 'Product not found' });
    }
    products[productIndex] = { id: Number(id), name, star, price };
    res.status(200).json({ message: 'Product updated successfully', product: products[productIndex] });
});
// API GET /api/getProductByField
app.get('/api/getProductByField', (req, res) => {
  const { name, price } = req.query;

  // Lọc sản phẩm theo các trường đã truyền
  let filteredProducts = products;
  if (name) {
      filteredProducts = filteredProducts.filter(product => product.name === name);
  }
  if (price) {
      filteredProducts = filteredProducts.filter(product => product.price == price);
  }

  // Trả về danh sách sản phẩm lọc được
  res.json(filteredProducts);
});

// Middleware để parse JSON body (nếu cần)
app.use(express.json());

// API GET /api/getProducts để kiểm tra danh sách hiện tại
app.get('/api/getProducts', (req, res) => {
    res.json(products);
});

// API POST /api/deleteProduct/:id
app.post('/api/deleteProduct/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    // Tìm sản phẩm theo ID
    const productIndex = products.findIndex(product => product.id === productId);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }
    // Xóa sản phẩm khỏi danh sách
    products.splice(productIndex, 1);

    res.json({ message: `Product with ID ${productId} deleted successfully`, products });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
