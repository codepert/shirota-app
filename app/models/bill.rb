class Bill < ApplicationRecord
  include Paginatable

  belongs_to :shipper
  belongs_to :warehouse
  
  scope :desc, -> { order(id: :desc) }
  
  scope :with_shipper_by_id, -> (bill_id) {
    select("shippers.name as shipper_name, shippers.post_code as shipper_post_code, shippers.main_address as shipper_main_address, bills.*")
      .joins('LEFT JOIN shippers ON shippers.id= bills.shipper_id')
      .where('bills.id', bill_id)
  }
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
  def self.ransackable_attributes(_auth_object = nil)
    # %w[
    #   name
    #   code
    #   warehouse_fee_id
    #   specification
    # ]
    ["warehouse_id", "shipper_id", "duration_from", "duration_to"]
  end
  def self.ransackable_associations(_auth_object = nil)
    %w[shipper]
  end
end
