class Api::V1::UserAuthoritiesController < Api::V1::BaseController
  before_action :authenticate_user!

  def index
    render json: UserAuthoritySerializer.new(UserAuthority.all)
  end
end
