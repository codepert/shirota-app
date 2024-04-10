class ManagementInfoSerializer
  include Alba::Resource
  attributes :id, :company_name, :post_code, :address1, :address2, :representative, :tel_number, :fax_number, :start_date, :end_date, :processing_year,  :processing_month, :installation_location, :invoice_number, :register_number
end