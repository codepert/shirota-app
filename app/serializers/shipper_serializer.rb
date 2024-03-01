class ShipperSerializer
  include Alba::Resource
  attributes :id, :name, :code, :post_code, :main_address, :sub_address, :tel, :closing_date
end
