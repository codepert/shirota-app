class Api::V1::AuthoritiesController < BaseController
  before_action :authenticate_user!

end
