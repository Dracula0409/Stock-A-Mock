# Docker_Image_Setup_for_DB (MacOS)

# pre-req

1. Install Docker Desktop for Mac

2. Verify Docker is working:
   docker version

🐳 Step 1: Pull the Oracle XE 21c Image

    docker pull gvenzl/oracle-xe:21-slim

    --This downloads a slim version (~2 GB compressed, ~10 GB used on disk).

🐳 Step 2: Run the Oracle Database Container

    docker volume create oracle-xe-data

    -- To avoid losing data when you stop/remove the container:

    docker run -d \
      --name oracle-xe \
      -p 1521:1521 -p 8080:8080 \
      -v oracle-xe-data:/opt/oracle/oradata \
      -e ORACLE_PASSWORD=SqlPlusDB \
      gvenzl/oracle-xe:21-slim

🔍 Step 3: Test the Container

      docker ps
      docker logs -f oracle-xe

      Look for a line like:
      DATABASE IS READY TO USE!

🛠️ Step 4: Connect to Oracle

      docker exec -it oracle-xe sqlplus system/SqlPlusDB@//localhost/XEPDB1

      (or)

      sqlplus system/SqlPlusDB@//localhost/XEPDB1

# Insertion_of_Tables (OracleSQL)

CREATE TABLE Stocks (
stock_id NUMBER PRIMARY KEY,
symbol VARCHAR2(10) UNIQUE NOT NULL,
company_name VARCHAR2(100),
current_price NUMBER,
last_updated TIMESTAMP
);

