class WarehouseSerializer
  include Alba::Resource
  attributes :id, :name
  one :responsible_category, serializer: ResponsibleCategorySerializer
end
