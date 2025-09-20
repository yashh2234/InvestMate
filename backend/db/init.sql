CREATE TABLE users (
 id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
 first_name VARCHAR(100) NOT NULL,
 last_name VARCHAR(100),
 email VARCHAR(255) UNIQUE NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 risk_appetite ENUM('low','moderate','high') DEFAULT 'moderate',
 otp VARCHAR(6),
 otp_expiry DATETIME,
 role ENUM('user','admin') DEFAULT 'user',
 reset_token VARCHAR(255),
 reset_expiry DATETIME,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE investment_products (
 id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
 name VARCHAR(255) NOT NULL,
 investment_type ENUM('bond','fd','mf','etf','other') NOT NULL,
 tenure_months INT NOT NULL,
 annual_yield DECIMAL(5,2) NOT NULL,
 risk_level ENUM('low','moderate','high') NOT NULL,
 min_investment DECIMAL(12,2) DEFAULT 1000.00,
 max_investment DECIMAL(12,2),
 description TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE investments (
 id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
 user_id CHAR(36) NOT NULL,
 product_id CHAR(36) NOT NULL,
 amount DECIMAL(12,2) NOT NULL,
 invested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 status ENUM('active','matured','cancelled') DEFAULT 'active',
 expected_return DECIMAL(12,2),
 maturity_date DATE,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (product_id) REFERENCES investment_products(id) ON DELETE CASCADE
);
CREATE TABLE transaction_logs (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 user_id CHAR(36),
 email VARCHAR(255),
 endpoint VARCHAR(255) NOT NULL,
 http_method ENUM('GET','POST','PUT','DELETE') NOT NULL,
 status_code INT NOT NULL,
 error_message TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (id, first_name, last_name, email, password_hash, risk_appetite, role)
VALUES (
  UUID(),
  'Yash',
  'Agrawal',
  'yashhagrawal22@gmail.com',
  '$2b$10$ZYOvdlE/GybZw1VXyTFTRO1JujH1OWMMnH5a3LGr5BMdoKy/pAHc6', -- bcrypt hash of "Yashagra@123"
  'moderate',
  'user'
);

INSERT INTO users (id, first_name, email, password_hash, risk_appetite, role)
VALUES (
  UUID(),
  'Admin',
  'admin2@gripinvest.com',
  '$2b$10$h3uahHLIUW.BrbCNLIkK/ebmigQv38LtrW7c5NPe/8scxizIIlQOa', -- bcrypt hash of "Admin@123"
  'moderate',
  'admin'
);

INSERT INTO investment_products
(id, name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description)
VALUES
(UUID(), 'Government Savings Bond 2025', 'bond', 60, 7.50, 'low', 10000, 1000000, 'Safe government-backed bond with fixed returns and 5-year maturity.'),
(UUID(), 'Bluechip Equity Mutual Fund', 'mf', 36, 14.00, 'moderate', 1000, 200000, 'Diversified equity mutual fund focused on large-cap stocks with steady growth.'),
(UUID(), 'Secure Bank FD', 'fd', 12, 6.80, 'low', 1000, NULL, 'Traditional bank fixed deposit offering guaranteed returns.'),
(UUID(), 'Startup Angel Fund', 'other', 48, 20.00, 'high', 25000, 500000, 'High-risk, high-reward investment in early-stage startups.'),
(UUID(), 'Nifty 50 Index ETF', 'etf', 24, 12.50, 'moderate', 1000, 500000, 'ETF tracking the Nifty 50 index with exposure to India’s top companies.');
