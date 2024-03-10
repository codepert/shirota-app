class Api::V1::PagesController <  Api::V1::BaseController
  def index
    render json: PageSerializer.new(Page.all).serialize
  end
end
