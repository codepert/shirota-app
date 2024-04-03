class Api::V1::ProductsController < Api::V1::BaseController
  before_action :authenticate_user!

  require 'grover'
  require 'csv'
  
  set_pagination_callback :products, [:index]

  def index
    q  = Product.ransack({ name_cont: params[:keyword] }.merge(code_cont: params[:keyword]))
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
  def show
    product = Product.find(params[:id])
    render json: ProductSerializer.new(product), status: :ok
  end
  def show_by
    if params[:q].present?
      product = Product.where("code like '%" + params[:q] + "%' or name like '%" + params[:q] + "%'")
      render json:  ProductSerializer.new(product)
    end
  end
  def show_with_stock
    q = params[:q]
    shipper_id = params[:shipper_id]
    warehouse_id = params[:warehouse_id]

    product = Product.joins(:stock)
                    .where(
                      "(code LIKE :q OR name LIKE :q) AND shipper_id = :shipper_id AND stocks.warehouse_id = :warehouse_id",
                      q: "%#{params[:q]}%",
                      shipper_id: params[:shipper_id],
                      warehouse_id: params[:warehouse_id]
                    )
                    
                    

    if product.present?
      in_stock = StockInout.with_lot_num_amount_for_product(product[0].id)

      render json: {
        product: ProductSerializer.new(product),
        in_stock: in_stock 
      }
    else
      render :json => {
        product: {} ,
        in_stock: {},
      }
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
    params.permit(:name, :code, :warehouse_fee_id, :warehouse_id, :specification)
  end
end
