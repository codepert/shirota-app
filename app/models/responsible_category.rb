class ResponsibleCategory < ApplicationRecord
  has_many :warehouse
  has_many :users
end
