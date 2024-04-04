class WarehouseCategorySerializer
  include Alba::Resource
  attributes :id, :storage_category, :warehouse_id
end
