class StockInoutSerializer
  include Alba::Resource
  attributes :id, :stock_id, :inout_on, :amount, :handling_fee_rate, :storage_fee_rate, :lot_number, :weight
  one :stock, serializer: StockSerializer
  
end
