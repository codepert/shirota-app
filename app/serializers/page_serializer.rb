class PageSerializer
  include Alba::Resource
  attributes :id, :name, :path, :parent_id
end
