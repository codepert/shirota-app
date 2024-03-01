Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  root 'components#index'

  devise_for :users, path: '', path_names: {
    sign_in: 'login',
    sign_out: 'logout',
    registration: 'signup'
  }
  # controllers: {
  #   sessions: 'users/sessions',
  #   registrations: 'users/registrations'
  # }

  namespace :api, format: "json" do
    namespace :v1 do
      resources :authorities
      resources :user_authorities
      resources :authority_pages
      resources :warehouses
      resources :warehouse_fees
      resources :shippers
      resources :products
      resources :stocks
      resources :stock_inouts
      resources :receive_payments
      resources :bills
      resources :bill_amounts
    end
  end

end
