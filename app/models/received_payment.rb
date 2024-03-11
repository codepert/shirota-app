class ReceivedPayment < ApplicationRecord
  include Paginatable
  belongs_to :shipper
  scope :with_shipper, ->() {
    joins(:shipper)
  }
  def self.ransackable_attributes(_auth_object = nil)
    %w[
      shipper_id
      received_on
      amount
      description
      processing_on
      received
    ]
  end
  def self.ransackable_associations(_auth_object = nil)
    %w[shipper]
  end
end
