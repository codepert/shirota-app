class Api::V1::UserAuthoritiesController < Api::V1::BaseController
  def index
    render json: UserAuthoritySerializer.new(UserAuthority.all)
  end
end
