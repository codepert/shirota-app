class ProductSerializer
  include Alba::Resource
  attributes :id, :name, :code, :warehouse_fee_id, :specification, :weight, :warehouse_id
  # attributes :warehouse_fee
  one :warehouse_fee, serializer: WarehouseFeeSerializer
  one :stock, serializer: StockSerializer

end
