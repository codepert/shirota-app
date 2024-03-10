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
      resources :pages
      resources :warehouses
      resources :warehouse_fees
      resources :shippers
      resources :products
      get "products_by" => "products#show_by"
      get "product_in_stock" => "products#show_with_stock"
      # resources :stocks
      resources :stock_inouts
      post "stock_in" => "stock_inouts#stock_in"
      post "stock_out" => "stock_inouts#stock_out"
      resources :received_payments
      # resources :bills
      # resources :bill_amounts
    end
  end
  root 'components#index'  
  get '/*path', to: 'components#index'

end
