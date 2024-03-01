class Api::V1::ProductsController < Api::V1::BaseController
  require 'grover'
  require 'csv'

  def index
    # products = Product.includes(:warehouse_fee)
    # products = products.where_name(index_params[:keyword])
    # count = products.count
    # products.paginate(pagination_params)
    # filtered_products = products.offset(offset).limit(limit)
   
    # render json: {
      # data: products.map { |product| ProductSerializer.new(product).as_json },
      # count: count,
      # status: :accepted

    # }
  end
  def index_params
    params.permit(:keyword)
  end
end
