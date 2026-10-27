const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();

const db = require("./db");

const app = express();
console.log("SERVER FILE:", __filename);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Farm2Connect Backend is running!"
    });
});

app.post("/api/register", async (req, res) => {
    const {
        full_name,
        email,
        password,
        phone,
        role
    } = req.body;

    if (!full_name || !email || !password || !phone || !role) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users
            (full_name, email, phone, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                full_name.trim(),
                email.trim(),
                phone.trim(),
                password_hash,
                role.trim().toUpperCase()
            ],
            (err, result) => {
                if (err) {
                    console.error("REGISTER ERROR:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Registration failed",
                        error: err.message
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "User registered successfully",
                    user_id: result.insertId
                });
            }
        );
    } catch (error) {
        console.error("REGISTER SERVER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});



app.post("/api/login", async (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const sql = `
        SELECT
            user_id,
            full_name,
            email,
            phone,
            password_hash,
            role,
            created_at
        FROM users
        WHERE email = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [email.trim()],
        async (err, results) => {
            if (err) {
                console.error("LOGIN ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Login failed",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            try {
                const user = results[0];

                const passwordMatch = await bcrypt.compare(
                    password,
                    user.password_hash
                );

                if (!passwordMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password"
                    });
                }

                res.json({
                    success: true,
                    message: "Login successful",
                    user: {
                        user_id: user.user_id,
                        full_name: user.full_name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        created_at: user.created_at
                    }
                });
            } catch (error) {
                console.error("PASSWORD ERROR:", error);

                res.status(500).json({
                    success: false,
                    message: "Login processing failed"
                });
            }
        }
    );
});

app.post("/api/products", (req, res) => {
    const {
        farmer_id,
        product_name,
        quantity,
        unit,
        price_per_unit,
        description
    } = req.body;

    if (
        !farmer_id ||
        !product_name ||
        quantity === undefined ||
        !unit ||
        price_per_unit === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Required product details are missing"
        });
    }

    const q = Number(quantity);
    const p = Number(price_per_unit);

    if (!Number.isFinite(q) || q <= 0) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a valid positive number"
        });
    }

    if (!Number.isFinite(p) || p < 0) {
        return res.status(400).json({
            success: false,
            message: "Price must be a valid number"
        });
    }

    const sql = `
        INSERT INTO products
        (farmer_id, product_name, quantity, unit, price_per_unit, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            farmer_id,
            product_name.trim(),
            q,
            unit.trim(),
            p,
            description ? description.trim() : null
        ],
        (err, result) => {
            if (err) {
                console.error("ADD PRODUCT ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to add product",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Product added successfully",
                product_id: result.insertId
            });
        }
    );
});

app.get("/api/products/search", (req, res) => {
    const {
        product_name,
        required_quantity
    } = req.query;

    if (!product_name || !required_quantity) {
        return res.status(400).json({
            success: false,
            message: "Product name and required quantity are required"
        });
    }

    const quantity = Number(required_quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: "Required quantity must be a valid positive number"
        });
    }

    const sql = `
        SELECT
            p.product_id,
            p.farmer_id,
            p.product_name,
            p.quantity AS available_quantity,
            p.unit,
            p.price_per_unit,
            p.description,
            p.created_at,

            u.user_id,
            u.full_name AS farmer_name,
            u.email,
            u.phone,
            u.role

        FROM products p

        INNER JOIN users u
            ON p.farmer_id = u.user_id

        WHERE LOWER(TRIM(p.product_name))
              = LOWER(TRIM(?))

        AND p.quantity >= ?

        AND UPPER(TRIM(u.role)) = 'FARMER'

        ORDER BY p.quantity ASC
    `;

    db.query(
        sql,
        [
            product_name.trim(),
            quantity
        ],
        (err, results) => {
            if (err) {
                console.error("SEARCH ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to search products",
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: results.length
                    ? "Matching farmers found"
                    : "No matching farmers found",
                products: results,
                count: results.length
            });
        }
    );
});

