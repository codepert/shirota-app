class Bill < ApplicationRecord
  belongs_to :shipper
  scope :desc, -> { order(id: :desc) }
  scope :with_bill_amount_cnt, -> (billed_on) {

    query = <<-SQL
      SELECT CONCAT(duration_from, '~', duration_to) AS duration, cnt, billed_on, shippers.name as shipper_name, bills.id, bills.closing_date, shipper_id
      FROM bills
      LEFT JOIN (
        SELECT count(id) as cnt, bill_id
        FROM bill_amounts
        GROUP BY bill_id
      ) bill_amounts ON bills.id = bill_amounts.bill_id
      LEFT JOIN shippers on shippers.id = bills.shipper_id
      WHERE billed_on = '#{billed_on}'
    SQL
    find_by_sql(query)

  }

  
end
