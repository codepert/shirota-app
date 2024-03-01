class Product < ApplicationRecord
  include Paginatable
  belongs_to :warehouse_fee
  # scope: where_name, -> (name) { 
  #   where(name != "" ? "name ILIKE ?", "%#{name}%" : "1=1")
  # }
  def self.ransackable_attributes(_auth_object = nil)
    # %w[
    #   name
    #   code
    #   warehouse_fee_id
    #   specification
    # ]
    ["code", "created_at", "id", "id_value", "name", "specification", "updated_at", "warehouse_fee_id"]
  end
  def self.ransackable_associations(_auth_object = nil)
    %w[warehouse_fee]
  end
  
end
