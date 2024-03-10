class Stock < ApplicationRecord
  has_many :stock_inout
  belongs_to :product
end
