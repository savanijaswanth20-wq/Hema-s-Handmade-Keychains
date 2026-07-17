import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, Order, Review, AdminSettings } from "./src/types";


const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Local Database with Screen-Accurate Seed Data
function getInitialData() {
  const products: Product[] = [
    {
      id: "prod-1",
      name: "Cute Heart Penguin Keychain",
      description: "Super glossy clay penguin holding a tiny red heart. Features a custom metal heart-shaped ring hook. Handcrafted with love in Marathahalli, Bengaluru.",
      category: "Animal Series",
      price: 150,
      stock: 12,
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80"
      ],
      rating: 4.8,
      reviewsCount: 3,
      tag: "100% Glossy Clay"
    },
    {
      id: "prod-2",
      name: "handmade bunny charm",
      description: "A super cute chubby white bunny with tiny hand-painted cheeks and a shiny glaze sealer. Elegant pick for phone charms and backpacks.",
      category: "Animal Series",
      price: 150,
      stock: 10,
      images: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80"
      ],
      rating: 4.9,
      reviewsCount: 2,
      tag: "100% Glossy Clay"
    },
    {
      id: "prod-3",
      name: "Penguin charm",
      description: "Handmade glossy baby penguin holding a yellow flower. Perfectly polished, water-resistant clay art.",
      category: "Animal Series",
      price: 150,
      stock: 10,
      images: [
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=80"
      ],
      rating: 4.7,
      reviewsCount: 1,
      tag: "100% Glossy Clay"
    },
    {
      id: "prod-4",
      name: "Miniature Clay Donut",
      description: "Glazed pink chocolate donut with micro sprinkles. Looks delicious but do not eat! Water-resistant coating.",
      category: "Food Series",
      price: 150,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"
      ],
      rating: 4.9,
      reviewsCount: 4,
      tag: "100% Glossy Clay"
    },
    {
      id: "prod-5",
      name: "Dreamy Cloud charm",
      description: "Soft blue clay cloud with golden dangling star charm. Glossy, dreamy and perfect for keys.",
      category: "Cosmic Series",
      price: 150,
      stock: 8,
      images: [
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80"
      ],
      rating: 5.0,
      reviewsCount: 1,
      tag: "100% Glossy Clay"
    },
    {
      id: "prod-6",
      name: "Starry Night Resin Orb",
      description: "Premium crystal resin dome with embedded glitters and dark night blue pigments.",
      category: "Cosmic Series",
      price: 150,
      stock: 7,
      images: [
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&auto=format&fit=crop&q=80"
      ],
      rating: 4.6,
      reviewsCount: 2,
      tag: "Premium Resin"
    },
    {
      id: "prod-7",
      name: "Strawberries Clay Bucket",
      description: "A super cute tiny bucket filled with hand-sculpted red strawberries. Finished with glossy high-gloss varnish.",
      category: "Food Series",
      price: 150,
      stock: 6,
      images: [
        "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80"
      ],
      rating: 5.0,
      reviewsCount: 1,
      tag: "100% Glossy Clay"
    }
  ];

  const orders: Order[] = [
    {
      id: "HEMA-9081",
      customerName: "Sowmya Reddy",
      customerPhone: "9640653603",
      address: "Flat 402, Sai Nilaya, Marathahalli, Bengaluru, 560037",
      customMessage: "Bake a tiny heart next to the name please!",
      paymentMethod: "UPI",
      paymentId: "239481904812",
      paymentStatus: "Verified",
      total: 150,
      status: "Delivered",
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          productName: "Cute Heart Penguin Keychain",
          productImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80",
          quantity: 1,
          price: 150
        }
      ],
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "HEMA-3482",
      customerName: "Anjali Rao",
      customerPhone: "9876543210",
      address: "No. 12, Spice Garden Layout, Marathahalli, Bengaluru, 560037",
      customMessage: "With love Sowmya written on box",
      paymentMethod: "UPI",
      paymentId: "981273912384",
      paymentStatus: "Verified",
      total: 300,
      status: "Delivered",
      items: [
        {
          id: "item-2",
          productId: "prod-2",
          productName: "handmade bunny charm",
          productImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
          quantity: 2,
          price: 150
        }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "HEMA-8273",
      customerName: "Rohan Sharma",
      customerPhone: "9123456789",
      address: "Block B, Prestige Tech Park, Outer Ring Rd, Bengaluru, 560103",
      paymentMethod: "UPI",
      paymentId: "123098456123",
      paymentStatus: "Verified",
      total: 150,
      status: "Delivered",
      items: [
        {
          id: "item-3",
          productId: "prod-3",
          productName: "Penguin charm",
          productImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=80",
          quantity: 1,
          price: 150
        }
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "HEMA-1294",
      customerName: "Vikram Nair",
      customerPhone: "9845012345",
      address: "Apt 101, Bren Avalon, Marathahalli, Bengaluru, 560037",
      paymentMethod: "UPI",
      paymentId: "847291048291",
      paymentStatus: "Verified",
      total: 300,
      status: "Delivered",
      items: [
        {
          id: "item-4",
          productId: "prod-4",
          productName: "Miniature Clay Donut",
          productImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
          quantity: 2,
          price: 150
        }
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const reviews: Review[] = [
    {
      id: "rev-1",
      productId: "prod-1",
      productName: "Cute Heart Penguin Keychain",
      customerName: "Sowmya Reddy",
      rating: 5,
      text: "Absolutely stunning! The gloss finish is superb and the heart hook is so cute! Hema packed it beautifully too.",
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "rev-2",
      productId: "prod-2",
      productName: "handmade bunny charm",
      customerName: "Anjali Rao",
      rating: 5,
      text: "Incredibly cute keychains! My daughter loved the bunny charm. Fast pickup near Outer Ring Rd Marathahalli.",
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const settings: AdminSettings = {
    upiId: "9640653603@ybl",
    upiName: "Hema's Tiny Universe",
    bannerMessage: "✨ EXTRA CUTE HANDMADE CLAY CHARMS & CUSTOMIZABLE CARTOON KEYCHAINS! ✨",
    businessName: "Hema's Handmade Keychains",
    whatsappNumber: "+91 9640653603",
    instagramId: "hemas_tiny_universe",
    qrImageUrl: "",
    logoUrl: ""
  };

  const users = [
    {
      email: "hema@keychains.com",
      password: "admin",
      role: "admin",
      name: "Hema"
    }
  ];

  return { products, orders, reviews, settings, users };
}

// Read database from file
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const data = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      return data;
    }
    const fileContent = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(fileContent);
  } catch (err) {
    console.error("Error reading db.json, generating fallback data...", err);
    return getInitialData();
  }
}

// Write database to file
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db.json", err);
  }
}

