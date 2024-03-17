class Api::V1::BillAmountsController < Api::V1::BaseController
  before_action :authenticate_user!

end
