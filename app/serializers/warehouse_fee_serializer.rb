class WarehouseFeeSerializer
  include Alba::Resource
  attributes :id, :code, :packaging, :handling_fee_rate, :storage_fee_rate, :fee_category
end
