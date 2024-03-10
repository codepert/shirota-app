class StockSerializer
  include Alba::Resource
  attributes :id, :warehouse_id, :shipper_id, :product_id, :total_amount
end
