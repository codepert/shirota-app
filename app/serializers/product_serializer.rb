class ProductSerializer
  include Alba::Resource
  attributes :id, :name, :code, :warehouse_fee_id, :warehouse_id, :specification
  # attributes :warehouse_fee
  one :warehouse_fee, serializer: WarehouseFeeSerializer
  one :stock, serializer: StockSerializer
  one :warehouse, serializer: WarehouseSerializer
end
