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
end