app.get("/api/products/farmer/:farmer_id", (req, res) => {
    const farmer_id = Number(req.params.farmer_id);

    if (!Number.isInteger(farmer_id) || farmer_id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid farmer ID"
        });
    }

    const sql = `
        SELECT
            product_id,
            farmer_id,
            product_name,
            quantity,
            unit,
            price_per_unit,
            description,
            created_at
        FROM products
        WHERE farmer_id = ?
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        [farmer_id],
        (err, results) => {
            if (err) {
                console.error("FARMER PRODUCTS ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch farmer products",
                    error: err.message
                });
            }

            res.json({
                success: true,
                products: results,
                count: results.length
            });
        }
    );
});

app.get("/api/products/:product_id", (req, res) => {
    const product_id = Number(req.params.product_id);

    if (!Number.isInteger(product_id) || product_id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    const sql = `
        SELECT
            p.product_id,
            p.farmer_id,
            p.product_name,
            p.quantity,
            p.unit,
            p.price_per_unit,
            p.description,
            p.created_at,

            u.user_id,
            u.full_name AS farmer_name,
            u.email,
            u.phone,
            u.role

        FROM products p

        INNER JOIN users u
            ON p.farmer_id = u.user_id

        WHERE p.product_id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [product_id],
        (err, results) => {
            if (err) {
                console.error("SINGLE PRODUCT ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch product",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            res.json({
                success: true,
                product: results[0]
            });
        }
    );
});


app.put("/api/products/:product_id", (req, res) => {
    const product_id = Number(req.params.product_id);
    const { farmer_id, quantity, price_per_unit, description } = req.body;

    if (!Number.isInteger(product_id) || product_id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    if (!farmer_id || quantity === undefined || price_per_unit === undefined) {
        return res.status(400).json({
            success: false,
            message: "Required fields are missing"
        });
    }

    const q = Number(quantity);
    const p = Number(price_per_unit);

    if (!Number.isFinite(q) || q <= 0 || !Number.isFinite(p) || p < 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid quantity or price"
        });
    }

    const sql = `
        UPDATE products
        SET quantity = ?, price_per_unit = ?, description = ?
        WHERE product_id = ? AND farmer_id = ?
    `;

    db.query(sql, [
        q,
        p,
        description ? description.trim() : null,
        product_id,
        farmer_id
    ], (err, result) => {
        if (err) {
            console.error("EDIT PRODUCT ERROR:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to update product"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found or not owned by this farmer"
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully"
        });
    });
});

app.delete("/api/products/:product_id", (req, res) => {
    const product_id = Number(req.params.product_id);
    const farmer_id = Number(req.body.farmer_id);

    if (
        !Number.isInteger(product_id) || product_id <= 0 ||
        !Number.isInteger(farmer_id) || farmer_id <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid product or farmer ID"
        });
    }

    const sql = `
        DELETE FROM products
        WHERE product_id = ? AND farmer_id = ?
    `;

    db.query(sql, [product_id, farmer_id], (err, result) => {
        if (err) {
            console.error("DELETE PRODUCT ERROR:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to delete product"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found or not owned by this farmer"
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully"
        });
    });
});


app.get("/api/produce", (req, res) => {
    const sql = `
        SELECT
            MIN(product_id) AS product_id,
            product_name
        FROM products
        GROUP BY product_name
        ORDER BY product_name ASC
    `;

    db.query(
        sql,
        (err, results) => {
            if (err) {
                console.error("PRODUCE ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch produce",
                    error: err.message
                });
            }

            res.json({
                success: true,
                produce: results
            });
        }
    );
});

app.get("/api/farmers", (req, res) => {
    const sql = `
        SELECT
            user_id,
            full_name,
            email,
            phone,
            role,
            created_at
        FROM users
        WHERE UPPER(TRIM(role)) = 'FARMER'
        ORDER BY full_name ASC
    `;

    db.query(
        sql,
        (err, results) => {
            if (err) {
                console.error("FARMERS ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch farmers",
                    error: err.message
                });
            }

            res.json({
                success: true,
                farmers: results,
                count: results.length
            });
        }
    );
});

app.get("/api/categories", (req, res) => {
    res.json({
        success: true,
        categories: []
    });
});

