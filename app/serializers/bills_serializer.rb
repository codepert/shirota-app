class BillsSerializer
  include Alba::Resource
  attributes :id, :closing_date, :billed_on, :duration_from, :duration_to
  one :shipper
end
