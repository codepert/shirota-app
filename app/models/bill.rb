class Bill < ApplicationRecord
  scope :desc, -> { order(id: :desc) }
end