app.post("/api/orders", (req, res) => {
    const { customer_id, product_id, quantity } = req.body;

    if (!customer_id || !product_id || !quantity) {
        return res.status(400).json({
            success: false,
            message: "Customer, product and quantity are required"
        });
    }

    const q = Number(quantity);

    if (!Number.isFinite(q) || q <= 0) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a valid positive number"
        });
    }

    const checkProductSql = `
        SELECT product_id, product_name, quantity, unit
        FROM products
        WHERE product_id = ?
        LIMIT 1
    `;

    db.query(checkProductSql, [product_id], (err, products) => {
        if (err) {
            console.error("CHECK PRODUCT ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to check product availability"
            });
        }

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = products[0];
        const availableQuantity = Number(product.quantity);

        if (q > availableQuantity) {
            return res.status(400).json({
                success: false,
                message:
                    `Only ${availableQuantity} ${product.unit} of ${product.product_name} is available.`
            });
        }

        const newQuantity = availableQuantity - q;

        const updateProductSql = `
            UPDATE products
            SET quantity = ?
            WHERE product_id = ?
        `;

        db.query(
            updateProductSql,
            [newQuantity, product_id],
            (err, updateResult) => {
                if (err) {
                    console.error("UPDATE PRODUCT QUANTITY ERROR:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to update product quantity"
                    });
                }

                if (updateResult.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Product not found"
                    });
                }

                const orderSql = `
                    INSERT INTO orders
                    (customer_id, product_id, quantity, order_status)
                    VALUES (?, ?, ?, 'PENDING')
                `;

                db.query(
                    orderSql,
                    [customer_id, product_id, q],
                    (err, result) => {
                        if (err) {
                            console.error("CREATE ORDER ERROR:", err);

                            return res.status(500).json({
                                success: false,
                                message: "Failed to create order"
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "Order placed successfully!",
                            order_id: result.insertId,
                            remaining_quantity: newQuantity
                        });
                    }
                );
            }
        );
    });
});

app.get("/api/orders/customer/:customer_id", (req, res) => {
    const customer_id = Number(req.params.customer_id);

    if (!Number.isInteger(customer_id) || customer_id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid customer ID"
        });
    }

    const sql = `
        SELECT
            o.order_id,
            o.customer_id,
            o.product_id,
            o.quantity,
            o.order_status,
            o.created_at,
            p.product_name,
            p.unit,
            p.price_per_unit,
            u.user_id AS farmer_id,
            u.full_name AS farmer_name
        FROM orders o
        INNER JOIN products p
            ON o.product_id = p.product_id
        INNER JOIN users u
            ON p.farmer_id = u.user_id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC
    `;

    db.query(sql, [customer_id], (err, results) => {
        if (err) {
            console.error("ORDERS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch orders",
                error: err.message
            });
        }

        res.json({
            success: true,
            orders: results,
            count: results.length
        });
    });
});

app.get("/api/requests/farmer/:farmer_id", (req, res) => {
    const farmer_id = Number(req.params.farmer_id);

    if (!Number.isInteger(farmer_id) || farmer_id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid farmer ID"
        });
    }

    const sql = `
        SELECT
            cr.request_id,
            cr.customer_id,
            cr.product_name,
            cr.required_quantity,
            cr.unit,
            cr.request_status,
            cr.created_at,
            u.full_name AS customer_name,
            u.phone AS customer_phone,
            u.email AS customer_email
        FROM customer_requests cr
        INNER JOIN users u
            ON cr.customer_id = u.user_id
        INNER JOIN products p
            ON LOWER(TRIM(p.product_name)) =
               LOWER(TRIM(cr.product_name))
        WHERE p.farmer_id = ?
        AND p.quantity >= cr.required_quantity
        AND UPPER(TRIM(cr.request_status)) = 'OPEN'
        ORDER BY cr.created_at DESC
    `;

    db.query(sql, [farmer_id], (err, results) => {
        if (err) {
            console.error("FARMER REQUESTS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch farmer requests",
                error: err.message
            });
        }

        res.json({
            success: true,
            requests: results,
            count: results.length
        });
    });
});

