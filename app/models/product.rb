class Product < ApplicationRecord
  include Paginatable

  # scope: where_name, -> (name) { 
  #   where(name != "" ? "name ILIKE ?", "%#{name}%" : "1=1")
  # }
  
end
