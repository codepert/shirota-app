class StockInout < ApplicationRecord
  belongs_to :stock

  scope :with_lot_num_amount_for_product, -> (product_id) {
    sql = <<~SQL
              SELECT
                MIN(stock_inouts.id) as id,
                stock_id,
                lot_number,
                MIN(inout_on) AS inout_on,
                (
                SUM( CASE WHEN category = 0 THEN amount ELSE 0 END ) - SUM( CASE WHEN category = 1 THEN amount ELSE 0 END )) AS amount ,
                MIN(weight) AS weight, category
              FROM
                stock_inouts 
                JOIN stocks on stocks.id = stock_inouts.stock_id
                JOIN products on products.id = stocks.product_id
                WHERE product_id = #{product_id} AND category = 0
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
end
