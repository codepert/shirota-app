class Api::V1::WarehousesController < Api::V1::BaseController
  def index
    render json: WarehouseSerializer.new(Warehouse.all).serialize
  end

  def create
    warehouse = Warehouse.new(create_or_update_params)
    if warehouse.save
      render json: WarehouseSerializer.new(warehouse), status: :created
    else
      render json: {
        error: warehouse.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end

  def update
    warehouse = Warehouse.find(params[:id])
    if warehouse.update(create_or_update_params)
      render json: WarehouseSerializer.new(warehouse), status: :ok
    else
       render json: {
        error: warehouse.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end

  def destroy
    warehouse = Warehouse.find(params[:id])
    if warehouse.destroy
      head :no_content
    else
      render json: {
        error: warehouse.errors.full_messages.join("\n")
      }, status: :unprocessable_entity
    end
  end
  def create_or_update_params
    params.permit(:name)
  end
end
