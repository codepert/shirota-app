class Api::V1::StocksController < Api::V1::BaseController
  before_action :authenticate_user!
  
end
