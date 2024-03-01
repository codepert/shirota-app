class Api::V1::ProductsController < Api::V1::BaseController
  require 'grover'
  require 'csv'
  
  set_pagination_callback :products, [:index]

  def index
    q  = Product.ransack(params[:keyword])
    @products = q.result().paginate(pagination_params)
   
    render json: ProductSerializer.new(@products)
  end

  def create
    product = Product.new(create_or_update_params)
    if product.save
      render json: ProductSerializer.new(product), status: :created
    else
      render json: {
        error: product.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  
  def update
    product = Product.find(params[:id])
    if product.update(create_or_update_params)
      render json: ProductSerializer.new(product), status: :ok
    else
       render json: {
        error: product.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end

  def destroy
    product = Product.find(params[:id])
    if product.destroy
      head :no_content
    else
      render json: {
        error: product.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  
  def create_or_update_params
    params.permit(:name, :code, :warehouse_fee_id, :specification)
  end
end
