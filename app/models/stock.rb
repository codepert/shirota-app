# app/models/stock_inout.rb
class Stock < ApplicationRecord
  has_many :stock_inout
  belongs_to :product
  scope :prepare_bill_amounts, -> (from_date = nil, to_date = nil, shipper_id = nil, warehouse_id = nil, page = nil, limit = nil) {
    query = <<-SQL
      SELECT *, (CASE
        WHEN last_bill_amount IS NULL THEN received_payments_amount + handling_cost_sum + in_stock_amount - out_stock_amount
        ELSE last_bill_amount - received_payments_amount + handling_cost_sum + in_stock_amount - out_stock_amount
      END) AS bill_amount, shipper_name, product_name, shipper_code
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
          WHERE inout_on BETWEEN '#{from_date}' AND '#{to_date}' AND shipper_id = #{shipper_id} AND warehouse_id = #{warehouse_id}
          GROUP BY stock_id, shipper_id
        ) stock_t
        JOIN stocks on stocks.id = stock_t.stock_id 
        JOIN products on products.id = stock_t.product_id
        JOIN warehouse_fees ON warehouse_fees.id = products.warehouse_fee_id 
        LEFT JOIN (
          SELECT shipper_id, SUM(amount) as received_payments_amount
          FROM received_payments 
          WHERE received_on BETWEEN '#{from_date}' AND '#{to_date}' AND shipper_id = #{shipper_id}
          GROUP BY shipper_id
        ) rp on rp.shipper_id = stock_t.shipper_id
        LEFT JOIN bills on bills.shipper_id = stock_t.shipper_id
      ) t
    SQL

    if page.present? && limit.present?
      query += " LIMIT #{limit} OFFSET #{page}"
    end

    puts query
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
          WHERE inout_on BETWEEN '#{from_date}' AND '#{to_date}' AND shipper_id = #{shipper_id} AND warehouse_id = #{warehouse_id}
          GROUP BY stock_id, shipper_id
        ) stock_t
        JOIN stocks on stocks.id = stock_t.stock_id 
        JOIN products on products.id = stock_t.product_id
        JOIN warehouse_fees ON warehouse_fees.id = products.warehouse_fee_id 
        LEFT JOIN (
          SELECT shipper_id, SUM(amount) as received_payments_amount
          FROM received_payments 
          WHERE received_on BETWEEN '#{from_date}' AND '#{to_date}' AND shipper_id = #{shipper_id}
          GROUP BY shipper_id
        ) rp on rp.shipper_id = stock_t.shipper_id
        LEFT JOIN bills on bills.shipper_id = stock_t.shipper_id
      ) t
      ) s group by group_by_flag
    SQL
puts "===================================================================="
    find_by_sql(query)
  }
end