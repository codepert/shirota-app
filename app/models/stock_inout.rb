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
      WITH inventory_summary AS (
        SELECT
          si.*,
          stocks.product_id,
          products.`name`,
          warehouse_fees.packaging
        FROM
          (
            SELECT
              inventory_in.lot_number,
              inventory_in.stock_id,
              (
                COALESCE ( inventory_in.in_amount, 0 ) - COALESCE ( inventory_out.out_amount, 0 )) AS inventory_stock 
            FROM
              (
                SELECT
                  lot_number,
                  stock_id,
                  SUM( amount ) AS in_amount
                FROM
                  stock_inouts
                  JOIN stocks ON stocks.id = stock_inouts.stock_id 
                WHERE
                  category = 0  #{shipper_id.present? ? "And shipper_id = '#{shipper_id}'" : ''}  #{warehouse_id.present? ? "And warehouse_id = '#{warehouse_id}'" : ''}
                GROUP BY
                  lot_number,
                  stock_id 
              ) AS inventory_in
          LEFT JOIN (
            SELECT
              lot_number,
              stock_id,
              SUM( amount ) AS out_amount
            FROM
              stock_inouts
            WHERE
              category = 1 #{out_date.present? ? "And inout_on <= '#{out_date}'" : ''}
            GROUP BY
              stock_id,
              lot_number
          ) AS inventory_out ON inventory_out.stock_id = inventory_in.stock_id
                            AND inventory_out.lot_number = inventory_in.lot_number
          ) si
          JOIN stocks on stocks.id = si.stock_id
          JOIN products on products.id = stocks.product_id
          JOIN warehouse_fees ON warehouse_fees.id = products.warehouse_fee_id
      )
      SELECT t.*, inouton.inout_on, inouton.weight
      FROM (
        SELECT * FROM inventory_summary
      ) t
      JOIN (
        SELECT * FROM stock_inouts WHERE category = 0
      ) inouton ON inouton.stock_id = t.stock_id AND inouton.lot_number = t.lot_number
      ORDER BY t.stock_id, t.lot_number
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
