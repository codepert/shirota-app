class Api::V1::ShippersController < Api::V1::BaseController
  def index
    render json: ShipperSerializer.new(Shipper.all)
  end
  def create
    shipper = Shipper.new(create_or_update_params)
    if shipper.save
      render json: ShipperSerializer.new(shipper), status: :created
    else
      render json: {
        error: shipper.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def update
    shipper = Shipper.find(params[:id])
    if shipper.update(create_or_update_params)
      render json: ShipperSerializer.new(shipper), status: :ok
    else
       render json: {
        error: shipper.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def destroy
    shipper = Shipper.find(params[:id])
    if shipper.destroy
      head :no_content
    else
      render json: {
        error: shipper.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  private
  def create_or_update_params
    params.permit(:name, :code, :post_code, :main_address, :sub_address, :tel, :closing_date)
  end
end
