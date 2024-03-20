# app/models/stock_inout.rb
class Stock < ApplicationRecord
  has_many :stock_inout
  belongs_to :product
  scope :prepare_bill_amounts, -> (from_date = nil, to_date = nil, shipper_id = nil, warehouse_id = nil, page = nil, limit = nil) {
    query = <<-SQL
     SELECT   current_bill_amounts.*, COALESCE(latest_bill_amounts.current_stock_amount, 0) as previous_stock_amount, 
        (COALESCE(latest_bill_amounts.current_stock_amount, 0)+
        COALESCE(current_bill_amounts.first_half_instock_amount, 0)+
        COALESCE(current_bill_amounts.mid_instock_amount,0)+
        COALESCE(current_bill_amounts.second_half_instock_amount,0)-
         COALESCE(current_bill_amounts.first_half_outstock_amount,0)-
         COALESCE(current_bill_amounts.mid_outstock_amount,0)-
         COALESCE(current_bill_amounts.second_half_outstock_amount,0)) as current_stock_amount,

         (COALESCE(latest_bill_amounts.current_stock_amount, 0)+
         COALESCE(current_bill_amounts.first_half_instock_amount,0)+

         COALESCE(latest_bill_amounts.current_stock_amount,0)+
         COALESCE(current_bill_amounts.first_half_instock_amount,0)-
         COALESCE(current_bill_amounts.first_half_outstock_amount,0)+
         COALESCE(current_bill_amounts.mid_instock_amount,0)+

         COALESCE(latest_bill_amounts.current_stock_amount,0)+
         COALESCE(current_bill_amounts.first_half_instock_amount,0)-
         COALESCE(current_bill_amounts.first_half_outstock_amount,0)+
         COALESCE(current_bill_amounts.mid_instock_amount,0)-
         COALESCE(current_bill_amounts.second_half_instock_amount,0)) as total_inout_stock_amount
        FROM (
        SELECT stock_id, MIN(lot_number) as lot_number, products.name as product_name, products.id as product_id,
        SUM(CASE WHEN category = 0 AND DAY(inout_on) >= 1 AND DAY(inout_on) <= 10 THEN stock_inouts.amount ELSE 0 END) as first_half_instock_amount,
        SUM(CASE WHEN category = 1 AND DAY(inout_on) >= 1 AND DAY(inout_on) <= 10 THEN stock_inouts.amount ELSE 0 END) as first_half_outstock_amount,
        SUM(CASE WHEN category = 0 AND DAY(inout_on) >= 11 AND DAY(inout_on) <= 20 THEN stock_inouts.amount ELSE 0 END) as mid_instock_amount,
        SUM(CASE WHEN category = 1 AND DAY(inout_on) >= 11 AND DAY(inout_on) <= 20 THEN stock_inouts.amount ELSE 0 END) as mid_outstock_amount,
        SUM(CASE WHEN category = 0 AND DAY(inout_on) >= 21 AND DAY(inout_on) <= 31 THEN stock_inouts.amount ELSE 0 END) as second_half_instock_amount,
        SUM(CASE WHEN category = 1 AND DAY(inout_on) >= 21 AND DAY(inout_on) <= 31 THEN stock_inouts.amount ELSE 0 END) as second_half_outstock_amount,
        -- SUM(CASE WHEN category = 0 THEN amount ELSE 0 END) - SUM(CASE WHEN category = 1 THEN amount ELSE 0 END) as stock_amount
        MAX(CASE WHEN category = 0 THEN stock_inouts.handling_fee_rate ELSE 0 END) AS instock_handle_fee_rate, 
        MAX(CASE WHEN category = 1 THEN stock_inouts.handling_fee_rate ELSE 0 END) AS outstock_handle_fee_rate, 
        MAX(stock_inouts.storage_fee_rate) AS storage_fee_rate

        FROM stock_inouts
        JOIN stocks on stocks.id = stock_inouts.stock_id
        JOIN products on products.id = stocks.product_id
        WHERE inout_on BETWEEN '#{from_date}' AND '#{to_date}' AND is_billed = 0  #{shipper_id.present? ? " And shipper_id = '#{shipper_id}'" : ''}  #{warehouse_id.present? ? " And warehouse_id = '#{warehouse_id}'" : ''}
        GROUP BY stock_id, lot_number
        ) current_bill_amounts
        LEFT JOIN (
        SELECT bill_amounts.*
        FROM bill_amounts 
          JOIN (
            SELECT bills.id
						FROM bills
            join  (
              SELECT shipper_id, warehouse_id, MAX(billed_on) as billed_on        
              FROM bills #{shipper_id.present? ? " WHERE shipper_id = '#{shipper_id}'" : ''}
              GROUP BY shipper_id, warehouse_id
            )  t on bills.shipper_id = t.shipper_id AND bills.warehouse_id = t.warehouse_id AND bills.billed_on=t.billed_on
          ) latest_bill on latest_bill.id = bill_amounts.bill_id
        ) latest_bill_amounts ON latest_bill_amounts.lot_number = current_bill_amounts.lot_number AND latest_bill_amounts.product_id = current_bill_amounts.product_id
    SQL

    if page.present? && limit.present?
      query += " LIMIT #{limit} OFFSET #{page}"
    end
puts "==================prepare_bill_amounts================="
puts query
    find_by_sql(query)
  }
  scope :prepare_bill_amounts_20, -> (from_date = nil, to_date = nil, shipper_id = nil, warehouse_id = nil, page = nil, limit = nil) {
    query = <<-SQL
      SELECT  current_bill_amounts.*, COALESCE(latest_bill_amounts.current_stock_amount, 0) as previous_stock_amount, 
        (COALESCE(latest_bill_amounts.current_stock_amount, 0)+
        COALESCE(current_bill_amounts.first_half_instock_amount, 0)+
        COALESCE(current_bill_amounts.mid_instock_amount,0)+
        COALESCE(current_bill_amounts.second_half_instock_amount,0)-
         COALESCE(current_bill_amounts.first_half_outstock_amount,0)-
         COALESCE(current_bill_amounts.mid_outstock_amount,0)-
         COALESCE(current_bill_amounts.second_half_outstock_amount,0)) as current_stock_amount,

         (COALESCE(latest_bill_amounts.current_stock_amount, 0)+
         COALESCE(current_bill_amounts.first_half_instock_amount,0)+

         COALESCE(latest_bill_amounts.current_stock_amount,0)+
         COALESCE(current_bill_amounts.first_half_instock_amount,0)-
         COALESCE(current_bill_amounts.first_half_outstock_amount,0)+
         COALESCE(current_bill_amounts.mid_instock_amount,0)+

         COALESCE(latest_bill_amounts.current_stock_amount,0)+
         COALESCE(current_bill_amounts.first_half_instock_amount,0)-
         COALESCE(current_bill_amounts.first_half_outstock_amount,0)+
         COALESCE(current_bill_amounts.mid_instock_amount,0)-
         COALESCE(current_bill_amounts.second_half_instock_amount,0)) as total_inout_stock_amount
      FROM (
        SELECT stock_id, MIN(lot_number) as lot_number, products.name as product_name, products.id as product_id,
        SUM(CASE WHEN category = 0 AND DAY(inout_on) >= 21 AND DAY(inout_on) <= 31 THEN stock_inouts.amount ELSE 0 END) as first_half_instock_amount,
        SUM(CASE WHEN category = 1 AND DAY(inout_on) >= 21 AND DAY(inout_on) <= 31 THEN stock_inouts.amount ELSE 0 END) as first_half_outstock_amount,
        SUM(CASE WHEN category = 0 AND DAY(inout_on) >= 1 AND DAY(inout_on) <= 10 THEN stock_inouts.amount ELSE 0 END) as mid_instock_amount,
        SUM(CASE WHEN category = 1 AND DAY(inout_on) >= 1 AND DAY(inout_on) <= 10 THEN stock_inouts.amount ELSE 0 END) as mid_outstock_amount,
        SUM(CASE WHEN category = 0 AND DAY(inout_on) >= 11 AND DAY(inout_on) <= 20 THEN stock_inouts.amount ELSE 0 END) as second_half_instock_amount,
        SUM(CASE WHEN category = 1 AND DAY(inout_on) >= 11 AND DAY(inout_on) <= 20 THEN stock_inouts.amount ELSE 0 END) as second_half_outstock_amount,
        -- SUM(CASE WHEN category = 0 THEN amount ELSE 0 END) - SUM(CASE WHEN category = 1 THEN amount ELSE 0 END) as stock_amount
        MAX(stock_inouts.handling_fee_rate) AS handle_fee_rate, MAX(stock_inouts.storage_fee_rate) AS storage_fee_rate

        FROM stock_inouts
        JOIN stocks on stocks.id = stock_inouts.stock_id
        JOIN products on products.id = stocks.product_id
        WHERE inout_on BETWEEN '#{from_date}' AND '#{to_date}' AND is_billed = 0  #{shipper_id.present? ? " AND shipper_id = '#{shipper_id}'" : ''} #{warehouse_id.present? ? " AND warehouse_id = '#{warehouse_id}'" : ''}
        GROUP BY stock_id, lot_number
      ) current_bill_amounts
      LEFT JOIN (
        SELECT bill_amounts.*
        FROM bill_amounts 
          JOIN (
            SELECT bills.id
						FROM bills
            join  (
              SELECT shipper_id, warehouse_id, MAX(billed_on) as billed_on        
              FROM bills #{shipper_id.present? ? " WHERE shipper_id = '#{shipper_id}'" : ''}
              GROUP BY shipper_id, warehouse_id
            )  t on bills.shipper_id = t.shipper_id AND bills.warehouse_id = t.warehouse_id AND bills.billed_on=t.billed_on
          ) latest_bill on latest_bill.id = bill_amounts.bill_id
      ) latest_bill_amounts ON latest_bill_amounts.lot_number = current_bill_amounts.lot_number AND latest_bill_amounts.product_id = current_bill_amounts.product_id
    SQL

    if page.present? && limit.present?
      query += " LIMIT #{limit} OFFSET #{page}"
    end

    find_by_sql(query)
  }
  scope :get_prepare_bill, -> (from_date = nil, to_date = nil, shipper_id = nil, warehouse_id = nil, page = nil, limit = nil) {
    query = <<-SQL
      SELECT  SUM(bill_amount) AS current_amount, 
              SUM(storage_fee) AS storage_cost, 
              SUM(received_payments_amount) AS deposit_amount, 
              SUM(last_bill_amount) AS last_amount, 
              SUM(handling_cost_sum) AS handling_cost, 
              SUM(bill_amount*0.1) AS tax
      FROM (
        SELECT *, (CASE
        WHEN last_bill_amount IS NULL THEN received_payments_amount + handling_cost_sum + in_stock_amount - out_stock_amount
        ELSE last_bill_amount - received_payments_amount + handling_cost_sum + in_stock_amount - out_stock_amount
      END) AS bill_amount, 1 as group_by_flag
      FROM (
        SELECT ((in_stock_amount * storage_fee_rate * DATEDIFF('#{to_date}', in_stock_date)) - (out_stock_amount * storage_fee_rate * DATEDIFF('#{to_date}', out_stock_date))) as storage_fee,
          stock_t.product_id, stock_t.stock_id, stocks.total_amount * warehouse_fees.handling_fee_rate as handling_cost,
          received_payments_amount, stock_t.shipper_id, bills.last_amount as last_bill_amount, handling_cost_sum, in_stock_amount, out_stock_amount, shipper_name, product_name, shipper_code   
        FROM (
          SELECT shipper_id, stock_inouts.stock_id as stock_id, MIN(inout_on) as inout_on, product_id,
            MIN(CASE WHEN category = 0 THEN inout_on ELSE CURRENT_DATE END) AS in_stock_date,       
            MIN(CASE WHEN category = 1 THEN inout_on ELSE CURRENT_DATE END) AS out_stock_date,      
            SUM(CASE WHEN category = 0 THEN amount ELSE 0 END) AS in_stock_amount,
            SUM(CASE WHEN category = 1 THEN amount ELSE 0 END) AS out_stock_amount, 
						shippers.name as shipper_name, 
						shippers.code as shipper_code, 
						products.name as product_name, 
						SUM(stock_inouts.amount * handling_fee_rate) AS handling_cost_sum
          FROM stock_inouts
          JOIN stocks ON stocks.id = stock_inouts.stock_id
          JOIN products ON products.id = stocks.product_id
          JOIN shippers ON shippers.id = stocks.shipper_id
          WHERE inout_on BETWEEN '#{from_date}' AND '#{to_date}' #{shipper_id.present? ? " AND shipper_id = '#{shipper_id}'" : ''} #{warehouse_id.present? ? " AND warehouse_id = '#{warehouse_id}'" : ''}
          GROUP BY stock_id, shipper_id
        ) stock_t
        JOIN stocks on stocks.id = stock_t.stock_id 
        JOIN products on products.id = stock_t.product_id
        JOIN warehouse_fees ON warehouse_fees.id = products.warehouse_fee_id 
        LEFT JOIN (
          SELECT shipper_id, SUM(amount) as received_payments_amount
          FROM received_payments 
          WHERE received_on BETWEEN '#{from_date}' AND '#{to_date}'  #{shipper_id.present? ? " AND shipper_id = '#{shipper_id}'" : ''}
          GROUP BY shipper_id
        ) rp on rp.shipper_id = stock_t.shipper_id
        LEFT JOIN bills on bills.shipper_id = stock_t.shipper_id
      ) t
      ) s group by group_by_flag
    SQL

    find_by_sql(query)
  }

  scope :get_uncalc_bills ,-> (from_date, to_date, shipper_id=nil, warehouse_id=nil, page = nil, limit = nil) {
    sql = <<-SQL
    SELECT (COALESCE(in_stock_amount,0)*DATEDIFF('#{to_date}', in_stock_date)-COALESCE(out_stock_amount,0)*DATEDIFF('#{to_date}',out_stock_date)) as storage_cost, 
			handle_cost, tt.shipper_id, COALESCE(received_payment_amount,0) as deposit_amount,
        COALESCE(previous_bill_amount,0) AS previous_bill_amount, 
				COALESCE(previous_bill_amount,0)-COALESCE(received_payment_amount,0)+COALESCE(handle_cost,0)+(COALESCE(in_stock_amount,0)*DATEDIFF('#{to_date}',in_stock_date))-(COALESCE(out_stock_amount,0)*DATEDIFF('#{to_date}', out_stock_date)) as current_bill_amount,
        shippers.name as shipper_name, shippers.code as shipper_code 
      FROM (
      SELECT SUM(amount*handling_fee_rate) as handle_cost,
              MIN(CASE WHEN category = 0 THEN inout_on ELSE CURRENT_DATE END) AS in_stock_date,
              MIN(CASE WHEN category = 1 THEN inout_on ELSE CURRENT_DATE END) AS out_stock_date,
              SUM(CASE WHEN category = 0 THEN amount ELSE 0 END) AS in_stock_amount,
              SUM(CASE WHEN category = 1 THEN amount ELSE 0 END) AS out_stock_amount, MIN(shipper_id) AS shipper_id
      FROM (
        SELECT stocks.product_id, stock_inouts.*, shipper_id
        FROM stock_inouts
        JOIN stocks ON stocks.id = stock_inouts.stock_id
        WHERE inout_on BETWEEN '#{from_date}' AND '#{to_date}'  AND is_billed=0 #{shipper_id.present? ? " AND shipper_id = '#{shipper_id}'" : ''} #{warehouse_id.present? ? " AND warehouse_id = '#{warehouse_id}'" : ''}
      ) t
      GROUP BY shipper_id
      ) tt
      LEFT JOIN (
        SELECT shipper_id, SUM(amount) as received_payment_amount
        FROM received_payments
        WHERE received_on BETWEEN '#{from_date}' AND '#{to_date}' #{shipper_id.present? ? " AND shipper_id = '#{shipper_id}'" : ''}

        GROUP BY shipper_id
        ) received_payments ON received_payments.shipper_id= tt.shipper_id
      LEFT JOIN (
        SELECT TBL_B.current_amount as previous_bill_amount, shipper_id
        FROM bills AS TBL_B
        JOIN (
            SELECT MAX(billed_on) AS max_billed_on, shipper_id AS max_shipper_id
            FROM bills #{shipper_id.present? ? " WHERE shipper_id = '#{shipper_id}'" : ''}
            GROUP BY shipper_id
        ) AS TBL_A
        ON TBL_A.max_billed_on = TBL_B.billed_on AND TBL_A.max_shipper_id = TBL_B.shipper_id
      ) bills on bills.shipper_id = tt.shipper_id
      LEFT JOIN shippers ON shippers.id = tt.shipper_id
    SQL

     if page.present? && limit.present?
      sql += " LIMIT #{limit} OFFSET #{page}"
    end

    puts "==============uncalcu bills============="
    puts sql
    find_by_sql(sql)

  }
end