class BillAmount < ApplicationRecord
  scope :with_product, -> (bill_id) {
    query = <<-SQL
      SELECT bill_amounts.*, products.name as product_name, products.code as product_code, products.specification
      FROM bill_amounts
      JOIN products ON products.id = bill_amounts.product_id
      JOIN warehouse_fees on warehouse_fees.id = products.warehouse_fee_id
      WHERE bill_id = #{bill_id}
      SQL
    find_by_sql(query)
  }
  scope :with_product_by_duration, -> (from_date, to_date, warehouse_id) {
    query = <<-SQL
      SELECT bill_amounts.*, products.name as product_name, products.code as product_code, products.specification
      FROM bill_amounts
      JOIN products ON products.id = bill_amounts.product_id
      JOIN warehouse_fees on warehouse_fees.id = products.warehouse_fee_id
      WHERE duration_from='#{from_date}' AND duration_to='#{to_date}' AND warehouse_id='#{warehouse_id}'
      SQL
    find_by_sql(query)
  }
end
