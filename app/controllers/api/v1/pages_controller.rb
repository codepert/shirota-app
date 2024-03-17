class Api::V1::PagesController <  Api::V1::BaseController
  before_action :authenticate_user!
  def index
    render json: PageSerializer.new(Page.all).serialize
  end
end