app.get("/api/requests/customer/:customer_id", (req, res) => {
    const customer_id = Number(req.params.customer_id);

    if (!Number.isInteger(customer_id) || customer_id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid customer ID"
        });
    }

    const sql = `
        SELECT
            request_id,
            customer_id,
            product_name,
            required_quantity,
            unit,
            request_status,
            created_at
        FROM customer_requests
        WHERE customer_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [customer_id], (err, results) => {
        if (err) {
            console.error("REQUESTS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch requests",
                error: err.message
            });
        }

        res.json({
            success: true,
            requests: results,
            count: results.length
        });
    });
});
app.post("/api/requests", (req, res) => {
    const {
        customer_id,
        product_name,
        required_quantity,
        unit
    } = req.body;

    if (
        !customer_id ||
        !product_name ||
        !required_quantity ||
        !unit
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO customer_requests
        (customer_id, product_name, required_quantity, unit, request_status)
        VALUES (?, ?, ?, ?, 'OPEN')
    `;

    db.query(
        sql,
        [
            customer_id,
            product_name,
            required_quantity,
            unit
        ],
        (err, result) => {
            if (err) {
                console.error("CREATE REQUEST ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to create request",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Request created successfully",
                request_id: result.insertId
            });
        }
    );
});

app.put("/api/requests/:request_id/status", (req, res) => {
    const request_id = Number(req.params.request_id);
    const { status } = req.body;

    if (!Number.isInteger(request_id) || request_id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid request ID"
        });
    }

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status"
        });
    }

    const sql = `
        UPDATE customer_requests
        SET request_status = ?
        WHERE request_id = ?
    `;

    db.query(sql, [status, request_id], (err, result) => {
        if (err) {
            console.error("UPDATE REQUEST STATUS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to update request status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        res.json({
            success: true,
            message: `Request ${status.toLowerCase()} successfully`
        });
    });
});

app.post("/api/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Email and new password are required"
        });
    }

    try {
        const password_hash = await bcrypt.hash(newPassword, 10);

        const sql = `
            UPDATE users
            SET password_hash = ?
            WHERE email = ?
        `;

        db.query(sql, [password_hash, email], (err, result) => {
            if (err) {
                console.error("RESET PASSWORD ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to reset password"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                message: "Password reset successfully"
            });
        });
    } catch (error) {
        console.error("PASSWORD HASH ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to reset password"
        });
    }
});
app.get("/api/farmers/:farmer_id", (req, res) => {
    console.log("FARMER DETAILS ROUTE LOADED");
    const farmer_id = Number(req.params.farmer_id);

    if (!Number.isInteger(farmer_id) || farmer_id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid farmer ID"
        });
    }

    const farmerSql = `
        SELECT
            user_id,
            full_name,
            email,
            phone,
            role,
            created_at
        FROM users
        WHERE user_id = ?
        AND UPPER(TRIM(role)) = 'FARMER'
        LIMIT 1
    `;

    db.query(farmerSql, [farmer_id], (err, farmers) => {
        if (err) {
            console.error("FARMER DETAILS ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch farmer details",
                error: err.message
            });
        }

        if (farmers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found"
            });
        }

        const productsSql = `
            SELECT
                product_id,
                product_name,
                quantity,
                unit,
                price_per_unit,
                description,
                created_at
            FROM products
            WHERE farmer_id = ?
            ORDER BY created_at DESC
        `;

        db.query(productsSql, [farmer_id], (err, products) => {
            if (err) {
                console.error("FARMER PRODUCTS DETAILS ERROR:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch farmer products",
                    error: err.message
                });
            }

            res.json({
                success: true,
                farmer: farmers[0],
                products: products
            });
        });
    });
});

app.listen(PORT, () => {
    console.log("");
    console.log("========================================");
    console.log("       FARM2CONNECT BACKEND");
    console.log("========================================");
    console.log(`Server  : http://localhost:${PORT}`);
    console.log("Database: MySQL");
    console.log("Status  : Running");
    console.log("========================================");
    console.log("");
});


