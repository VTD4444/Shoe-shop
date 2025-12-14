
-- 1. TẠO SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================================
-- NHÓM 1: USER (Chỉ bắt buộc Email và Pass)
-- =======================================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL, -- Bắt buộc để login
    password_hash VARCHAR(255) NOT NULL, -- Bắt buộc
    full_name VARCHAR(100), -- Có thể null, update sau
    phone_number VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gender VARCHAR(10),
    birth_date DATE
);

-- Bảng địa chỉ: Bỏ hết Not Null, chỉ cần link với user là được
CREATE TABLE addresses (
    address_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_name VARCHAR(100),
    phone VARCHAR(20),
    street TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- NHÓM 2: SẢN PHẨM (Giữ lại cái khung sườn chính)
-- =======================================================

CREATE TABLE brands (
    brand_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Brand phải có tên
    logo_url TEXT
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Category phải có tên
    parent_id INTEGER,
    description TEXT
);

CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- Bắt buộc
    base_price DECIMAL(15, 2) NOT NULL, -- Bắt buộc để không lỗi tính toán
    brand_id INTEGER REFERENCES brands(brand_id),
    category_id INTEGER REFERENCES categories(category_id),
    description TEXT,
    average_rating DECIMAL(2, 1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
    variant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    sku VARCHAR(50) UNIQUE NOT NULL, -- SKU bắt buộc để quản lý kho
    color_name VARCHAR(50), -- Test chưa cần màu cũng được
    color_hex VARCHAR(7),
    size VARCHAR(10), -- Test chưa cần size cũng được
    stock_quantity INTEGER DEFAULT 0,
    price_modifier DECIMAL(15, 2) DEFAULT 0.00
);

CREATE TABLE product_media (
    media_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(variant_id) ON DELETE SET NULL,
    url TEXT NOT NULL, -- Phải có link ảnh/3D
    media_type VARCHAR(20) DEFAULT 'image', -- Mặc định là ảnh cho nhanh
    is_thumbnail BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- NHÓM 3: ĐƠN HÀNG (Giảm tải validate tối đa)
-- =======================================================

CREATE TABLE vouchers (
    voucher_id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'fixed',
    discount_value DECIMAL(15, 2) NOT NULL,
    min_order_value DECIMAL(15, 2) DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE cart_items (
    cart_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(15, 2) NOT NULL, -- Tiền thì phải có
    shipping_fee DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    payment_method VARCHAR(50), -- Có thể update sau khi thanh toán
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    shipping_address JSONB, -- Cho phép null để test tạo đơn nhanh
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(variant_id),
    quantity INTEGER DEFAULT 1,
    price_at_purchase DECIMAL(15, 2) NOT NULL -- Giá lúc mua bắt buộc phải lưu
);

-- =======================================================
-- NHÓM 4: CỘNG ĐỒNG
-- =======================================================

CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(item_id) UNIQUE,
    rating INTEGER, -- Test chưa cần chấm điểm
    comment TEXT, -- Test chưa cần nhập chữ
    fit_rating VARCHAR(20),
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
    content TEXT, -- Cho phép null lúc debug
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- INDEXING
-- =======================================================
-- tìm sản phẩm
CREATE INDEX idx_products_name ON products(name);

-- join nhanh
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);

-- cart / order
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);

-- review
CREATE INDEX idx_reviews_product ON reviews(product_id);
