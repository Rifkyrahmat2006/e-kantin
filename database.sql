-- =========================================================
-- 1. Tabel ADMIN
-- =========================================================
CREATE TABLE admins (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(50)  NOT NULL DEFAULT 'admin',
    created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 2. Tabel CUSTOMER / PELANGGAN
-- =========================================================
CREATE TABLE customers (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    table_number    VARCHAR(10)  NOT NULL,
    notes           VARCHAR(255) NULL,
    created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 3. Tabel KATEGORI MENU
-- =========================================================
CREATE TABLE menu_categories (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT NULL,
    status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Index tambahan (opsional)
CREATE INDEX idx_menu_categories_status
    ON menu_categories (status);

-- =========================================================
-- 4. Tabel MENU
-- =========================================================
CREATE TABLE menus (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    menu_category_id    BIGINT UNSIGNED NOT NULL,
    name                VARCHAR(150) NOT NULL,
    price               DECIMAL(12,2) NOT NULL,
    stock               INT UNSIGNED NOT NULL DEFAULT 0,
    description         TEXT NULL,
    status              ENUM('available','unavailable')
                        NOT NULL DEFAULT 'available',
    created_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_menus_category
        FOREIGN KEY (menu_category_id)
        REFERENCES menu_categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_menus_category_id
    ON menus (menu_category_id);

CREATE INDEX idx_menus_status
    ON menus (status);

-- =========================================================
-- 5. Tabel ORDERS (HEADER PESANAN)
-- =========================================================
CREATE TABLE orders (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT UNSIGNED NOT NULL,
    order_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    order_status    ENUM('PENDING','PROCESSING','COMPLETED','CANCELLED')
                    NOT NULL DEFAULT 'PENDING',
    notes           VARCHAR(255) NULL,
    created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_orders_customer_id
    ON orders (customer_id);

CREATE INDEX idx_orders_status
    ON orders (order_status);

CREATE INDEX idx_orders_order_time
    ON orders (order_time);

-- =========================================================
-- 6. Tabel ORDER_ITEMS (DETAIL PESANAN)
-- =========================================================
CREATE TABLE order_items (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT UNSIGNED NOT NULL,
    menu_id         BIGINT UNSIGNED NOT NULL,
    quantity        INT UNSIGNED NOT NULL,
    unit_price      DECIMAL(12,2) NOT NULL,
    subtotal        DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_menu
        FOREIGN KEY (menu_id)
        REFERENCES menus(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_order_items_order_id
    ON order_items (order_id);

CREATE INDEX idx_order_items_menu_id
    ON order_items (menu_id);

-- =========================================================
-- 7. Tabel TRANSACTIONS (PEMBAYARAN)
-- =========================================================
CREATE TABLE transactions (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id            BIGINT UNSIGNED NOT NULL,
    customer_id         BIGINT UNSIGNED NOT NULL,
    amount_paid         DECIMAL(12,2) NOT NULL,
    payment_method      ENUM('CASH','TRANSFER','EWALLET','OTHER')
                        NOT NULL DEFAULT 'CASH',
    payment_status      ENUM('PENDING','PAID','FAILED')
                        NOT NULL DEFAULT 'PENDING',
    transaction_time    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference_code      VARCHAR(100) NULL,
    created_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_transactions_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_transactions_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_transactions_order_id
    ON transactions (order_id);

CREATE INDEX idx_transactions_customer_id
    ON transactions (customer_id);

CREATE INDEX idx_transactions_status
    ON transactions (payment_status);

CREATE INDEX idx_transactions_time
    ON transactions (transaction_time);

-- =========================================================
-- 8. Tabel EXPENSES (PENGELUARAN)
-- =========================================================
CREATE TABLE expenses (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    expense_date        DATE NOT NULL,
    expense_category    VARCHAR(100) NOT NULL,
    amount              DECIMAL(12,2) NOT NULL,
    description         TEXT NULL,
    created_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_expenses_date
    ON expenses (expense_date);

CREATE INDEX idx_expenses_category
    ON expenses (expense_category);
```