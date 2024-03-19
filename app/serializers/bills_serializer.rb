class BillsSerializer
  include Alba::Resource
  attributes :id, :closing_date, :billed_on, :duration_from, :duration_to, 
             :last_amount, :current_amount, :deposit_amount, :handling_cost, :storage_cost, :tax, :processing_cnt, :created_at
  one :shipper, serializer: ShipperSerializer 
end
