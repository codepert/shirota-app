Rails.application.routes.draw do
  
  devise_for :users, path: '', path_names: {
    sign_in: 'login',
    sign_out: 'logout',
    registration: 'signup'
  },
  controllers: {
    sessions: 'api/v1/users/sessions',
    registrations: 'api/v1/users/registrations'
  }
  
  namespace :api, format: "json" do
    namespace :v1 do
      # resources :authorities
      resources :users do
        patch :inititialize_password, on: :member
      end
      resources :user_authorities
      resources :authority_pages
      post "set_authority_pages"  => "authority_pages#create_or_update"
      resources :pages
      resources :warehouses
      resources :warehouse_fees
      resources :shippers
      resources :products
      get "products_by" => "products#show_by"
      get "product_in_stock" => "products#show_with_stock"
      resources :stocks
      resources :stock_inouts
      get "inventory" => "stock_inouts#inventory"
      get "check_stock_in" => "stock_inouts#check_stock_in"
      post "stock_in" => "stock_inouts#stock_in"
      post "export_stock_in_csv" => "stock_inouts#export_stock_in_csv"
      post "stock_out" => "stock_inouts#stock_out"
      get "uncalc_bills" => "stock_inouts#uncalc_bills"
      get "export_stock_csv" => "stock_inouts#export_stock_csv"
      post "export_stock_inout_pdf" => "stock_inouts#export_stock_inout_pdf"
      resources :received_payments
      get "received_payments_csv_export" => "received_payments#csv_export"
      resources :bills
      get "last_bill_date" => "bills#last_bill_date"
      post "export_bill_report" => "bills#export_bill_report"
      post "export_bill_amount_report" => "bills#export_bill_amount_report"
      post "export_bills_report" => "bills#export_bills_report"
      resources :responsible_category, only: %i[index]
      resources :warehouse_categories
      
      # resources :bill_amounts
    end
  end
  root 'components#index'  
  get '/*path', to: 'components#index'

end
