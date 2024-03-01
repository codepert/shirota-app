class ReceivedPaymentSerializer
  include Alba::Resource
  attributes :id, :received_on, :amount, :description, :processing_on, :received_on
  one :shipper
end
