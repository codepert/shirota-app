class Api::V1::WarehouseCategoriesController < Api::V1::BaseController
  def index
    render json: WarehouseCategorySerializer.new(WarehouseCategory.where(warehouse_id: params[:warehouse_id]))
  end
end

