class TaxRateSerializer
  include Alba::Resource
  attributes :id, :ab_date, :tax_type, :tax_rate
end
