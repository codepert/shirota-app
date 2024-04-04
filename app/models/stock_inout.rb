class StockInout < ApplicationRecord
  belongs_to :stock

  scope :with_lot_num_amount_for_product, -> (product_id, shipper_id, warehouse_id) {
    sql = <<~SQL
              SELECT
                MIN(stock_inouts.id) as id,
                stock_id,
                lot_number,
                MIN(weight) as weight,
                MIN(inout_on) AS inout_on,
                (
                SUM( CASE WHEN category = 0 THEN amount ELSE 0 END ) - SUM( CASE WHEN category = 1 THEN amount ELSE 0 END )) AS amount ,
                MIN(weight) AS weight, category,
                MIN(warehouse_category_id) as warehouse_category_id
              FROM
                stock_inouts 
                JOIN stocks on stocks.id = stock_inouts.stock_id
                JOIN products on products.id = stocks.product_id
                WHERE product_id = #{product_id} AND category = 0 AND shipper_id='#{shipper_id}' AND stocks.warehouse_id='#{warehouse_id}'
              GROUP BY stock_id, lot_number 
    SQL
    find_by_sql(sql)

  }

  scope :inventory, -> (shipper_id, warehouse_id, out_date) {
      sql = <<~SQL
       SELECT 
          stock_id, products.name as product_name, stock_inouts.lot_number, shippers.name as shippper_name, products.specification, 
          SUM(CASE WHEN category = 0 THEN amount ELSE 0 END) - SUM(CASE WHEN category = 1 THEN amount ELSE 0 END) as stock_amount,
          warehouse_fees.packaging,
          warehouses.name as warehouse_name,
          max(stock_inouts.weight) as weight, 
          MIN(CASE  WHEN category = 0 THEN inout_on ELSE null END) as inout_on
      FROM 
          stock_inouts
      JOIN 
          stocks ON stocks.id = stock_inouts.stock_id
      JOIN products ON products.id = stocks.product_id
      JOIN shippers ON shippers.id = stocks.shipper_id
      JOIN warehouses ON warehouses.id = stocks.warehouse_id
      JOIN warehouse_fees ON warehouse_fees.id = products.warehouse_fee_id
      WHERE 
          inout_on <= '#{out_date}' #{shipper_id.present? ? " AND shipper_id = '#{shipper_id}'" : ''} #{warehouse_id.present? ? " AND warehouse_id = '#{warehouse_id}'" : ''}
      GROUP BY 
          stock_id, lot_number
    SQL

     ActiveRecord::Base.connection.select_all(ActiveRecord::Base.send(:sanitize_sql_array, [sql, shipper_id, warehouse_id, out_date]))
  }
  scope :prepare_bill_amounts, -> (from_date, to_date, shipper_id, warehouse_id) {
    query = <<-SQL
        SELECT product_id, lot_number,
            SUM(CASE 
                WHEN category = 0 AND DAY(inout_on) >= 1 AND DAY(inout_on) <= 10 
                THEN amount 
                ELSE NULL 
            END) AS first_half_instock_amount,
            SUM(CASE 
                WHEN category = 0 AND DAY(inout_on) >= 11 AND DAY(inout_on) <= 20 
                THEN amount 
                ELSE NULL 
            END) AS mid_instock_amount,
            SUM(CASE 
                WHEN category = 0 AND DAY(inout_on) >= 21 AND DAY(inout_on) <= 31 
                THEN amount 
                ELSE NULL 
            END) AS second_half_instock_amount,

            SUM(CASE 
                WHEN category = 1 AND DAY(inout_on) >= 1 AND DAY(inout_on) <= 10 
                THEN amount 
                ELSE NULL 
            END) AS first_half_outstock_amount,
            SUM(CASE 
                WHEN category = 1 AND DAY(inout_on) >= 11 AND DAY(inout_on) <= 20 
                THEN amount 
                ELSE NULL 
            END) AS mid_outstock_amount,
            SUM(CASE 
                WHEN category = 1 AND DAY(inout_on) >= 21 AND DAY(inout_on) <= 31 
                THEN amount 
                ELSE NULL 
            END) AS second_half_outstock_amount
            FROM stock_inouts
            JOIN stocks ON stocks.id = stock_inouts.stock_id
            WHERE inout_on BETWEEN '#{from_date}' and '#{to_date}' 
            AND warehouse_id = #{warehouse_id}
            AND shipper_id= #{shipper_id}
            GROUP BY product_id, lot_number
    SQL

    find_by_sql(query)

  }
  scope :get_export_data, ->(inout_on, category) {
    query = <<-SQL
    SELECT  warehouses.name as warehouse_name, 
            inout_on, 
            products.code as product_code, 
            products.name as product_name, 
            products.specification, 
            lot_number, 
            stock_inouts.weight, 
            amount
    FROM stock_inouts
    JOIN stocks on stocks.id = stock_inouts.stock_id
    JOIN products ON products.id = stocks.product_id
    JOIN warehouses ON warehouses.id=products.warehouse_id
    WHERE inout_on ='#{inout_on}' AND category='#{category}'
    SQL
    find_by_sql(query)
  }
  scope :get_in_stock_edit_data, -> (shipper_id, warehouse_id, inout_on) {
    query = <<-SQL
      SELECT stock_inouts.id, 
            stock_id, 
            inout_on, 
            products.code as product_code,
            products.name as product_name, 
            stocks.product_id,
            lot_number, 
            weight, 
            amount, 
            stock_inouts.storage_fee_rate,
            stock_inouts.handling_fee_rate,
            warehouse_fees.packaging as product_type,
            stock_inouts.category,
            stock_inouts.warehouse_category_id,
            warehouse_categories.storage_category as warehouse_category_name
      FROM stock_inouts
      JOIN stocks on stocks.id = stock_inouts.stock_id
      JOIN products ON products.id = stocks.product_id
      JOIN warehouse_fees ON warehouse_fees.id = products.warehouse_fee_id
      JOIN warehouse_categories ON warehouse_categories.id = stock_inouts.warehouse_category_id
      WHERE inout_on ='#{inout_on}' AND shipper_id='#{shipper_id}' AND stocks.warehouse_id='#{warehouse_id}' AND is_billed='0'
    SQL
    find_by_sql(query)
  }
  scope :get_out_stock_edit_data, -> (shipper_id, warehouse_id, inout_on) {
    query = <<-SQL
      SELECT stock_inouts.id, 
            stock_inouts.stock_id, 
            in_stock_date,
            inout_on, 
            products.code as product_code,
            products.name as product_name, 
            stocks.product_id,
            lot_number, 
            weight, 
            stock_amount,
            amount, 
            stock_inouts.storage_fee_rate,
            stock_inouts.handling_fee_rate,
            warehouse_fees.packaging as product_type,
            stock_inouts.category,
            stock_inouts.warehouse_category_id,
            warehouse_categories.storage_category as warehouse_category_name
      FROM stock_inouts
      JOIN stocks on stocks.id = stock_inouts.stock_id
      JOIN products ON products.id = stocks.product_id
      JOIN warehouse_fees ON warehouse_fees.id = products.warehouse_fee_id
      JOIN warehouse_categories ON warehouse_categories.id = stock_inouts.warehouse_category_id
      LEFT JOIN (
        SELECT 
          MIN(inout_on) as in_stock_date,
          SUM(CASE WHEN category = 0 THEN amount ELSE 0 END) - SUM(CASE WHEN category = 1 THEN amount ELSE 0 END) AS stock_amount,
          stock_id
        FROM stock_inouts
        WHERE inout_on = '#{inout_on}' AND is_billed = '0'
        GROUP BY stock_id
      ) stock_amount ON stock_amount.stock_id = stock_inouts.stock_id
      WHERE inout_on ='#{inout_on}' AND shipper_id='#{shipper_id}' AND stocks.warehouse_id='#{warehouse_id}' AND is_billed='0' AND stock_inouts.category = 1
    SQL
    find_by_sql(query)
  }
end