// API Routes

// 1. Products API
app.get("/api/products", (req, res) => {
  const db = readDb();
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const db = readDb();
  const newProduct: Product = {
    id: "prod-" + Date.now(),
    name: req.body.name || "Custom Keychain",
    description: req.body.description || "Handmade clay keychain",
    category: req.body.category || "Clay Crafts",
    price: Number(req.body.price) || 150,
    stock: Number(req.body.stock) || 10,
    images: req.body.images && req.body.images.length ? req.body.images : ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80"],
    rating: 5.0,
    reviewsCount: 0,
    tag: req.body.tag || "100% Glossy Clay"
  };
  db.products.push(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const db = readDb();
  const index = db.products.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = {
      ...db.products[index],
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      images: req.body.images,
      tag: req.body.tag
    };
    writeDb(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const db = readDb();
  const filtered = db.products.filter((p: any) => p.id !== req.params.id);
  db.products = filtered;
  writeDb(db);
  res.json({ success: true });
});

// 2. Orders API
app.get("/api/orders", (req, res) => {
  const db = readDb();
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const db = readDb();
  const { customerName, customerPhone, address, customMessage, paymentMethod, paymentId, total, items } = req.body;

  if (!customerName || !customerPhone || !address || !items || !items.length) {
    return res.status(400).json({ error: "Missing required order information." });
  }

  // Create a beautiful screen-accurate Order ID like HEMA-XXXX
  const orderId = "HEMA-" + Math.floor(1000 + Math.random() * 9000);

  const newOrder: Order = {
    id: orderId,
    customerName,
    customerPhone,
    address,
    customMessage,
    paymentMethod,
    paymentId,
    paymentStatus: paymentMethod === 'UPI' ? 'Verified' : 'Pending', // Pre-verified UPI transactions for high-fidelity experience
    total: Number(total),
    status: 'Pending',
    items,
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);

  // Update product stock accordingly
  newOrder.items.forEach((item: any) => {
    const product = db.products.find((p: any) => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
  });

  writeDb(db);
  res.status(201).json(newOrder);
});

app.put("/api/orders/:id", (req, res) => {
  const db = readDb();
  const index = db.orders.findIndex((o: any) => o.id === req.params.id);
  if (index !== -1) {
    db.orders[index] = {
      ...db.orders[index],
      status: req.body.status || db.orders[index].status,
      paymentStatus: req.body.paymentStatus || db.orders[index].paymentStatus
    };
    writeDb(db);
    res.json(db.orders[index]);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// 3. Settings API
app.get("/api/settings", (req, res) => {
  const db = readDb();
  res.json(db.settings);
});

app.post("/api/settings", (req, res) => {
  const db = readDb();
  db.settings = {
    upiId: req.body.upiId || db.settings.upiId,
    upiName: req.body.upiName || db.settings.upiName,
    bannerMessage: req.body.bannerMessage || db.settings.bannerMessage,
    businessName: req.body.businessName || db.settings.businessName || "CuteCharm Keychains",
    whatsappNumber: req.body.whatsappNumber || db.settings.whatsappNumber || "+91 9640653603",
    instagramId: req.body.instagramId || db.settings.instagramId || "@hemas_tiny_universe",
    qrImageUrl: req.body.qrImageUrl !== undefined ? req.body.qrImageUrl : (db.settings.qrImageUrl || ""),
    logoUrl: req.body.logoUrl !== undefined ? req.body.logoUrl : (db.settings.logoUrl || "")
  };
  writeDb(db);
  res.json(db.settings);
});

// 4. Reviews API
app.get("/api/reviews", (req, res) => {
  const db = readDb();
  res.json(db.reviews);
});

app.post("/api/reviews", (req, res) => {
  const db = readDb();
  const { productId, productName, customerName, rating, text } = req.body;

  const newReview: Review = {
    id: "rev-" + Date.now(),
    productId,
    productName,
    customerName,
    rating: Number(rating) || 5,
    text: text || "",
    createdAt: new Date().toISOString()
  };

  db.reviews.unshift(newReview);

  // Update product rating and count
  const product = db.products.find((p: any) => p.id === productId);
  if (product) {
    const productReviews = db.reviews.filter((r: any) => r.productId === productId);
    const avgRating = productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / productReviews.length;
    product.rating = Number(avgRating.toFixed(1));
    product.reviewsCount = productReviews.length;
  }

  writeDb(db);
  res.status(201).json(newReview);
});

// 5. Authentication API
app.post("/api/auth/login", (req, res) => {
  const db = readDb();
  const { email, password } = req.body;

  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } else {
    // Also allow customer login bypass / auto-signup for outstanding UX
    if (email && password) {
      const newUser = { email, name: email.split("@")[0], role: "customer" };
      res.json({
        success: true,
        user: newUser
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  }
});

app.post("/api/auth/update-credentials", (req, res) => {
  const db = readDb();
  const { currentEmail, currentPassword, newEmail, newPassword } = req.body;

  const adminIndex = db.users.findIndex((u: any) => u.role === "admin");
  if (adminIndex !== -1) {
    const admin = db.users[adminIndex];
    if (admin.email.toLowerCase() === currentEmail.toLowerCase() && admin.password === currentPassword) {
      if (newEmail) admin.email = newEmail;
      if (newPassword) admin.password = newPassword;
      writeDb(db);
      res.json({ success: true, message: "Credentials updated successfully." });
    } else {
      res.status(401).json({ error: "Invalid current username or password." });
    }
  } else {
    db.users.push({
      email: newEmail || "HANDMADE",
      password: newPassword || "6304702907",
      role: "admin",
      name: "Hema"
    });
    writeDb(db);
    res.json({ success: true, message: "Admin created successfully." });
  }
});

// 6. Export Orders to CSV (Excel compatible)
app.get("/api/orders/export", (req, res) => {
  const db = readDb();
  const orders: Order[] = db.orders;

  let csvContent = "Order ID,Customer Name,Customer Phone,Address,Custom Message,Payment Method,Payment ID,Payment Status,Total (INR),Status,Created At\n";
  orders.forEach((o) => {
    const escapedName = `"${o.customerName.replace(/"/g, '""')}"`;
    const escapedPhone = `"${o.customerPhone.replace(/"/g, '""')}"`;
    const escapedAddress = `"${o.address.replace(/"/g, '""')}"`;
    const escapedMessage = `"${(o.customMessage || '').replace(/"/g, '""')}"`;
    csvContent += `${o.id},${escapedName},${escapedPhone},${escapedAddress},${escapedMessage},${o.paymentMethod},${o.paymentId || ''},${o.paymentStatus},${o.total},${o.status},${o.createdAt}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=hema_orders_${Date.now()}.csv`);
  res.status(200).send(csvContent);
});

// Vite Middleware & Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