CREATE TABLE Users (
user_id NUMBER PRIMARY KEY,
username VARCHAR2(50) UNIQUE NOT NULL,
email VARCHAR2(100) UNIQUE NOT NULL,
password_hash VARCHAR2(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DematAccounts (
account_id NUMBER PRIMARY KEY,
user_id NUMBER REFERENCES Users(user_id) ON DELETE CASCADE,
balance NUMBER DEFAULT 100000, -- starting mock balance
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Transactions (
txn_id NUMBER PRIMARY KEY,
account_id NUMBER REFERENCES DematAccounts(account_id) ON DELETE CASCADE,
stock_id NUMBER REFERENCES Stocks(stock_id) ON DELETE CASCADE,
quantity NUMBER,
price_at_txn NUMBER,
txn_type VARCHAR2(4) CHECK (txn_type IN ('BUY', 'SELL')),
txn_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE USER_HOLDINGS (
HOLDING_ID NUMBER PRIMARY KEY,
USER_ID NUMBER REFERENCES USERS(USER_ID),
SYMBOL VARCHAR2(10),
QUANTITY NUMBER CHECK (QUANTITY >= 0),
AVERAGE_PRICE NUMBER,
UNIQUE (USER_ID, SYMBOL)
);

CREATE VIEW Portfolio AS
SELECT
da.account*id,
s.symbol,
s.company_name,
SUM(CASE WHEN t.txn_type = 'BUY' THEN t.quantity
WHEN t.txn_type = 'SELL' THEN -t.quantity ELSE 0 END) AS quantity_held,
SUM(CASE WHEN t.txn_type = 'BUY' THEN t.quantity * t.price*at_txn
WHEN t.txn_type = 'SELL' THEN -t.quantity * t.price_at_txn ELSE 0 END) AS invested_value
FROM
Transactions t
JOIN DematAccounts da ON t.account_id = da.account_id
JOIN Stocks s ON t.stock_id = s.stock_id
GROUP BY da.account_id, s.symbol, s.company_name;

# Sequence_for_Tables (OracleSQL)

CREATE SEQUENCE stocks_seq
START WITH 1
INCREMENT BY 1
NOCACHE;

# Trigger_to_assign_Primary_Key (OracleSQL)

CREATE OR REPLACE TRIGGER trg_stocks_id
BEFORE INSERT ON Stocks
FOR EACH ROW
WHEN (NEW.stock_id IS NULL)
BEGIN
SELECT stocks_seq.NEXTVAL INTO :NEW.stock_id FROM dual;
END;
/

---

# Buy_Stock (PL/SQL) :

CREATE OR REPLACE PROCEDURE buy_stock (
p_account_id IN NUMBER,
p_stock_id IN NUMBER,
p_symbol IN VARCHAR2,
p_quantity IN NUMBER,
p_price IN NUMBER
) AS
v_user_id NUMBER;
v_exists NUMBER;
v_old_qty NUMBER;
v_old_avg NUMBER;
v_current_balance NUMBER;
v_total_cost NUMBER;
BEGIN
-- Get user_id and current balance with row lock
SELECT user_id, balance INTO v_user_id, v_current_balance
FROM DematAccounts
WHERE account_id = p_account_id
FOR UPDATE; -- Lock the account row for update

-- Calculate total cost
v_total_cost := p_quantity \* p_price;

-- Check sufficient balance
IF v_current_balance < v_total_cost THEN
RAISE_APPLICATION_ERROR(-20001,
'Insufficient balance. Required: ' || v_total_cost || ', Available: ' || v_current_balance
);
END IF;

-- Deduct amount from Demat account
UPDATE DematAccounts
SET balance = balance - v_total_cost
WHERE account_id = p_account_id;

-- Record transaction
INSERT INTO TRANSACTIONS (
TXN_ID,
ACCOUNT_ID,
STOCK_ID,
QUANTITY,
PRICE_AT_TXN,
TXN_TYPE,
TXN_TIME
) VALUES (
trans_seq.NEXTVAL,
p_account_id,
p_stock_id,
p_quantity,
p_price,
'BUY',
SYSDATE
);

-- Update user holdings
SELECT COUNT(\*) INTO v_exists
FROM USER_HOLDINGS
WHERE USER_ID = v_user_id AND SYMBOL = p_symbol;

IF v_exists = 0 THEN
INSERT INTO USER_HOLDINGS (
USER_ID, SYMBOL, QUANTITY, AVERAGE_PRICE
)
VALUES (
v_user_id, p_symbol, p_quantity, p_price
);
ELSE
SELECT QUANTITY, AVERAGE_PRICE
INTO v_old_qty, v_old_avg
FROM USER_HOLDINGS
WHERE USER_ID = v_user_id AND SYMBOL = p_symbol;

    UPDATE USER_HOLDINGS
    SET
      QUANTITY = v_old_qty + p_quantity,
      AVERAGE_PRICE = ((v_old_qty * v_old_avg) + (p_quantity * p_price)) / (v_old_qty + p_quantity)
    WHERE USER_ID = v_user_id AND SYMBOL = p_symbol;

END IF;

COMMIT;

EXCEPTION
WHEN NO_DATA_FOUND THEN
ROLLBACK;
RAISE_APPLICATION_ERROR(-20002, 'Account not found');
WHEN OTHERS THEN
ROLLBACK;
RAISE;
END;
/

---

# Sell_Stock (PL/SQL) :

CREATE OR REPLACE PROCEDURE sell_stock (
p_account_id IN NUMBER,
p_stock_id IN NUMBER,
p_symbol IN VARCHAR2,
p_quantity IN NUMBER,
p_price IN NUMBER
) AS
v_user_id NUMBER;
v_current_qty NUMBER;
v_current_balance NUMBER;
v_sale_proceeds NUMBER;
BEGIN
-- Get user_id and current balance with row lock
SELECT user_id, balance INTO v_user_id, v_current_balance
FROM DematAccounts
WHERE account_id = p_account_id
FOR UPDATE; -- Lock the account row for update

-- Validate stock exists
DECLARE
v_stock_exists NUMBER;
BEGIN
SELECT COUNT(\*) INTO v_stock_exists
FROM Stocks
WHERE stock_id = p_stock_id AND symbol = p_symbol;

    IF v_stock_exists = 0 THEN
      RAISE_APPLICATION_ERROR(-20002, 'Invalid stock ID or symbol');
    END IF;

END;

-- Get current quantity with row lock
SELECT quantity INTO v_current_qty
FROM USER_HOLDINGS
WHERE USER_ID = v_user_id
AND SYMBOL = p_symbol
FOR UPDATE;

-- Validate sufficient quantity
IF v_current_qty < p_quantity THEN
RAISE_APPLICATION_ERROR(-20003, 'Insufficient quantity to sell');
END IF;

-- Calculate sale proceeds
v_sale_proceeds := p_quantity \* p_price;

-- Update Demat account balance
UPDATE DematAccounts
SET balance = balance + v_sale_proceeds
WHERE account_id = p_account_id;

-- Record transaction
INSERT INTO TRANSACTIONS (
TXN_ID,
ACCOUNT_ID,
STOCK_ID,
QUANTITY,
PRICE_AT_TXN,
TXN_TYPE,
TXN_TIME
) VALUES (
trans_seq.NEXTVAL,
p_account_id,
p_stock_id,
p_quantity,
p_price,
'SELL',
SYSDATE
);

-- Update holdings
IF v_current_qty = p_quantity THEN
DELETE FROM USER_HOLDINGS
WHERE USER_ID = v_user_id AND SYMBOL = p_symbol;
ELSE
UPDATE USER_HOLDINGS
SET QUANTITY = QUANTITY - p_quantity
WHERE USER_ID = v_user_id AND SYMBOL = p_symbol;
END IF;

COMMIT;

EXCEPTION
WHEN NO_DATA_FOUND THEN
ROLLBACK;
RAISE_APPLICATION_ERROR(-20004, CASE
WHEN v_user_id IS NULL THEN 'Account not found'
ELSE 'Stock not held in portfolio'
END);
WHEN OTHERS THEN
ROLLBACK;
RAISE;
END;
/

---

# CAGR-Calc (PL/SQL) :

CREATE OR REPLACE FUNCTION calculate_cagr (p_user_id IN NUMBER) RETURN NUMBER IS
v_initial_value NUMBER;
v_final_value NUMBER;
v_years NUMBER;
v_initial_date DATE;
v_final_date DATE := SYSDATE;
v_cagr NUMBER := 0;
v_account_id NUMBER;
BEGIN
-- Get the account_id for this user (critical fix)
BEGIN
SELECT account_id INTO v_account_id
FROM DematAccounts
WHERE user_id = p_user_id;
EXCEPTION
WHEN NO_DATA_FOUND THEN
RETURN 0; -- No account found
END;

-- Check if user has holdings
DECLARE
v_holdings_count NUMBER;
BEGIN
SELECT COUNT(\*) INTO v_holdings_count
FROM USER_HOLDINGS
WHERE USER_ID = p_user_id;

    IF v_holdings_count = 0 THEN
      RETURN 0; -- No holdings, no CAGR
    END IF;

END;

-- Get earliest transaction date
SELECT MIN(TXN_TIME) INTO v_initial_date
FROM TRANSACTIONS
WHERE ACCOUNT_ID = v_account_id;

-- Get initial investment value (first purchase price)
SELECT PRICE_AT_TXN INTO v_initial_value
FROM TRANSACTIONS
WHERE ACCOUNT_ID = v_account_id
AND TXN_TYPE = 'BUY'
AND TXN_TIME = v_initial_date;

-- Get current stock price
SELECT AVG(s.CURRENT_PRICE) INTO v_final_value
FROM USER_HOLDINGS uh
JOIN STOCKS s ON uh.SYMBOL = s.SYMBOL
WHERE uh.USER_ID = p_user_id;

-- Calculate years (with validation)
v_years := MONTHS_BETWEEN(v_final_date, v_initial_date) / 12;

-- Calculate CAGR with safety checks
IF v_years > 0 AND v_initial_value > 0 AND v_final_value > 0 THEN
v_cagr := POWER((v_final_value / v_initial_value), (1 / v_years)) - 1;
END IF;

RETURN v_cagr;
EXCEPTION
WHEN NO_DATA_FOUND THEN
RETURN 0;
WHEN OTHERS THEN
RETURN 0;
END;
/

---

# XIRR-Calc (PL/SQL) :

CREATE OR REPLACE FUNCTION calculate_xirr (p_user_id IN NUMBER) RETURN NUMBER IS
TYPE DateArray IS VARRAY(1000) OF DATE;
TYPE CashFlowArray IS VARRAY(1000) OF NUMBER;

v_account_id NUMBER;
v_dates DateArray := DateArray();
v_cashflows CashFlowArray := CashFlowArray();
v_xirr NUMBER := 0.1; -- Initial guess
v_transactions_exist NUMBER;
v_start_date DATE;
v_current_value NUMBER;
BEGIN
-- Get account_id (critical fix)
BEGIN
SELECT account_id INTO v_account_id
FROM DematAccounts
WHERE user_id = p_user_id;
EXCEPTION
WHEN NO_DATA_FOUND THEN
RETURN 0; -- No account found
END;

-- Check if transactions exist
SELECT COUNT(\*) INTO v_transactions_exist
FROM TRANSACTIONS
WHERE ACCOUNT_ID = v_account_id;

IF v_transactions_exist = 0 THEN
RETURN 0; -- No transactions
END IF;

-- Get transaction cash flows with correct ACCOUNT*ID filter
FOR tx IN (
SELECT
TXN_TIME,
CASE
WHEN TXN_TYPE = 'BUY' THEN -1 * (QUANTITY _ PRICE_AT_TXN)
WHEN TXN_TYPE = 'SELL' THEN QUANTITY _ PRICE_AT_TXN
END AS cash_flow
FROM TRANSACTIONS
WHERE ACCOUNT_ID = v_account_id
ORDER BY TXN_TIME
) LOOP
v_dates.EXTEND;
v_cashflows.EXTEND;
v_dates(v_dates.COUNT) := tx.TXN_TIME;
v_cashflows(v_cashflows.COUNT) := tx.cash_flow;
END LOOP;

-- Add current portfolio value as final cashflow
SELECT SUM(uh.QUANTITY \* s.CURRENT_PRICE)
INTO v_current_value
FROM USER_HOLDINGS uh
JOIN STOCKS s ON uh.SYMBOL = s.SYMBOL
WHERE uh.USER_ID = p_user_id;

IF v_current_value > 0 THEN
v_dates.EXTEND;
v_cashflows.EXTEND;
v_dates(v_dates.COUNT) := SYSDATE;
v_cashflows(v_cashflows.COUNT) := v_current_value;
END IF;

-- Need at least two cashflows for XIRR
IF v_dates.COUNT < 2 THEN
RETURN 0;
END IF;

v_start_date := v_dates(1);

-- Newton-Raphson Implementation
FOR iter IN 1..100 LOOP
DECLARE
v_sum NUMBER := 0;
v_derivative NUMBER := 0;
v_years NUMBER;
v_new_xirr NUMBER;
BEGIN
-- Calculate function value and derivative
FOR i IN 1..v_dates.COUNT LOOP
v_years := MONTHS_BETWEEN(v_dates(i), v_start_date) / 12;
IF v_years = 0 AND v_cashflows(i) < 0 THEN
CONTINUE; -- Skip initial investment on day 0
END IF;

        v_sum := v_sum + v_cashflows(i) / POWER(1 + v_xirr, v_years);
        v_derivative := v_derivative - v_years * v_cashflows(i) /
                        POWER(1 + v_xirr, v_years + 1);
      END LOOP;

      -- Avoid division by zero
      IF ABS(v_derivative) < 0.000001 THEN
        EXIT;
      END IF;

      -- Update XIRR estimate
      v_new_xirr := v_xirr - v_sum / v_derivative;

      -- Check convergence
      IF ABS(v_new_xirr - v_xirr) < 0.0001 THEN
        v_xirr := v_new_xirr;
        EXIT;
      END IF;

      v_xirr := v_new_xirr;
    END;

END LOOP;

RETURN v_xirr;
EXCEPTION
WHEN OTHERS THEN
RETURN 0;
END;
/

---

# Future-Prediction (PL/SQL) :

CREATE OR REPLACE PROCEDURE predict_stock_return (
p_symbol IN VARCHAR2,
p_days IN NUMBER,
p_price OUT NUMBER,
p_cagr OUT NUMBER
) AS
v_current_price NUMBER;
v_cagr NUMBER;
v_future_price NUMBER;
BEGIN
-- Fetch the current price of the stock
SELECT current_price INTO v_current_price
FROM stocks
WHERE symbol = p_symbol;

    -- Generate a mock CAGR between 5% to 20%
    v_cagr := DBMS_RANDOM.VALUE(5, 20);

    -- Calculate future price using CAGR
    -- Formula: Future Price = Present Price * (1 + CAGR/100)^(days/365)
    v_future_price := v_current_price * POWER(1 + v_cagr / 100, p_days / 365);

    -- Return values
    p_price := ROUND(v_future_price, 2);
    p_cagr  := ROUND(v_cagr, 2);

END;
/
