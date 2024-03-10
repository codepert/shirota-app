class StockInout < ApplicationRecord
  belongs_to :stock

  scope :with_lot_num_amount_for_product, -> (product_id) {
    select("stock_inouts.id, stock_inouts.stock_id, stock_inouts.lot_number, stock_inouts.inout_on, COALESCE(stock_amount.amount, 0) as amount, weight")
    .joins(stock: :product)
    .joins("LEFT JOIN (SELECT stock_id, lot_number, 
            (SUM(CASE WHEN category = 0 THEN amount ELSE 0 END) - SUM(CASE WHEN category = 1 THEN amount ELSE 0 END)) AS amount 
            FROM stock_inouts GROUP BY stock_id, lot_number) stock_amount ON stock_amount.lot_number = stock_inouts.lot_number")
    .where("products.id = ? AND stock_inouts.category = 0", product_id)
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
end
