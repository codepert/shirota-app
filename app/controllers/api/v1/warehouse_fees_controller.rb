class Api::V1::WarehouseFeesController < Api::V1::BaseController
  def index
    render json: WarehouseFeeSerializer.new(WarehouseFee.all)
  end
  def create
    warehouseFee = WarehouseFee.new(create_or_update_params)
    if warehouseFee.save
      render json: WarehouseFeeSerializer.new(warehouseFee), status: :created
    else
      render json: {
        error: warehouseFee.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def update
    warehouseFee = WarehouseFee.find(params[:id])
    if warehouseFee.update(create_or_update_params)
      render json: WarehouseFeeSerializer.new(warehouseFee), status: :ok
    else
       render json: {
        error: warehouseFee.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end

  end
  def destroy
    warehouseFee = WarehouseFee.find(params[:id])
    if warehouseFee.destroy
      head :no_content
    else
      render json: {
        error: warehouseFee.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end

  end
  def create_or_update_params
    params.permit(:code, :packaging, :handling_fee_rate, :storage_fee_rate, :fee_category)
  end
end
