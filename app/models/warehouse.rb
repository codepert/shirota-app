class Warehouse < ApplicationRecord
  belongs_to :responsible_category
  has_many :stock
end
