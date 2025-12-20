

-- Tạo indexes cho hiệu năng
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_media_product_id ON product_media(product_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
-- CREATE INDEX idx_reviews_product_id ON reviews(product_id);
-- CREATE INDEX idx_reviews_user_id ON reviews(user_id);
-- CREATE INDEX idx_comments_product_id ON comments(product_id);
-- CREATE INDEX idx_comments_parent_id ON comments(parent_id);


    -- 1. users
INSERT INTO users (user_id, email, password_hash, full_name, phone_number, gender, birth_date, role, avatar_url, is_active, created_at, updated_at) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@example.com', '$2b$10$X7s...', 'Nguyen Van Admin', '0987654321', 'male', '1990-01-01', 'admin', 'https://img.com/admin.jpg', TRUE, '2025-10-20 08:30:00', '2025-10-20 08:30:00'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'customer1@example.com', '$2b$10$Y8t...', 'Le Thi B', '0912345678', 'female', '1995-05-15', 'customer', 'https://img.com/customer1.jpg', TRUE, '2025-10-21 09:15:00', '2025-10-21 09:15:00'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'customer2@example.com', '$2b$10$Z9u...', 'Tran Van C', '0923456789', 'male', '1998-08-20', 'customer', NULL, TRUE, '2025-10-22 10:00:00', '2025-10-22 10:00:00');

-- 2. addresses
INSERT INTO addresses (address_id, user_id, recipient_name, phone, street, ward, district, city, is_default, created_at, updated_at) VALUES
('b1ffcd22-1d2a-4b3c-9d4e-5f6a7b8c9d01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nguyen Van Admin', '0987654321', '123 Đường Láng', 'Phường Láng Thượng', 'Quận Đống Đa', 'Hà Nội', TRUE, '2025-10-20 08:30:00', '2025-10-20 08:30:00'),
('b1ffcd22-1d2a-4b3c-9d4e-5f6a7b8c9d02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Le Thi B', '0912345678', '456 Đường 3/2', 'Phường 12', 'Quận 10', 'TP. Hồ Chí Minh', TRUE, '2025-10-21 09:15:00', '2025-10-21 09:15:00'),
('b1ffcd22-1d2a-4b3c-9d4e-5f6a7b8c9d03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Le Thi B', '0912345678', '789 Đường Lê Lợi', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', FALSE, '2025-10-21 10:00:00', '2025-10-21 10:00:00');
-- 3. brands
INSERT INTO brands (brand_id, name, logo_url) VALUES
(1, 'Nike', 'https://img.com/nike.png'),
(2, 'Adidas', 'https://img.com/adidas.png'),
(3, 'Puma', 'https://img.com/puma.png');

-- 4. categories
INSERT INTO categories (category_id, name, parent_id) VALUES
(1, 'Giày thể thao', NULL),
(2, 'Giày chạy bộ', 1),
(3, 'Giày đá bóng', 1),
(4, 'Giày thời trang', NULL),
(5, 'Giày sneaker', 4);

-- 5. products
INSERT INTO products (product_id, name, base_price, brand_id, category_id, average_rating, description, created_at, updated_at, sold_count) VALUES
('c2dd3344-ee55-66ff-8899-aabbccddee01', 'Nike Air Max 90', 3500000.00, 1, 2, 4.5, 'Giày chạy bộ công nghệ Air Max', '2025-10-20 08:30:00', '2025-10-20 08:30:00', 150),
('c2dd3344-ee55-66ff-8899-aabbccddee02', 'Adidas Ultraboost', 4200000.00, 2, 2, 4.7, 'Giày chạy bộ đệm Boost', '2025-10-21 09:00:00', '2025-10-21 09:00:00', 200),
('c2dd3344-ee55-66ff-8899-aabbccddee03', 'Puma RS-X', 2800000.00, 3, 5, 4.3, 'Giày sneaker retro', '2025-10-22 10:00:00', '2025-10-22 10:00:00', 80);

-- 6. product_variants
INSERT INTO product_variants (variant_id, product_id, sku, color_name, color_hex, size, stock_quantity, price_modifier, created_at, updated_at) VALUES
('d4ee5566-ff77-8899-00aa-bbccddeeff01', 'c2dd3344-ee55-66ff-8899-aabbccddee01', 'NIKE-AM90-RED-42', 'Red', '#FF0000', '42', 100, 200000.00, '2025-10-20 08:30:00', '2025-10-20 08:30:00'),
('d4ee5566-ff77-8899-00aa-bbccddeeff02', 'c2dd3344-ee55-66ff-8899-aabbccddee01', 'NIKE-AM90-BLACK-43', 'Black', '#000000', '43', 80, 0.00, '2025-10-20 08:30:00', '2025-10-20 08:30:00'),
('d4ee5566-ff77-8899-00aa-bbccddeeff03', 'c2dd3344-ee55-66ff-8899-aabbccddee02', 'ADIDAS-UB-WHITE-41', 'White', '#FFFFFF', '41', 120, 0.00, '2025-10-21 09:00:00', '2025-10-21 09:00:00');

-- 7. product_media
INSERT INTO product_media (media_id, product_id, url, media_type, is_thumbnail) VALUES
('e5ff6677-aa88-bb99-cc00-ddeeffaabb01', 'c2dd3344-ee55-66ff-8899-aabbccddee01', 'https://img.com/airmax-red.jpg', 'image', TRUE),
('e5ff6677-aa88-bb99-cc00-ddeeffaabb02', 'c2dd3344-ee55-66ff-8899-aabbccddee01', 'https://img.com/airmax-red-2.jpg', 'image', FALSE),
('e5ff6677-aa88-bb99-cc00-ddeeffaabb03', 'c2dd3344-ee55-66ff-8899-aabbccddee02', 'https://img.com/ultraboost-white.jpg', 'image', TRUE);


DELETE FROM product_media
WHERE url LIKE '%ultraboost%';

-- 2. Thêm lại ảnh mới, nhưng dùng lệnh SELECT để lấy ID CHÍNH XÁC từ bảng products
-- Cách này đảm bảo 100% không bao giờ bị lệch ID nữa
INSERT INTO product_media (
    media_id,
    product_id,
    variant_id,
    url,
    media_type,
    is_thumbnail
)
VALUES (
    gen_random_uuid(), -- Tạo ID ảnh mới
    (SELECT product_id FROM products WHERE name LIKE '%Adidas Ultraboost%' LIMIT 1), -- 👇 LẤY ID CHUẨN TỪ DB
    NULL, -- Để null để test logic lấy ảnh cha trước
    'https://assets.adidas.com/images/w_600,f_auto,q_auto/35928d32785d47159781af50005d5363_9366/Ultraboost_Light_Running_Shoes_White_HQ6351_01_standard.jpg',
    'image',
    true
);

INSERT INTO vouchers (code, discount_type, discount_value, min_order_value, valid_from, valid_to, usage_limit, is_active,created_at)
VALUES ('HELLO2025', 'fixed', 50000, 100000, NOW(), '2025-12-31', 100, true,now());

-- Thêm khóa ngoại cho voucher
ALTER TABLE orders
ADD CONSTRAINT fk_orders_vouchers
FOREIGN KEY (voucher_id)
REFERENCES vouchers(voucher_id)
ON DELETE SET NULL;